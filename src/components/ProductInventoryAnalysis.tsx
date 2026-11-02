import React, { useState, useEffect, useMemo } from 'react';
import {
  Crown,
  Package,
  TrendingUp,
  AlertTriangle,
  Settings2,
  Calendar,
  Search,
  Filter,
  ShoppingCart,
  Flame,
  Gauge,
  Snowflake,
  Download,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Layers,
  DollarSign,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import { useI18n } from '../locales/i18nContext';
import {
  SheetData,
  ProductColumnMapping,
  ItemMovementSpeed,
  RestockUrgency,
} from '../types';
import {
  autoDetectProductMapping,
  analyzeProductsAndInventory,
  formatCurrency,
} from '../utils/analyticsEngine';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ProductInventoryAnalysisProps {
  sheet: SheetData;
}

export const ProductInventoryAnalysis: React.FC<ProductInventoryAnalysisProps> = ({ sheet }) => {
  const { language } = useI18n();
  const isAr = language === 'ar';

  // 1. Column Mapping State (auto-detected on sheet change, customizable by user)
  const [mapping, setMapping] = useState<ProductColumnMapping>(() =>
    autoDetectProductMapping(sheet.columns)
  );
  const [showMappingPanel, setShowMappingPanel] = useState<boolean>(true);
  const [mappingConfirmed, setMappingConfirmed] = useState<boolean>(false);

  // 2. Period & Restock Parameters State
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [targetCoverageDays, setTargetCoverageDays] = useState<number>(30);
  const [safetyStockPercent, setSafetyStockPercent] = useState<number>(20);
  const [defaultPeriodDays, setDefaultPeriodDays] = useState<number>(30);

  // 3. Table Filtering & Sorting State
  const [activeMovementTab, setActiveMovementTab] = useState<'all' | 'king' | 'fast' | 'medium' | 'slow' | 'restock'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'soldQty' | 'revenue' | 'profit' | 'margin' | 'suggestedOrder'>('soldQty');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Re-detect mapping when sheet changes
  useEffect(() => {
    const detected = autoDetectProductMapping(sheet.columns);
    setMapping(detected);
    setStartDate('');
    setEndDate('');
    setCategoryFilter('all');
  }, [sheet]);

  // Run product & inventory analytics engine
  const analysis = useMemo(() => {
    return analyzeProductsAndInventory(
      sheet.rows,
      mapping,
      {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        categoryFilter,
        targetCoverageDays,
        safetyStockPercent,
        defaultPeriodDays,
      },
      language
    );
  }, [
    sheet.rows,
    mapping,
    startDate,
    endDate,
    categoryFilter,
    targetCoverageDays,
    safetyStockPercent,
    defaultPeriodDays,
    language,
  ]);

  const { items, summary, categories, dateBounds } = analysis;

  // King items list (Fast moving + Highest profit)
  const kingItems = useMemo(() => {
    return items
      .filter((i) => i.isKingItem)
      .sort((a, b) => (a.kingRank || 999) - (b.kingRank || 999));
  }, [items]);

  // Filtered & Sorted items for main table
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (activeMovementTab === 'king' && !item.isKingItem) return false;
        if (activeMovementTab === 'fast' && item.movementSpeed !== 'fast') return false;
        if (activeMovementTab === 'medium' && item.movementSpeed !== 'medium') return false;
        if (activeMovementTab === 'slow' && item.movementSpeed !== 'slow') return false;
        if (
          activeMovementTab === 'restock' &&
          item.restockUrgency !== 'critical' &&
          item.restockUrgency !== 'needed'
        ) {
          return false;
        }

        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          return (
            item.itemName.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q)
          );
        }

        return true;
      })
      .sort((a, b) => {
        let valA = 0;
        let valB = 0;
        switch (sortBy) {
          case 'soldQty':
            valA = a.soldQty;
            valB = b.soldQty;
            break;
          case 'revenue':
            valA = a.revenue;
            valB = b.revenue;
            break;
          case 'profit':
            valA = a.profit;
            valB = b.profit;
            break;
          case 'margin':
            valA = a.profitMarginPercent;
            valB = b.profitMarginPercent;
            break;
          case 'suggestedOrder':
            valA = a.suggestedOrderQty;
            valB = b.suggestedOrderQty;
            break;
        }
        return sortOrder === 'desc' ? valB - valA : valA - valB;
      });
  }, [items, activeMovementTab, searchQuery, sortBy, sortOrder]);

  // Export Restock & Analysis Table to Excel
  const handleExportRestockExcel = () => {
    const exportRows = filteredItems.map((item, idx) => ({
      [isAr ? 'م' : '#']: idx + 1,
      [isAr ? 'اسم الصنف' : 'Item Name']: item.itemName,
      [isAr ? 'القسم / الفئة' : 'Category']: item.category,
      [isAr ? 'تصنيف الصنف' : 'Classification']: item.isKingItem
        ? isAr
          ? `👑 صنف كينج (#${item.kingRank})`
          : `👑 King Item (#${item.kingRank})`
        : item.movementSpeed === 'fast'
        ? isAr
          ? 'سريع الحركة'
          : 'Fast Moving'
        : item.movementSpeed === 'medium'
        ? isAr
          ? 'متوسط الحركة'
          : 'Medium Moving'
        : isAr
        ? 'بطيء / ضعيف الحركة'
        : 'Slow Moving',
      [isAr ? 'الكمية المباعة' : 'Sold Qty']: item.soldQty,
      [isAr ? 'معدل السحب اليومي' : 'Daily Run Rate']: item.dailyRunRate,
      ...(mapping.currentStockCol
        ? {
            [isAr ? 'المخزون الحالي' : 'Current Stock']: item.currentStock ?? 0,
            [isAr ? 'أيام التغطية المتبقية' : 'Days Left']:
              item.daysOfInventoryLeft === 999 ? '∞' : item.daysOfInventoryLeft ?? '-',
          }
        : {}),
      [isAr ? 'إجمالي المبيعات' : 'Total Revenue']: item.revenue,
      [isAr ? 'التكلفة' : 'Total Cost']: item.cost,
      [isAr ? 'صافي الربح' : 'Net Profit']: item.profit,
      [isAr ? 'هامش الربح %' : 'Profit Margin %']: `${item.profitMarginPercent}%`,
      [isAr ? 'حالة التوفير' : 'Restock Status']:
        item.restockUrgency === 'critical'
          ? isAr
            ? 'عاجل جداً (أولوية قصوى)'
            : 'Critical Restock'
          : item.restockUrgency === 'needed'
          ? isAr
            ? 'يحتاج توفير'
            : 'Restock Needed'
          : item.restockUrgency === 'overstock'
          ? isAr
            ? 'فائض / راكد'
            : 'Overstock'
          : isAr
          ? 'رصيد كافٍ'
          : 'Sufficient',
      [isAr ? `الكمية المقترح توفيرها (${targetCoverageDays} يوم)` : `Suggested Order Qty (${targetCoverageDays}d)`]:
        item.suggestedOrderQty,
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      ws,
      isAr ? 'تحليل الأصناف وخطة التوريد' : 'Product & Restock Plan'
    );
    XLSX.writeFile(
      wb,
      isAr
        ? `تقرير_الأصناف_وخطة_التوريد_${new Date().toISOString().split('T')[0]}.xlsx`
        : `Product_Velocity_Restock_Plan_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  // Top 8 items chart data (Sold Qty & Profit comparison)
  const topChartData = useMemo(() => {
    const top8 = items.slice(0, 8);
    return {
      labels: top8.map((i) =>
        i.itemName.length > 20 ? i.itemName.slice(0, 20) + '...' : i.itemName
      ),
      datasets: [
        {
          label: isAr ? 'الكمية المباعة' : 'Sold Quantity',
          data: top8.map((i) => i.soldQty),
          backgroundColor: 'rgba(16, 185, 129, 0.85)',
          borderRadius: 8,
          yAxisID: 'y',
        },
        {
          label: isAr ? 'الكمية المقترح توفيرها' : 'Suggested Restock Qty',
          data: top8.map((i) => i.suggestedOrderQty),
          backgroundColor: 'rgba(99, 102, 241, 0.85)',
          borderRadius: 8,
          yAxisID: 'y',
        },
      ],
    };
  }, [items, isAr]);

  const renderMovementBadge = (speed: ItemMovementSpeed, isKing: boolean) => {
    if (isKing) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-700 dark:text-amber-300 border border-amber-400/50 shadow-sm">
          <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          {isAr ? 'صنف كينج (سريع + أعلى ربح)' : 'King Item (Fast + Top Profit)'}
        </span>
      );
    }
    if (speed === 'fast') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <Flame className="w-3.5 h-3.5 text-emerald-500" />
          {isAr ? 'سريع الحركة (فئة A)' : 'Fast Moving (Class A)'}
        </span>
      );
    }
    if (speed === 'medium') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          <Gauge className="w-3.5 h-3.5 text-blue-500" />
          {isAr ? 'متوسط الحركة (فئة B)' : 'Medium Moving (Class B)'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
        <Snowflake className="w-3.5 h-3.5 text-slate-400" />
        {isAr ? 'ضعيف الحركة (فئة C)' : 'Slow Moving (Class C)'}
      </span>
    );
  };

  const renderUrgencyBadge = (urgency: RestockUrgency) => {
    switch (urgency) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            {isAr ? 'عاجل - يجب التوفير فوراً' : 'Critical - Restock Now'}
          </span>
        );
      case 'needed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <ShoppingCart className="w-3.5 h-3.5 text-amber-500" />
            {isAr ? 'يحتاج توفير قريباً' : 'Restock Needed'}
          </span>
        );
      case 'overstock':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            {isAr ? 'فائض بالمخزون (ترويج)' : 'Overstock'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isAr ? 'مخزون آمن' : 'Sufficient'}
          </span>
        );
    }
  };

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(col);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>
                {isAr
                  ? 'محرك تحليل الأصناف والمخزون الذكي (ABC + King Items)'
                  : 'Smart Product Velocity, King Items & Restock Engine'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {isAr
                ? 'متابعة الأصناف الأكثر مبيعاً، الأصناف الكينج، وخطة التوريد المقترحة'
                : 'Best-Sellers Tracking, King Items & Suggested Replenishment Plan'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
              {isAr
                ? 'قم بربط أعمدة ملف الإكسيل (Mapping) وتحديد الفترة الزمنية ليقوم النظام بتصنيف سرعة حركة الأصناف (سريعة، متوسطة، ضعيفة)، واكتشاف الأصناف الكينج (الأسرع مبيعاً والأعلى ربحاً)، وحساب الكميات المطلوب توفيرها بدقة.'
                : 'Map your Excel columns and select a date range to classify item velocity (Fast, Medium, Slow), uncover King Items (Fastest moving & highest profit), and calculate suggested order quantities.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowMappingPanel(!showMappingPanel)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-all"
            >
              <Settings2 className="w-4 h-4 text-amber-400" />
              <span>
                {isAr ? 'إعدادات ربط الأعمدة (Column Mapping)' : 'Column Mapping Setup'}
              </span>
              {showMappingPanel ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={handleExportRestockExcel}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 transition-all hover:scale-105"
            >
              <Download className="w-4 h-4" />
              <span>
                {isAr ? 'تصدير خطة التوريد والأصناف (Excel)' : 'Export Restock Plan (Excel)'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* STEP 1: Interactive Column Mapping & Period Configuration Panel */}
      {showMappingPanel && (
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border-2 border-indigo-500/30 dark:border-indigo-500/40 shadow-md space-y-6 transition-all">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Settings2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {isAr
                      ? 'الخطوة 1: ربط أعمدة ملف الإكسيل (Column Mapping) وإعدادات الفترة'
                      : 'Step 1: Excel Column Mapping & Period Configuration'}
                  </h3>
                  {mappingConfirmed && (
                    <span className="text-[11px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isAr ? 'تم التأكيد' : 'Confirmed'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAr
                    ? 'تم التعرف التلقائي على الأعمدة من ملفك، يمكنك تعديل أي عمود ليتطابق مع مسميات شيت الإكسيل الخاص بك'
                    : 'Columns were auto-detected from your sheet. Adjust any field below to match your Excel structure.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setMapping(autoDetectProductMapping(sheet.columns));
                  setMappingConfirmed(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isAr ? 'إعادة الكشف التلقائي' : 'Auto-Detect'}</span>
              </button>
              <button
                onClick={() => {
                  setMappingConfirmed(true);
                  setShowMappingPanel(false);
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isAr ? 'اعتماد الربط وإخفاء الإعدادات' : 'Confirm & Collapse'}</span>
              </button>
            </div>
          </div>

          {/* Mapping Grid: Item, Category, Quantities, Financials, Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Item Name Column */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
              <label className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-indigo-500" />
                  {isAr ? 'عمود اسم الصنف / المنتج *' : 'Item / Product Name *'}
                </span>
                <span className="text-[10px] text-rose-500 font-extrabold">
                  {isAr ? 'أساسي' : 'Required'}
                </span>
              </label>
              <select
                value={mapping.itemNameCol}
                onChange={(e) => setMapping({ ...mapping, itemNameCol: e.target.value })}
                className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                {sheet.headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Category / Department Column */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
              <label className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-500" />
                  {isAr ? 'عمود القسم / الفئة' : 'Department / Category'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {isAr ? 'اختياري' : 'Optional'}
                </span>
              </label>
              <select
                value={mapping.categoryCol}
                onChange={(e) => setMapping({ ...mapping, categoryCol: e.target.value })}
                className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">{isAr ? '-- بدون عمود قسم --' : '-- None --'}</option>
                {sheet.headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Sold Quantity Column */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
              <label className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <ShoppingCart className="w-3.5 h-3.5 text-emerald-500" />
                  {isAr ? 'عمود الكمية المباعة' : 'Sold Quantity Column'}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  {isAr ? 'كميات' : 'Quantity'}
                </span>
              </label>
              <select
                value={mapping.soldQtyCol}
                onChange={(e) => setMapping({ ...mapping, soldQtyCol: e.target.value })}
                className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">
                  {isAr ? '-- حساب عدد السجلات (1 لكل صف) --' : '-- Count Rows (1 per row) --'}
                </option>
                {sheet.headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Current Stock / Inventory Column */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
              <label className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-amber-500" />
                  {isAr ? 'عمود المخزون الحالي / الرصيد' : 'Current Stock / Balance'}
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                  {isAr ? 'مخزون' : 'Inventory'}
                </span>
              </label>
              <select
                value={mapping.currentStockCol}
                onChange={(e) => setMapping({ ...mapping, currentStockCol: e.target.value })}
                className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">
                  {isAr ? '-- غير متوفر (اقتراح حسب معدل السحب) --' : '-- Not Available (Velocity Based) --'}
                </option>
                {sheet.headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Financial: Sales / Revenue Column */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/50 space-y-1.5">
              <label className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  {isAr ? 'عمود قيمة المبيعات / الإيراد' : 'Sales / Revenue Column'}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold">
                  {isAr ? 'مالي' : 'Financial'}
                </span>
              </label>
              <select
                value={mapping.revenueCol}
                onChange={(e) => setMapping({ ...mapping, revenueCol: e.target.value })}
                className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">{isAr ? '-- غير محدد --' : '-- None --'}</option>
                {sheet.headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            {/* 6. Financial: Cost Column */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/50 space-y-1.5">
              <label className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-rose-500" />
                  {isAr ? 'عمود التكلفة (لحساب الربح)' : 'Cost Column'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {isAr ? 'مالي' : 'Financial'}
                </span>
              </label>
              <select
                value={mapping.costCol}
                onChange={(e) => setMapping({ ...mapping, costCol: e.target.value })}
                className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">{isAr ? '-- غير محدد --' : '-- None --'}</option>
                {sheet.headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            {/* 7. Financial: Net Profit Column */}
            <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/50 space-y-1.5">
              <label className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  {isAr ? 'عمود صافي الربح (للصنف الكينج)' : 'Net Profit Column (King Item)'}
                </span>
                <span className="text-[10px] text-amber-600 font-bold">
                  {isAr ? 'مالي / ربحية' : 'Profitability'}
                </span>
              </label>
              <select
                value={mapping.profitCol}
                onChange={(e) => setMapping({ ...mapping, profitCol: e.target.value })}
                className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              >
                <option value="">
                  {isAr ? '-- يُحسب تلقائياً (المبيعات - التكلفة) --' : '-- Auto Calculate (Revenue - Cost) --'}
                </option>
                {sheet.headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            {/* 8. Date Column */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
              <label className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  {isAr ? 'عمود التاريخ (لتحديد الفترة)' : 'Date Column (Period Filter)'}
                </span>
                <span className="text-[10px] text-blue-500 font-bold">
                  {isAr ? 'زمني' : 'Time'}
                </span>
              </label>
              <select
                value={mapping.dateCol}
                onChange={(e) => setMapping({ ...mapping, dateCol: e.target.value })}
                className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">{isAr ? '-- بدون عمود تاريخ --' : '-- No Date Column --'}</option>
                {sheet.headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Period Selection & Replenishment Policy Bar */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            {/* Start Date */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                {isAr ? 'من تاريخ (بداية فترة التحليل):' : 'Start Date:'}
              </label>
              <input
                type="date"
                value={startDate}
                min={dateBounds?.minDate}
                max={dateBounds?.maxDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={!mapping.dateCol}
                className="w-full text-xs font-semibold bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 disabled:opacity-50"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                {isAr ? 'إلى تاريخ (نهاية فترة التحليل):' : 'End Date:'}
              </label>
              <input
                type="date"
                value={endDate}
                min={dateBounds?.minDate}
                max={dateBounds?.maxDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={!mapping.dateCol}
                className="w-full text-xs font-semibold bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 disabled:opacity-50"
              />
            </div>

            {/* Target Coverage Days for Suggested Order Qty */}
            <div>
              <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                {isAr ? 'فترة التوريد المستهدفة (يوم):' : 'Target Coverage (Days):'}
              </label>
              <select
                value={targetCoverageDays}
                onChange={(e) => setTargetCoverageDays(Number(e.target.value))}
                className="w-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-300 dark:border-indigo-700 rounded-xl px-3 py-2 text-indigo-900 dark:text-indigo-200"
              >
                <option value={7}>{isAr ? 'تغطية 7 أيام (أسبوع)' : '7 Days (1 Week)'}</option>
                <option value={14}>{isAr ? 'تغطية 14 يوم (أسبوعين)' : '14 Days (2 Weeks)'}</option>
                <option value={30}>{isAr ? 'تغطية 30 يوم (شهر كامل)' : '30 Days (1 Month)'}</option>
                <option value={60}>{isAr ? 'تغطية 60 يوم (شهرين)' : '60 Days (2 Months)'}</option>
                <option value={90}>{isAr ? 'تغطية 90 يوم (ربع سنوي)' : '90 Days (Quarter)'}</option>
              </select>
            </div>

            {/* Safety Stock Buffer % */}
            <div>
              <label className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                {isAr ? 'نسبة مخزون الأمان الإضافي:' : 'Safety Stock Buffer:'}
              </label>
              <select
                value={safetyStockPercent}
                onChange={(e) => setSafetyStockPercent(Number(e.target.value))}
                className="w-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 rounded-xl px-3 py-2 text-emerald-900 dark:text-emerald-200"
              >
                <option value={0}>{isAr ? '0% (بدون رصيد أمان)' : '0% (Exact Match)'}</option>
                <option value={10}>{isAr ? '+10% مخزون أمان' : '+10% Safety Buffer'}</option>
                <option value={20}>{isAr ? '+20% مخزون أمان (موصى به)' : '+20% Safety Buffer (Recommended)'}</option>
                <option value={30}>{isAr ? '+30% مخزون أمان عالي' : '+30% High Buffer'}</option>
                <option value={50}>{isAr ? '+50% لمواسم الذروة' : '+50% Peak Season'}</option>
              </select>
            </div>

            {/* Category Filter or Reset Dates */}
            <div className="flex items-center gap-2">
              {categories.length > 0 && (
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    {isAr ? 'تصفية حسب القسم:' : 'Filter Department:'}
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
                  >
                    <option value="all">{isAr ? 'جميع الأقسام' : 'All Categories'}</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(startDate || endDate || categoryFilter !== 'all') && (
                <button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setCategoryFilter('all');
                  }}
                  className="px-3 py-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300 text-xs font-bold hover:bg-rose-200 transition-colors"
                  title={isAr ? 'مسح الفلاتر' : 'Reset'}
                >
                  {isAr ? 'كل الفترة' : 'Reset'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Executive Summary Cards for Products, Movement & Restock */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. King Items Card */}
        <div
          onClick={() => setActiveMovementTab('king')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all ${
            activeMovementTab === 'king'
              ? 'bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-amber-500/5 border-amber-500 ring-2 ring-amber-500/30'
              : 'bg-white dark:bg-slate-800/90 border-amber-300/70 dark:border-amber-700/60 hover:border-amber-500'
          } shadow-sm`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-amber-700 dark:text-amber-400">
              {isAr ? 'الأصناف الكينج (King)' : 'King Items (Top Profit)'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Crown className="w-5 h-5 fill-amber-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {summary.kingItemsCount}
            </span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
              {isAr ? 'صنف ذهبي' : 'Golden SKUs'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            {summary.topKingItem
              ? `${isAr ? 'الأول:' : '#1:'} ${summary.topKingItem.itemName}`
              : isAr
              ? 'الأسرع مبيعاً والأعلى ربحاً'
              : 'Fastest selling & top profit'}
          </p>
        </div>

        {/* 2. Fast Moving Card */}
        <div
          onClick={() => setActiveMovementTab('fast')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all ${
            activeMovementTab === 'fast'
              ? 'bg-emerald-50/80 dark:bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-500/30'
              : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
          } shadow-sm`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {isAr ? 'أصناف سريعة الحركة (A)' : 'Fast Moving Items (A)'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {summary.fastMovingCount}
            </span>
            <span className="text-xs font-semibold text-emerald-600">
              {isAr ? `من أصل ${summary.totalUniqueItems}` : `of ${summary.totalUniqueItems}`}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {isAr ? 'تشكل القوة الضاربة للمبيعات' : 'Drives ~65% of total sales volume'}
          </p>
        </div>

        {/* 3. Medium Moving Card */}
        <div
          onClick={() => setActiveMovementTab('medium')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all ${
            activeMovementTab === 'medium'
              ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/30'
              : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 hover:border-blue-400'
          } shadow-sm`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {isAr ? 'أصناف متوسطة الحركة (B)' : 'Medium Moving (B)'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Gauge className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {summary.mediumMovingCount}
            </span>
            <span className="text-xs font-semibold text-blue-600">
              {isAr ? 'صنف مستقر' : 'Steady SKUs'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {isAr ? 'مبيعات دورية منتظمة' : 'Consistent moderate turnover'}
          </p>
        </div>

        {/* 4. Slow / Weak Moving Card */}
        <div
          onClick={() => setActiveMovementTab('slow')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all ${
            activeMovementTab === 'slow'
              ? 'bg-slate-200/70 dark:bg-slate-700 border-slate-500 ring-2 ring-slate-400/30'
              : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 hover:border-slate-400'
          } shadow-sm`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {isAr ? 'أصناف ضعيفة الحركة (C)' : 'Slow / Weak Moving (C)'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <Snowflake className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {summary.slowMovingCount}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {isAr ? 'صنف بطيء' : 'Slow SKUs'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {isAr ? 'يوصى بتقليل طلبها أو عمل عروض' : 'Avoid overstocking; consider promos'}
          </p>
        </div>

        {/* 5. Restock Needed & Suggested Units Card */}
        <div
          onClick={() => setActiveMovementTab('restock')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all ${
            activeMovementTab === 'restock'
              ? 'bg-rose-50/80 dark:bg-rose-950/50 border-rose-500 ring-2 ring-rose-500/30'
              : 'bg-white dark:bg-slate-800/90 border-rose-200 dark:border-rose-800/70 hover:border-rose-400'
          } shadow-sm`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-300">
              {isAr ? 'أصناف تحتاج للتوفير مجدداً' : 'Items Needing Restock'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {summary.restockNeededCount}
            </span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              ({summary.totalSuggestedOrderUnits.toLocaleString()} {isAr ? 'وحدة مقترحة' : 'units'})
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {isAr
              ? `لتغطية ${targetCoverageDays} يوم (${formatCurrency(summary.estimatedRestockCost, isAr)})`
              : `For ${targetCoverageDays}d coverage (${formatCurrency(summary.estimatedRestockCost, isAr)})`}
          </p>
        </div>
      </div>

      {/* KING ITEMS SPOTLIGHT SECTION (تحليل الصنف الكينج: الأسرع حركة والأعلى ربحاً) */}
      {kingItems.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50/90 via-white to-yellow-50/60 dark:from-slate-800 dark:via-slate-800/95 dark:to-amber-950/20 rounded-3xl p-6 border-2 border-amber-400/60 dark:border-amber-600/50 shadow-lg space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center shadow-md shadow-amber-500/20">
                <Crown className="w-7 h-7 fill-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {isAr
                      ? 'تحليل "الأصناف الكينج" (King Items) - الأسرع حركة والأعلى ربحية'
                      : 'King Items Spotlight - Fast-Moving & Highest Profit Generators'}
                  </h3>
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950">
                    {isAr ? 'أولوية قصوى للتوفير' : 'Zero-Stockout Priority'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  {isAr
                    ? 'هذه الأصناف تجمع بين سرعة الدوران العالية والربحية المرتفعة؛ نفاد أي صنف منها يسبب خسارة مباشرة في صافي أرباحك.'
                    : 'These items combine high sales velocity with top net profit contribution. Never allow these SKUs to run out of stock.'}
                </p>
              </div>
            </div>

            <div className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/60 px-3.5 py-2 rounded-xl border border-amber-300 dark:border-amber-800">
              {isAr
                ? `فترة التحليل المحسوبة: ${summary.analyzedDaysCount} يوم`
                : `Analyzed Period: ${summary.analyzedDaysCount} Days`}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kingItems.slice(0, 6).map((king) => (
              <div
                key={king.id}
                className="bg-white dark:bg-slate-900/90 rounded-2xl p-4 border border-amber-300/80 dark:border-amber-700/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs font-black">
                        #{king.kingRank}
                      </span>
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                        {king.category}
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {king.itemName}
                    </h4>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-black">
                    {formatCurrency(king.profit, isAr)} {isAr ? 'ربح' : 'Profit'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 dark:bg-slate-800/70 rounded-xl p-2.5 border border-slate-100 dark:border-slate-700">
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {isAr ? 'الكمية المباعة' : 'Sold Qty'}
                    </p>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5">
                      {king.soldQty.toLocaleString()}
                    </p>
                  </div>
                  <div className="border-x border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {isAr ? 'هامش الربح' : 'Margin %'}
                    </p>
                    <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {king.profitMarginPercent}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {isAr ? 'حصة الربح العام' : 'Profit Share'}
                    </p>
                    <p className="text-xs font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                      {king.profitSharePercent}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">
                      {isAr ? 'المقترح توفيره فوراً: ' : 'Suggested Order: '}
                    </span>
                    <span className="font-black text-indigo-600 dark:text-indigo-400">
                      {king.suggestedOrderQty.toLocaleString()} {isAr ? 'وحدة' : 'units'}
                    </span>
                  </div>
                  {king.currentStock !== null && (
                    <span className="text-[11px] font-semibold text-slate-500">
                      {isAr ? `الرصيد: ${king.currentStock}` : `Stock: ${king.currentStock}`}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Chart: Sold Quantities vs Suggested Replenishment Quantities */}
      {items.length > 0 && (
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-500" />
                <span>
                  {isAr
                    ? `مقارنة الأصناف الأكثر مبيعاً بالكميات المقترح توفيرها (لتغطية ${targetCoverageDays} يوم)`
                    : `Top Selling Items vs. Suggested Replenishment Quantities (${targetCoverageDays} Days Coverage)`}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr
                  ? 'يوضح الرسم حجم السحب الفعلي مقارنة بالكمية المطلوب توفيرها بناءً على سرعة الحركة ومخزون الأمان'
                  : 'Actual quantity sold vs recommended order quantity based on daily run rate and safety stock'}
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <Bar
              data={topChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      font: { family: 'Cairo, sans-serif', size: 12, weight: 'bold' },
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(148, 163, 184, 0.15)' },
                  },
                  x: {
                    grid: { display: false },
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Detailed Products Velocity, Restock & King Classification Table */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {/* Table Filter Tabs & Search Bar */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Movement Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl">
              <button
                onClick={() => setActiveMovementTab('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeMovementTab === 'all'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {isAr ? `الكل (${items.length})` : `All (${items.length})`}
              </button>
              <button
                onClick={() => setActiveMovementTab('king')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                  activeMovementTab === 'king'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-amber-700 dark:text-amber-400 hover:bg-amber-500/10'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                {isAr ? `الأصناف الكينج (${summary.kingItemsCount})` : `King Items (${summary.kingItemsCount})`}
              </button>
              <button
                onClick={() => setActiveMovementTab('fast')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeMovementTab === 'fast'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10'
                }`}
              >
                {isAr ? `سريعة الحركة (${summary.fastMovingCount})` : `Fast (${summary.fastMovingCount})`}
              </button>
              <button
                onClick={() => setActiveMovementTab('medium')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeMovementTab === 'medium'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-blue-700 dark:text-blue-400 hover:bg-blue-500/10'
                }`}
              >
                {isAr ? `متوسطة الحركة (${summary.mediumMovingCount})` : `Medium (${summary.mediumMovingCount})`}
              </button>
              <button
                onClick={() => setActiveMovementTab('slow')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeMovementTab === 'slow'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-500/10'
                }`}
              >
                {isAr ? `ضعيفة الحركة (${summary.slowMovingCount})` : `Slow (${summary.slowMovingCount})`}
              </button>
              <button
                onClick={() => setActiveMovementTab('restock')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeMovementTab === 'restock'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
                }`}
              >
                {isAr
                  ? `تحتاج توفير (${summary.restockNeededCount})`
                  : `Needs Restock (${summary.restockNeededCount})`}
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'ابحث باسم الصنف أو القسم...' : 'Search item or category...'}
                className="w-full ps-9 pe-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-700">
                <th className="py-3.5 px-4 text-start">#</th>
                <th className="py-3.5 px-4 text-start">{isAr ? 'الصنف والقسم' : 'Item & Category'}</th>
                <th className="py-3.5 px-4 text-start">{isAr ? 'سرعة الحركة والتصنيف' : 'Movement & King Status'}</th>
                <th
                  onClick={() => toggleSort('soldQty')}
                  className="py-3.5 px-4 text-start cursor-pointer hover:text-brand-600 select-none"
                >
                  <div className="inline-flex items-center gap-1">
                    <span>{isAr ? 'الكمية المباعة' : 'Sold Qty'}</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-start">{isAr ? 'معدل السحب اليومي' : 'Daily Velocity'}</th>
                {mapping.currentStockCol && (
                  <th className="py-3.5 px-4 text-start">{isAr ? 'المخزون الحالي' : 'Current Stock'}</th>
                )}
                <th
                  onClick={() => toggleSort('revenue')}
                  className="py-3.5 px-4 text-start cursor-pointer hover:text-brand-600 select-none"
                >
                  <div className="inline-flex items-center gap-1">
                    <span>{isAr ? 'إجمالي المبيعات' : 'Revenue'}</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('profit')}
                  className="py-3.5 px-4 text-start cursor-pointer hover:text-brand-600 select-none"
                >
                  <div className="inline-flex items-center gap-1">
                    <span>{isAr ? 'صافي الربح (والهامش)' : 'Net Profit & Margin'}</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-start">{isAr ? 'حالة التوفير' : 'Restock Status'}</th>
                <th
                  onClick={() => toggleSort('suggestedOrder')}
                  className="py-3.5 px-4 text-start cursor-pointer hover:text-indigo-600 select-none bg-indigo-50/50 dark:bg-indigo-950/30"
                >
                  <div className="inline-flex items-center gap-1 text-indigo-700 dark:text-indigo-300">
                    <span>
                      {isAr
                        ? `الكمية المقترح توفيرها (${targetCoverageDays} يوم)`
                        : `Suggested Order (${targetCoverageDays}d)`}
                    </span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-700/60 text-xs">
              {filteredItems.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`transition-colors ${
                    item.isKingItem
                      ? 'bg-amber-50/30 dark:bg-amber-950/10 hover:bg-amber-50/70 dark:hover:bg-amber-950/25'
                      : 'hover:bg-slate-50/90 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <td className="py-3.5 px-4 font-bold text-slate-400">{idx + 1}</td>

                  {/* Item Name & Category */}
                  <td className="py-3.5 px-4">
                    <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {item.isKingItem && <Crown className="w-4 h-4 text-amber-500 fill-amber-400 flex-shrink-0" />}
                      <span>{item.itemName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.category} • {item.transactionsCount} {isAr ? 'عملية' : 'txns'}
                    </div>
                  </td>

                  {/* Movement Speed & King Badge */}
                  <td className="py-3.5 px-4">{renderMovementBadge(item.movementSpeed, item.isKingItem)}</td>

                  {/* Sold Quantity & Share */}
                  <td className="py-3.5 px-4">
                    <div className="font-black text-slate-900 dark:text-white text-sm">
                      {item.soldQty.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {item.qtySharePercent}% {isAr ? 'من المبيعات الكمية' : 'of total volume'}
                    </div>
                  </td>

                  {/* Daily Run Rate */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {item.dailyRunRate}
                    </span>
                    <span className="text-[11px] text-slate-400 ms-1">
                      {isAr ? 'وحدة/يوم' : 'u/day'}
                    </span>
                  </td>

                  {/* Current Stock (if mapped) */}
                  {mapping.currentStockCol && (
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {item.currentStock !== null ? item.currentStock.toLocaleString() : '-'}
                      </div>
                      {item.daysOfInventoryLeft !== null && item.daysOfInventoryLeft < 999 && (
                        <div
                          className={`text-[10px] font-bold ${
                            item.daysOfInventoryLeft <= 10
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {isAr
                            ? `يكفي ${item.daysOfInventoryLeft} يوم`
                            : `${item.daysOfInventoryLeft} days left`}
                        </div>
                      )}
                    </td>
                  )}

                  {/* Revenue */}
                  <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                    <div>{formatCurrency(item.revenue, isAr)}</div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      {item.revenueSharePercent}% {isAr ? 'من الإيراد' : 'share'}
                    </div>
                  </td>

                  {/* Net Profit & Margin */}
                  <td className="py-3.5 px-4">
                    <div className="font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(item.profit, isAr)}
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500">
                      {isAr ? 'هامش:' : 'Margin:'} {item.profitMarginPercent}%
                    </div>
                  </td>

                  {/* Restock Urgency Status */}
                  <td className="py-3.5 px-4">{renderUrgencyBadge(item.restockUrgency)}</td>

                  {/* Suggested Order Quantity */}
                  <td className="py-3.5 px-4 bg-indigo-50/40 dark:bg-indigo-950/20">
                    {item.suggestedOrderQty > 0 ? (
                      <div>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-indigo-600 text-white font-black text-xs shadow-sm">
                          +{item.suggestedOrderQty.toLocaleString()} {isAr ? 'وحدة' : 'units'}
                        </span>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                          {isAr
                            ? `شامل ${safetyStockPercent}% أمان`
                            : `Incl. ${safetyStockPercent}% buffer`}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {isAr ? 'لا يحتاج طلب حالياً (0)' : 'No order needed (0)'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 text-sm font-semibold">
                    {isAr
                      ? 'لا توجد أصناف مطابقة للفلتر الحالي.'
                      : 'No products match the selected filter.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
