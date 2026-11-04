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
} from 'lucide-react';

export const App: React.FC = () => {
  const { language, t, dir } = useI18n();
  const isAr = language === 'ar';

  // Main Application Mode: 'home' (Landing chooser) | 'sales' | 'inventory'
  // Reads ?mode=sales or ?mode=inventory from URL for Googlebot & deep-linking
  const [appMode, setAppMode] = useState<AppMode>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const modeParam = params.get('mode');
      if (modeParam === 'sales' || modeParam === 'inventory') {
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
    } else {
      document.title = isAr
        ? 'DataSolu BI Pro | منصة تحليل المبيعات والمخزون والأصناف الأكثر مبيعاً من الإكسيل'
        : 'DataSolu BI Pro | Smart Sales & Inventory Excel Analytics Platform';
    }
  }, [appMode, isAr]);

  // TWO COMPLETELY SEPARATE WORKBOOKS: one for Sales Analysis, one for Inventory Analysis
  const [salesWorkbook, setSalesWorkbook] = useState<WorkbookData | null>(() =>
    getSampleSalesData('ar')
  );
  const [inventoryWorkbook, setInventoryWorkbook] = useState<WorkbookData | null>(() =>
    getSampleInventoryData('ar')
  );

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  // Update default sample workbooks when language toggles (only if user hasn't uploaded a custom file)
  useEffect(() => {
    if (
      salesWorkbook &&
      (salesWorkbook.fileName.includes('sales_') ||
        salesWorkbook.fileName.includes('تقرير_مبيعات_الأعمال'))
    ) {
      setSalesWorkbook(getSampleSalesData(language));
    }
    if (
      inventoryWorkbook &&
      (inventoryWorkbook.fileName.includes('inventory_') ||
        inventoryWorkbook.fileName.includes('شيت_جرد_وحركة_المخزون'))
    ) {
      setInventoryWorkbook(getSampleInventoryData(language));
    }
  }, [language]);

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

  useEffect(() => {
    if (activeSalesSheet) {
      setSalesMapping(autoDetectSalesMapping(activeSalesSheet.columns));
    }
  }, [activeSalesSheet]);

  // Dynamic calculations for Sales Mode (respecting salesMapping)
  const kpis = useMemo(() => {
    if (!activeSalesSheet) return [];
    return computeKpiMetrics(activeSalesSheet, language, salesMapping);
  }, [activeSalesSheet, language, salesMapping]);

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
            VIEW 1: MAIN LANDING GATEWAY (اختيار تحليل المبيعات أو تحليل المخزون)
           ===================================================================== */}
        {appMode === 'home' && (
          <div className="space-y-10 py-2">
            {/* Hero Welcome Section */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-100 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 text-xs font-extrabold border border-brand-200 dark:border-brand-800">
                <Sparkles className="w-4 h-4 text-brand-500" />
                <span>
                  {isAr
                    ? 'منصة DataSolu الذكية — ملفات مستقلة وتخصيص كامل للأعمدة'
                    : 'DataSolu BI Pro — Independent Workspaces & Smart Column Mapping'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {isAr
                  ? 'اختر نوع التحليل الذي ترغب في العمل عليه الآن'
                  : 'Choose Your Analytics Workspace'}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {isAr
                  ? 'تم فصل قسم تحليل المبيعات عن قسم تحليل المخزون والأصناف بحيث يمكنك رفع ملف إكسيل مستقل لكل قسم مع خطوة ربط الأعمدة (Column Mapping) الخاصة به.'
                  : 'Sales Analysis and Inventory Analysis operate with completely separate Excel files and tailored column mapping workflows.'}
              </p>
            </div>

            {/* Dual Choice Cards: Sales Analysis vs Inventory Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* OPTION 1: SALES ANALYSIS CARD (تحليل المبيعات) */}
              <div
                onClick={() => {
                  setAppMode('sales');
                  setActiveTab('dashboard');
                }}
                className="cursor-pointer group relative rounded-3xl bg-white dark:bg-slate-800/90 border-2 border-emerald-500/30 hover:border-emerald-500 dark:border-emerald-500/30 dark:hover:border-emerald-400 p-7 sm:p-8 shadow-lg hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute -top-24 -end-24 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

                <div className="space-y-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-8 h-8" />
                    </div>
                    <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {isAr ? 'ملف مبيعات مستقل' : 'Dedicated Sales File'}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {isAr
                        ? '1. قسم تحليل المبيعات والأداء المالي'
                        : '1. Sales & Financial Performance Analysis'}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                      {isAr
                        ? 'ارفع ملف المبيعات الخاص بك، وقم بربط الأعمدة (الإيرادات، الأرباح، التكلفة، الفئات، الفروع، العملاء) لاستخراج نقاط القوة والضعف والمقترحات التنفيذية لزيادة المبيعات.'
                        : 'Upload your sales Excel sheet, map revenue/profit/category/region columns, and uncover strengths, weaknesses, and actionable sales growth proposals.'}
                    </p>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/70">
                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                      <Settings2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>
                        {isAr
                          ? 'خطوة Mapping مخصصة لأعمدة المبيعات والأرباح والفروع والعملاء'
                          : 'Dedicated Column Mapping for Revenue, Profit, Branches & Clients'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>
                        {isAr
                          ? 'تحديد نقاط القوة ونقاط الضعف والفجوات البيعية بدقة'
                          : 'Automated diagnosis of Sales Strengths & Weaknesses'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                      <Rocket className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>
                        {isAr
                          ? 'مقترحات عملية قابلة للتطبيق لتحسين المبيعات وتعظيم الربحية'
                          : 'Actionable recommendations to boost sales & expand margins'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>
                        {isAr
                          ? 'مقارنة الفترات والشهور والرسوم البيانية التفاعلية'
                          : 'Period comparisons, trend charts & interactive pivot tables'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {salesWorkbook
                      ? `${isAr ? 'الملف الحالي:' : 'Active:'} ${salesWorkbook.fileName}`
                      : isAr
                      ? 'جاهز لرفع ملف المبيعات'
                      : 'Ready for Sales upload'}
                  </span>
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 group-hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-emerald-600/20 transition-all">
                    <span>{isAr ? 'الدخول لتحليل المبيعات' : 'Open Sales Analysis'}</span>
                    {dir === 'rtl' ? (
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    ) : (
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    )}
                  </span>
                </div>
              </div>

              {/* OPTION 2: INVENTORY & PRODUCT VELOCITY CARD (تحليل المخزون والأصناف) */}
              <div
                onClick={() => {
                  setAppMode('inventory');
                  setActiveTab('inventory_main');
                }}
                className="cursor-pointer group relative rounded-3xl bg-white dark:bg-slate-800/90 border-2 border-amber-500/40 hover:border-amber-500 dark:border-amber-500/30 dark:hover:border-amber-400 p-7 sm:p-8 shadow-lg hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute -top-24 -end-24 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />

                <div className="space-y-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                      <Package className="w-8 h-8" />
                    </div>
                    <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      {isAr ? 'ملف مخزون وأصناف مستقل' : 'Dedicated Inventory File'}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {isAr
                        ? '2. قسم تحليل المخزون والأصناف الأكثر مبيعاً'
                        : '2. Inventory, Best-Sellers & King Items Analysis'}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                      {isAr
                        ? 'ارفع ملف الأصناف والمخزون المستقل، وحدد فترة المبيعات بالأيام لتصنيف الأصناف (سريعة، متوسطة، ضعيفة)، واكتشاف الأصناف الكينج، واقتراح الكميات المطلوب توفيرها.'
                        : 'Upload your separate inventory/SKU sheet, set the sales period duration in days, classify Fast/Medium/Slow movers, find King Items, and compute restock quantities.'}
                    </p>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/70">
                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                      <Settings2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span>
                        {isAr
                          ? 'خطوة Mapping لأعمدة اسم الصنف، القسم، الكمية المباعة، الرصيد، والربح'
                          : 'Column Mapping for SKU Name, Category, Sold Qty, Stock & Profit'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                      <Crown className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span>
                        {isAr
                          ? 'اكتشاف "الأصناف الكينج" (الأسرع حركة والأعلى ربحية) وتصنيف ABC'
                          : 'Identify "King Items" (Fast-moving + Top Profit) & ABC Velocity'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span>
                        {isAr
                          ? 'تحديد فترة المبيعات يدوياً بالأيام لو الملف بدون تاريخ لحساب المتوسطات بدقة'
                          : 'Manual sales period days input when file has no date column'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                      <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span>
                        {isAr
                          ? 'اقتراح الكميات الواجب توفيرها من كل صنف وتصدير خطة التوريد Excel'
                          : 'Suggested replenishment quantities & 1-click Excel order export'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {inventoryWorkbook
                      ? `${isAr ? 'الملف الحالي:' : 'Active:'} ${inventoryWorkbook.fileName}`
                      : isAr
                      ? 'جاهز لرفع ملف المخزون'
                      : 'Ready for Inventory upload'}
                  </span>
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 group-hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-extrabold shadow-md shadow-amber-500/20 transition-all">
                    <span>{isAr ? 'الدخول لتحليل المخزون والأصناف' : 'Open Inventory Analysis'}</span>
                    {dir === 'rtl' ? (
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    ) : (
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            VIEW 2: SALES ANALYSIS WORKSPACE (قسم تحليل المبيعات بملف مستقل)
           ===================================================================== */}
        {appMode === 'sales' && (
          <div className="space-y-8">
            {/* Independent Sales File Upload & Sheet Selector */}
            <section>
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
              <div id="dashboard-export-area" className="space-y-8">
                {/* 1. Sales Column Mapping + Strengths, Weaknesses & Improvement Proposals */}
                {(activeTab === 'dashboard' || activeTab === 'swot') && (
                  <section>
                    <SalesMappingAndSwot
                      sheet={activeSalesSheet}
                      mapping={salesMapping}
                      setMapping={setSalesMapping}
                    />
                  </section>
                )}

                {/* 2. Executive Summary KPIs */}
                {(activeTab === 'dashboard' || activeTab === 'charts') && (
                  <section className="space-y-3">
                    <KpiCards metrics={kpis} />
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
            {/* Independent Inventory File Upload & Sheet Selector */}
            <section>
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
              <div id="dashboard-export-area" className="space-y-8">
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
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-6 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-200">DataSolu</span>
            <span>-</span>
            <span>{t.app.tagline}</span>
          </div>
          <div>
            <span>
              {isAr
                ? 'جميع البيانات تعالج محلياً داخل جهازك بأمان 100%'
                : 'All data processed locally & securely'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default App;
