import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { FileUpload } from './components/FileUpload';
import { KpiCards } from './components/KpiCards';
import { BusinessStatusOverview } from './components/BusinessStatusOverview';
import { ChartsSection } from './components/ChartsSection';
import { PeriodComparison } from './components/PeriodComparison';
import { CustomChartBuilder } from './components/CustomChartBuilder';
import { SmartInsightsCard } from './components/SmartInsightsCard';
import { DataTable } from './components/DataTable';
import { PivotTable } from './components/PivotTable';
import { ProductInventoryAnalysis } from './components/ProductInventoryAnalysis';
import { SalesMappingAndSwot } from './components/SalesMappingAndSwot';
import { SalesTargetAndComparisonPanel } from './components/SalesTargetAndComparisonPanel';
import { StockMarketAnalysis } from './components/StockMarketAnalysis';
import { useI18n } from './locales/i18nContext';
import { AppMode, SalesColumnMapping, WorkbookData } from './types';
import {
  computeKpiMetrics,
  computeBusinessStatus,
  autoDetectSalesMapping,
} from './utils/analyticsEngine';
import { generateBusinessInsights } from './utils/insightsGenerator';
import { getSampleSalesData, getSampleInventoryData } from './utils/sampleData';
import { exportDashboardToPdf } from './utils/pdfExporter';
import {
  CURRENCY_OPTIONS,
  SupportedCurrency,
  getSectionCurrency,
  setSectionCurrency,
} from './utils/currencyManager';
import { APP_VERSION } from './constants/version';
import {
  Sparkles,
  TrendingUp,
  Package,
  Crown,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Rocket,
  Settings2,
  FileSpreadsheet,
  CandlestickChart,
  ShieldAlert,
  Wallet,
  Compass,
  Lock,
  Trash2,
} from 'lucide-react';

export const App: React.FC = () => {
  const { language, t, dir } = useI18n();
  const isAr = language === 'ar';

  // Main Application Mode: 'home' (Landing chooser) | 'sales' | 'inventory' | 'stocks'
  // Reads ?mode=sales or ?mode=inventory or ?mode=stocks from URL for Googlebot & deep-linking
  const [appMode, setAppMode] = useState<AppMode>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const modeParam = params.get('mode');
      if (modeParam === 'sales' || modeParam === 'inventory' || modeParam === 'stocks') {
        return modeParam;
      }
    }
    return 'home';
  });

  // Synchronize URL query parameter, Document Title & Meta Description for SEO / Google Search Console
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    if (appMode === 'home') {
      url.searchParams.delete('mode');
    } else {
      url.searchParams.set('mode', appMode);
    }
    window.history.replaceState({}, '', url.toString());

    const metaDesc = document.querySelector('meta[name="description"]');
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute(
        'href',
        appMode === 'home'
          ? 'https://data.ahesolu.com/'
          : `https://data.ahesolu.com/?mode=${appMode}`
      );
    }

    if (appMode === 'sales') {
      document.title = isAr
        ? 'تحليل المبيعات ونقاط القوة والضعف | DataSolu BI Pro'
        : 'Sales Analysis, SWOT & Growth Proposals | DataSolu BI Pro';
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          isAr
            ? 'قسم تحليل المبيعات والأداء المالي من ملفات الإكسيل: ربط أعمدة المبيعات والأرباح، تشخيص نقاط القوة والضعف، ومقترحات عملية لزيادة المبيعات.'
            : 'Sales & financial performance analysis from Excel files: column mapping, SWOT strengths & weaknesses diagnosis, and actionable revenue growth tips.'
        );
      }
    } else if (appMode === 'inventory') {
      document.title = isAr
        ? 'تحليل المخزون والأصناف الأكثر مبيعاً والأصناف الكينج | DataSolu BI Pro'
        : 'Inventory, Best-Sellers, King Items & Restock Analysis | DataSolu BI Pro';
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          isAr
            ? 'قسم تحليل المخزون وحركة الأصناف من الإكسيل: تحديد فترة المبيعات، تصنيف الأصناف السريعة والمتوسطة والضعيفة، اكتشاف الأصناف الكينج، واقتراح كميات التوريد.'
            : 'Inventory & SKU velocity analysis from Excel: manual or date period duration, ABC fast/medium/slow classification, King Items, and suggested order quantities.'
        );
      }
    } else if (appMode === 'stocks') {
      document.title = isAr
        ? 'تحليل البورصة وإدارة المحفظة والخطط الاسترشادية | DataSolu BI Pro'
        : 'Stock Market Analysis, Portfolio Tracker & Trade Plans | DataSolu BI Pro';
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          isAr
            ? 'منصة تحليل البورصة الاسترشادية المتكاملة: ترشيحات الموقع المفضلة، الرأي الشخصي، تتبع شراء وبيع الأسهم بالمحفظة، وبناء الخطط المحتملة والسيناريوهات (للاسترشاد فقط بدون توصيات).'
            : 'Integrated Stock Market Guidance Platform: Featured picks, personal thesis notes, buy/sell portfolio tracking, and risk-managed trade plans (for guidance only).'
        );
      }
    } else {
      document.title = isAr
        ? 'DataSolu BI Pro | منصة تحليل المبيعات والمخزون والبورصة المتكاملة'
        : 'DataSolu BI Pro | Smart Sales, Inventory & Stock Market Analytics Platform';
    }
  }, [appMode, isAr]);

  // TWO COMPLETELY SEPARATE WORKBOOKS: Start 100% EMPTY (no simulation data on open).
  // Only restores what the user previously uploaded and saved in internal localStorage.
  const [salesWorkbook, setSalesWorkbook] = useState<WorkbookData | null>(() => {
    try {
      const saved = localStorage.getItem('datasolu_sales_internal_v2');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  const [inventoryWorkbook, setInventoryWorkbook] = useState<WorkbookData | null>(() => {
    try {
      const saved = localStorage.getItem('datasolu_inventory_internal_v2');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  // Persist user-uploaded Sales & Inventory workbooks to internal browser storage
  useEffect(() => {
    try {
      if (salesWorkbook) {
        localStorage.setItem('datasolu_sales_internal_v2', JSON.stringify(salesWorkbook));
      } else {
        localStorage.removeItem('datasolu_sales_internal_v2');
      }
    } catch {
      // ignore quota errors for very large files
    }
  }, [salesWorkbook]);

  useEffect(() => {
    try {
      if (inventoryWorkbook) {
        localStorage.setItem('datasolu_inventory_internal_v2', JSON.stringify(inventoryWorkbook));
      } else {
        localStorage.removeItem('datasolu_inventory_internal_v2');
      }
    } catch {
      // ignore quota errors for very large files
    }
  }, [inventoryWorkbook]);

  // Active Sheet for Sales Mode
  const activeSalesSheet = useMemo(() => {
    if (!salesWorkbook || !salesWorkbook.activeSheet) return null;
    return salesWorkbook.sheets[salesWorkbook.activeSheet] || null;
  }, [salesWorkbook]);

  // Active Sheet for Inventory Mode
  const activeInventorySheet = useMemo(() => {
    if (!inventoryWorkbook || !inventoryWorkbook.activeSheet) return null;
    return inventoryWorkbook.sheets[inventoryWorkbook.activeSheet] || null;
  }, [inventoryWorkbook]);

  // Sales Column Mapping State (auto-detected whenever activeSalesSheet changes)
  const [salesMapping, setSalesMapping] = useState<SalesColumnMapping>(() =>
    activeSalesSheet
      ? autoDetectSalesMapping(activeSalesSheet.columns)
      : {
          revenueCol: '',
          profitCol: '',
          costCol: '',
          qtyCol: '',
          categoryCol: '',
          regionCol: '',
          clientCol: '',
          salespersonCol: '',
          dateCol: '',
          statusCol: '',
        }
  );

  // Independent per-section currencies (Sales vs Inventory)
  const [salesCurrency, setSalesCurrencyState] = useState<SupportedCurrency>(() =>
    getSectionCurrency('sales', 'SAR')
  );
  const [inventoryCurrency, setInventoryCurrencyState] = useState<SupportedCurrency>(() =>
    getSectionCurrency('inventory', 'SAR')
  );

  const handleSalesCurrencyChange = (curr: SupportedCurrency) => {
    setSectionCurrency('sales', curr);
    setSalesCurrencyState(curr);
  };

  const handleInventoryCurrencyChange = (curr: SupportedCurrency) => {
    setSectionCurrency('inventory', curr);
    setInventoryCurrencyState(curr);
  };

  useEffect(() => {
    if (activeSalesSheet) {
      const detected = autoDetectSalesMapping(activeSalesSheet.columns);
      try {
        const savedRaw = localStorage.getItem('datasolu_sales_mapping_v1');
        if (savedRaw) {
          const saved = JSON.parse(savedRaw) as Partial<SalesColumnMapping>;
          const colNames = new Set(activeSalesSheet.columns.map((c) => c.name));
          const merged: SalesColumnMapping = { ...detected };
          const colKeys = [
            'revenueCol',
            'profitCol',
            'costCol',
            'qtyCol',
            'categoryCol',
            'regionCol',
            'clientCol',
            'salespersonCol',
            'dateCol',
            'statusCol',
          ] as const;
          colKeys.forEach((k) => {
            const candidate = saved[k];
            if (candidate && colNames.has(candidate)) {
              merged[k] = candidate;
            }
          });
          if (saved.revenueType) merged.revenueType = saved.revenueType;
          if (saved.costType) merged.costType = saved.costType;
          setSalesMapping(merged);
          return;
        }
      } catch {
        // ignore storage errors
      }
      setSalesMapping(detected);
    }
  }, [activeSalesSheet]);

  const handleUpdateSalesMapping = React.useCallback(
    (updater: React.SetStateAction<SalesColumnMapping>) => {
      setSalesMapping((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        try {
          localStorage.setItem('datasolu_sales_mapping_v1', JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    []
  );

  // Dynamic calculations for Sales Mode (respecting salesMapping & salesCurrency)
  const kpis = useMemo(() => {
    if (!activeSalesSheet) return [];
    return computeKpiMetrics(activeSalesSheet, language, salesMapping);
  }, [activeSalesSheet, language, salesMapping, salesCurrency]);

  const businessStatus = useMemo(() => {
    if (!activeSalesSheet) {
      return {
        overallHealthScore: 80,
        statusCounts: [],
        targetAchievedPercent: 80,
        totalVolume: 0,
        completionRate: 0,
      };
    }
    return computeBusinessStatus(activeSalesSheet, language);
  }, [activeSalesSheet, language]);

  const insights = useMemo(() => {
    if (!activeSalesSheet) return [];
    return generateBusinessInsights(activeSalesSheet, language);
  }, [activeSalesSheet, language]);

  const handleSalesSheetChange = (sheetName: string) => {
    if (!salesWorkbook) return;
    setSalesWorkbook({
      ...salesWorkbook,
      activeSheet: sheetName,
    });
  };

  const handleInventorySheetChange = (sheetName: string) => {
    if (!inventoryWorkbook) return;
    setInventoryWorkbook({
      ...inventoryWorkbook,
      activeSheet: sheetName,
    });
  };

  const currentWorkbook = appMode === 'inventory' ? inventoryWorkbook : salesWorkbook;

  const handleExportPdf = async () => {
    try {
      setIsExporting(true);
      setExportMessage(t.export.generatingPdf);
      await exportDashboardToPdf(
        'dashboard-export-area',
        `${currentWorkbook?.fileName || appMode}_analytics_report.pdf`
      );
      setExportMessage(t.export.success);
      setTimeout(() => setExportMessage(null), 3500);
    } catch (error) {
      console.error(error);
      setExportMessage(
        isAr
          ? 'فشل تصدير التقرير، يرجى المحاولة لاحقاً'
          : 'Export failed, please try again'
      );
      setTimeout(() => setExportMessage(null), 3500);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200 flex flex-col font-cairo">
      {/* Top Navigation */}
      <Navbar
        appMode={appMode}
        setAppMode={setAppMode}
        onUploadClick={() => {
          document.getElementById('global-excel-file-input')?.click();
        }}
        onLoadSample={() => {
          if (appMode === 'inventory') {
            setInventoryWorkbook(getSampleInventoryData(language));
          } else {
            setSalesWorkbook(getSampleSalesData(language));
          }
        }}
        onExportPdf={handleExportPdf}
        hasData={!!currentWorkbook}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Export status notification banner */}
      {exportMessage && (
        <div className="sticky top-16 z-40 bg-brand-600 text-white text-xs font-semibold py-2.5 px-4 text-center shadow-md flex items-center justify-center gap-2 transition-all">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>{exportMessage}</span>
        </div>
      )}

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
        {/* =====================================================================
            VIEW 1: MAIN LANDING GATEWAY (منصة التحليلات البيانية الذكية القابلة للتوسع)
           ===================================================================== */}
        {appMode === 'home' && (
          <div className="space-y-8 py-1">
            {/* Hero Welcome Section */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-100 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 text-xs font-extrabold border border-brand-200 dark:border-brand-800">
                  <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                  <span>
                    {isAr
                      ? 'منصة DataSolu للتحليلات البيانية الذكية'
                      : 'DataSolu Modular Data Analytics Platform'}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {isAr
                      ? 'معالجة وحفظ محلي 100% على جهازك'
                      : '100% Local Processing & Storage'}
                  </span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {isAr
                  ? 'اختر وحدة التحليلات للبدء فوراً'
                  : 'Select Your Analytics Module'}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                {isAr
                  ? 'منصة موحدة لتحليل البيانات المالية والتشغيلية والأسواق، مصممة بمرونة لإضافة وحدات تحليلية متخصصة مع حفظ محلي مستقل لكل قسم.'
                  : 'A unified, extensible analytics suite for financial, operational, and market data with independent local storage per module.'}
              </p>
            </div>

            {/* Unified Analytics Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* MODULE 1: SALES ANALYSIS CARD (تحليل المبيعات والأداء المالي) */}
              <div
                onClick={() => {
                  setAppMode('sales');
                  setActiveTab('dashboard');
                }}
                className="cursor-pointer group relative rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 hover:border-brand-500 dark:hover:border-brand-400 p-6 shadow-sm hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-600/25 group-hover:scale-105 transition-transform">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                      {salesWorkbook
                        ? `${isAr ? 'نشط:' : 'Active:'} ${salesWorkbook.fileName.slice(0, 18)}`
                        : isAr
                        ? 'تحليلات تجارية ومالية'
                        : 'Commercial & Financial'}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {isAr
                        ? 'تحليلات المبيعات والأداء المالي'
                        : 'Sales & Financial Analytics'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                      {isAr
                        ? 'تحليل الإيرادات والأرباح والفروع والعملاء وتشخيص نقاط القوة والضعف والمقترحات.'
                        : 'Analyze revenue, profit, branches, clients, SWOT diagnosis, and growth targets.'}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                      <Settings2 className="w-4 h-4 text-brand-500 flex-shrink-0" />
                      <span>
                        {isAr
                          ? 'ربط ذكي للأعمدة وحفظ الإعدادات تلقائياً'
                          : 'Smart column mapping with auto-saved preferences'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                      <ShieldCheck className="w-4 h-4 text-brand-500 flex-shrink-0" />
                      <span>
                        {isAr
                          ? 'تشخيص SWOT الآلي ومقترحات نمو المبيعات'
                          : 'Automated SWOT diagnosis & growth proposals'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                      <FileSpreadsheet className="w-4 h-4 text-brand-500 flex-shrink-0" />
                      <span>
                        {isAr
                          ? 'أهداف شهرية، مقارنة فترات، وجداول محورية'
                          : 'Monthly targets, period comparisons & pivot tables'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSalesWorkbook(getSampleSalesData(language));
                      setAppMode('sales');
                      setActiveTab('dashboard');
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/70 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Rocket className="w-3.5 h-3.5 text-brand-500" />
                    <span>{isAr ? 'تجربة ببيانات جاهزة' : 'Try Demo Data'}</span>
                  </button>

                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 group-hover:bg-brand-700 text-white text-xs font-extrabold shadow-sm transition-all">
                    <span>{isAr ? 'فتح القسم' : 'Open'}</span>
                    {dir === 'rtl' ? (
                      <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    )}
                  </span>
                </div>
              </div>

              {/* MODULE 2: INVENTORY & PRODUCT VELOCITY CARD (تحليل المخزون والأصناف) */}
              <div
                onClick={() => {
                  setAppMode('inventory');
                  setActiveTab('inventory_main');
                }}
                className="cursor-pointer group relative rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 hover:border-brand-500 dark:hover:border-brand-400 p-6 shadow-sm hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-600/25 group-hover:scale-105 transition-transform">
                      <Package className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                      {inventoryWorkbook
                        ? `${isAr ? 'نشط:' : 'Active:'} ${inventoryWorkbook.fileName.slice(0, 18)}`
                        : isAr
                        ? 'تحليلات سلاسل الإمداد'
                        : 'Supply Chain & SKUs'}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {isAr
                        ? 'تحليلات المخزون وحركة الأصناف'
                        : 'Inventory & SKU Velocity Analytics'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                      {isAr
                        ? 'تصنيف سرعة دوران الأصناف (ABC)، اكتشاف الأصناف الكينج، وحساب كميات وميزانية التوريد.'
                        : 'Classify ABC SKU velocity, uncover high-profit King Items, and optimize restock orders.'}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                      <Crown className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span>
                        {isAr
                          ? 'اكتشاف الأصناف الكينج (الأسرع حركة والأعلى ربحاً)'
                          : 'Identify King Items (Fastest moving & highest profit)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0" />
                      <span>
                        {isAr
                          ? 'محاكي ميزانية أمر الشراء وترتيب الأولويات تلقائياً'
                          : 'PO budget simulator & automated priority ranking'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                      <Sparkles className="w-4 h-4 text-brand-500 flex-shrink-0" />
                      <span>
                        {isAr
                          ? 'كاشف الرواكد والسيولة المجمدة ومقترح الخصم الآمن'
                          : 'Dead stock capital detector & safe promo discounts'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInventoryWorkbook(getSampleInventoryData(language));
                      setAppMode('inventory');
                      setActiveTab('inventory_main');
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/70 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Rocket className="w-3.5 h-3.5 text-brand-500" />
                    <span>{isAr ? 'تجربة ببيانات جاهزة' : 'Try Demo Data'}</span>
                  </button>

                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 group-hover:bg-brand-700 text-white text-xs font-extrabold shadow-sm transition-all">
                    <span>{isAr ? 'فتح القسم' : 'Open'}</span>
                    {dir === 'rtl' ? (
                      <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    )}
                  </span>
                </div>
              </div>

              {/* MODULE 3: STOCK MARKET & PORTFOLIO INTELLIGENCE CARD (تحليلات الأسواق والمحفظة) */}
              <div
                onClick={() => {
                  setAppMode('stocks');
                  setActiveTab('stocks_overview');
                }}
                className="cursor-pointer group relative rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 hover:border-brand-500 dark:hover:border-brand-400 p-6 shadow-sm hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-200 flex flex-col justify-between overflow-hidden md:col-span-2 lg:col-span-1"
              >
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-600/25 group-hover:scale-105 transition-transform">
                      <CandlestickChart className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                      {isAr ? 'تحليلات الأسواق والمحافظ' : 'Markets & Portfolios'}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {isAr
                        ? 'تحليلات الأسهم وإدارة المحفظة'
                        : 'Stock Market & Portfolio Analytics'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                      {isAr
                        ? 'فحص الأسعار والمؤشرات الفنية، تتبع صفقات المحفظة والتوزيعات، وبناء خطط التداول الاسترشادية.'
                        : 'Live market scanner, technical indicators, multi-currency portfolio tracker, and trade plans.'}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                      <Wallet className="w-4 h-4 text-brand-500 flex-shrink-0" />
                      <span>
                        {isAr
                          ? 'تتبع المحفظة والتوزيعات النقدية وتوحيد العملات'
                          : 'Multi-currency portfolio, P&L & dividends tracker'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                      <Compass className="w-4 h-4 text-brand-500 flex-shrink-0" />
                      <span>
                        {isAr
                          ? 'قرارات استرشادية للأسهم المشتراة ومحاكاة التعديل'
                          : 'Indicator-based candidate decisions & cost simulator'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                      <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span>
                        {isAr
                          ? 'للاسترشاد التحليلي وتنظيم المحفظة بدون توصيات'
                          : 'Analytical guidance only — 100% local storage'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {isAr ? 'تداول • EGX • US • DFM' : 'Tadawul • EGX • US • UAE'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 group-hover:bg-brand-700 text-white text-xs font-extrabold shadow-sm transition-all">
                    <span>{isAr ? 'فتح القسم' : 'Open'}</span>
                    {dir === 'rtl' ? (
                      <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Extensible Analytics Platform Banner (قابلية إضافة وحدات تحليلية جديدة) */}
            <div className="rounded-2xl bg-white dark:bg-slate-800/70 border border-dashed border-slate-300 dark:border-slate-700 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                    {isAr
                      ? 'بنية تحليلات مرنة وقابلة للتوسع (Modular Analytics Architecture)'
                      : 'Extensible Modular Analytics Architecture'}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {isAr
                      ? 'صُممت المنصة لاستيعاب وحدات تحليلية إضافية بنفس الهوية البصرية الموحدة (مثل: تحليلات العملاء والولاء، القوائم والتدفقات المالية، وتحليلات الموارد البشرية).'
                      : 'Built on a unified design system ready to plug in additional analytics modules (Customer Cohorts, Financial Statements, HR & Operations).'}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  {isAr ? '+ تحليلات العملاء' : '+ Customer Analytics'}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  {isAr ? '+ التدفقات المالية' : '+ Cashflow Analytics'}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  {isAr ? '+ تقارير مخصصة' : '+ Custom BI'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            VIEW 2: SALES ANALYSIS WORKSPACE (قسم تحليل المبيعات بملف مستقل)
           ===================================================================== */}
        {appMode === 'sales' && (
          <div className="space-y-8">
            {/* Independent Sales Section Currency Selector & Privacy Bar */}
            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-800/90 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
                    <Lock className="w-3.5 h-3.5" />
                    {isAr ? 'حفظ محلي 100% على جهازك' : '100% Local Storage'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="font-extrabold text-brand-700 dark:text-brand-300">
                      {isAr ? 'عملة القسم:' : 'Currency:'}
                    </span>
                    <select
                      value={salesCurrency}
                      onChange={(e) =>
                        handleSalesCurrencyChange(e.target.value as SupportedCurrency)
                      }
                      className="bg-transparent font-black text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                    >
                      {CURRENCY_OPTIONS.map((c) => (
                        <option
                          key={c.code}
                          value={c.code}
                          className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        >
                          {c.flag} {isAr ? c.nameAr : c.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  {salesWorkbook && (
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            isAr
                              ? 'هل أنت متأكد من مسح بيانات ملف المبيعات الحالي؟'
                              : 'Clear the current Sales workbook data?'
                          )
                        ) {
                          setSalesWorkbook(null);
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isAr ? 'مسح البيانات' : 'Clear Data'}</span>
                    </button>
                  )}
                </div>
              </div>

              <FileUpload
                mode="sales"
                onDataLoaded={(data) => {
                  setSalesWorkbook(data);
                  setActiveTab('dashboard');
                }}
                workbook={salesWorkbook}
                onSheetChange={handleSalesSheetChange}
              />
            </section>

            {activeSalesSheet && (
              <div id="dashboard-export-area" key={salesCurrency} className="space-y-8">
                {/* 1. Sales Column Mapping + Strengths, Weaknesses & Improvement Proposals */}
                {(activeTab === 'dashboard' || activeTab === 'swot') && (
                  <section>
                    <SalesMappingAndSwot
                      sheet={activeSalesSheet}
                      mapping={salesMapping}
                      setMapping={handleUpdateSalesMapping}
                    />
                  </section>
                )}

                {/* 2. Executive Summary KPIs */}
                {(activeTab === 'dashboard' || activeTab === 'charts') && (
                  <section className="space-y-3">
                    <KpiCards metrics={kpis} />
                  </section>
                )}

                {/* 2.5 Monthly Sales & Profit Target Gauge + Period-over-Period File Comparison */}
                {(activeTab === 'dashboard' ||
                  activeTab === 'periods' ||
                  activeTab === 'charts') && (
                  <section>
                    <SalesTargetAndComparisonPanel
                      sheet={activeSalesSheet}
                      mapping={salesMapping}
                    />
                  </section>
                )}

                {/* 3. Business Status & Health Overview */}
                {(activeTab === 'dashboard' || activeTab === 'charts') && (
                  <section>
                    <BusinessStatusOverview statusData={businessStatus} />
                  </section>
                )}

                {/* 4. Time Period Comparison */}
                {(activeTab === 'dashboard' ||
                  activeTab === 'periods' ||
                  activeTab === 'charts') && (
                  <section>
                    <PeriodComparison sheet={activeSalesSheet} />
                  </section>
                )}

                {/* 5. Visual Analytics & Charts Section */}
                {(activeTab === 'dashboard' || activeTab === 'charts') && (
                  <section>
                    <ChartsSection sheet={activeSalesSheet} />
                  </section>
                )}

                {/* 6. Executive Automated Insights */}
                {activeTab === 'dashboard' && (
                  <section>
                    <SmartInsightsCard insights={insights} />
                  </section>
                )}

                {/* 7. Custom Chart Builder */}
                {(activeTab === 'dashboard' || activeTab === 'builder') && (
                  <section>
                    <CustomChartBuilder sheet={activeSalesSheet} />
                  </section>
                )}

                {/* 8. Pivot Table */}
                {(activeTab === 'dashboard' || activeTab === 'pivot') && (
                  <section>
                    <PivotTable sheet={activeSalesSheet} />
                  </section>
                )}

                {/* 9. Detailed Data Table */}
                {(activeTab === 'dashboard' || activeTab === 'table') && (
                  <section>
                    <DataTable sheet={activeSalesSheet} />
                  </section>
                )}
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            VIEW 3: INVENTORY & PRODUCTS WORKSPACE (قسم تحليل المخزون والأصناف بملف مستقل)
           ===================================================================== */}
        {appMode === 'inventory' && (
          <div className="space-y-8">
            {/* Independent Inventory Section Currency Selector & Privacy Bar */}
            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-800/90 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs text-xs">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
                  <Lock className="w-3.5 h-3.5" />
                  {isAr ? 'حفظ محلي 100% على جهازك' : '100% Local Storage'}
                </span>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="font-extrabold text-brand-700 dark:text-brand-300">
                      {isAr ? 'عملة القسم:' : 'Currency:'}
                    </span>
                    <select
                      value={inventoryCurrency}
                      onChange={(e) =>
                        handleInventoryCurrencyChange(e.target.value as SupportedCurrency)
                      }
                      className="bg-transparent font-black text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                    >
                      {CURRENCY_OPTIONS.map((c) => (
                        <option
                          key={c.code}
                          value={c.code}
                          className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        >
                          {c.flag} {isAr ? c.nameAr : c.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  {inventoryWorkbook && (
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            isAr
                              ? 'هل أنت متأكد من مسح بيانات ملف المخزون الحالي؟'
                              : 'Clear the current Inventory workbook data?'
                          )
                        ) {
                          setInventoryWorkbook(null);
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isAr ? 'مسح البيانات' : 'Clear Data'}</span>
                    </button>
                  )}
                </div>
              </div>

              <FileUpload
                mode="inventory"
                onDataLoaded={(data) => {
                  setInventoryWorkbook(data);
                  setActiveTab('inventory_main');
                }}
                workbook={inventoryWorkbook}
                onSheetChange={handleInventorySheetChange}
              />
            </section>

            {activeInventorySheet && (
              <div id="dashboard-export-area" key={inventoryCurrency} className="space-y-8">
                {/* 1. Main Product Velocity, King Items, Manual Period & Restock Engine */}
                {(activeTab === 'inventory_main' || activeTab === 'dashboard') && (
                  <section>
                    <ProductInventoryAnalysis sheet={activeInventorySheet} />
                  </section>
                )}

                {/* 2. Pivot Table for Inventory */}
                {activeTab === 'pivot' && (
                  <section>
                    <PivotTable sheet={activeInventorySheet} />
                  </section>
                )}

                {/* 3. Raw Data Viewer for Inventory */}
                {activeTab === 'table' && (
                  <section>
                    <DataTable sheet={activeInventorySheet} />
                  </section>
                )}
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            VIEW 4: STOCK MARKET & PORTFOLIO INTELLIGENCE WORKSPACE (قسم تحليل البورصة المتكامل)
           ===================================================================== */}
        {appMode === 'stocks' && (
          <div id="dashboard-export-area" className="space-y-8">
            <StockMarketAnalysis
              activeSubTab={activeTab}
              setActiveSubTab={setActiveTab}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-5 pb-20 md:pb-6 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-200">DataSolu</span>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('datasolu:open-changelog'))}
              className="px-2 py-0.5 rounded-full bg-brand-100 hover:bg-brand-200 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-mono text-[10px] font-black transition-colors cursor-pointer"
              title={isAr ? 'عرض سجل التحديثات' : 'View Changelog'}
            >
              {APP_VERSION}
            </button>
            <span>•</span>
            <span>{t.app.tagline}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <span className="font-bold text-emerald-700 dark:text-emerald-400">
              {isAr
                ? '🔒 حفظ ومعالجة محلية 100% على جهازك'
                : '🔒 100% Local Device Storage'}
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-amber-700 dark:text-amber-400 font-semibold">
              {isAr
                ? 'تحليلات الأسهم للاسترشاد الشخصي فقط بدون توصيات'
                : 'Stock analytics for guidance only'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default App;
