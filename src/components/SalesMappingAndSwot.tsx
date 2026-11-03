import React, { useState } from 'react';
import {
  Settings2,
  CheckCircle2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  DollarSign,
  TrendingUp,
  Layers,
  MapPin,
  Users,
  UserCheck,
  Calendar,
  Activity,
  ShieldCheck,
  AlertTriangle,
  Rocket,
  Sparkles,
  ArrowUpRight,
  Target,
  Hash,
} from 'lucide-react';
import { useI18n } from '../locales/i18nContext';
import { SalesColumnMapping, SheetData } from '../types';
import {
  autoDetectSalesMapping,
  analyzeSalesStrengthsWeaknessesAndTips,
  formatCurrency,
} from '../utils/analyticsEngine';

interface SalesMappingAndSwotProps {
  sheet: SheetData;
  mapping: SalesColumnMapping;
  setMapping: React.Dispatch<React.SetStateAction<SalesColumnMapping>>;
}

export const SalesMappingAndSwot: React.FC<SalesMappingAndSwotProps> = ({
  sheet,
  mapping,
  setMapping,
}) => {
  const { language } = useI18n();
  const isAr = language === 'ar';

  const [showMappingPanel, setShowMappingPanel] = useState<boolean>(true);
  const [mappingConfirmed, setMappingConfirmed] = useState<boolean>(false);

  const swot = React.useMemo(() => {
    return analyzeSalesStrengthsWeaknessesAndTips(sheet, mapping, language);
  }, [sheet, mapping, language]);

  return (
    <div className="space-y-8">
      {/* STEP 1: Sales Excel Column Mapping Banner & Interactive Panel */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl border-2 border-emerald-500/30 dark:border-emerald-500/40 shadow-md overflow-hidden transition-all">
        {/* Top Bar */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-5 sm:p-6 text-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-inner">
              <Settings2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                  {isAr ? 'الخطوة الأولى بعد رفع ملف المبيعات' : 'Step 1 After Uploading Sales File'}
                </span>
                {mappingConfirmed && (
                  <span className="text-[11px] bg-white/15 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isAr ? 'تم اعتماد الأعمدة' : 'Mapping Active'}
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-extrabold mt-1">
                {isAr
                  ? 'ربط وتخصيص أعمدة ملف المبيعات (Sales Column Mapping)'
                  : 'Sales File Column Mapping & Configuration'}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {isAr
                  ? 'حدد الأعمدة المقابلة في ملف الإكسيل الخاص بك (المبيعات، الربح، التكلفة، الفئة، المنطقة، العميل، والتاريخ) لاستخراج النتائج ونقاط القوة والضعف بدقة'
                  : 'Verify or select the matching columns from your sales Excel file to accurately compute KPIs, strengths, weaknesses, and growth proposals'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setMapping(autoDetectSalesMapping(sheet.columns));
                setMappingConfirmed(false);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isAr ? 'كشف تلقائي' : 'Auto-Detect'}</span>
            </button>

            <button
              onClick={() => setShowMappingPanel(!showMappingPanel)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm transition-all"
            >
              <span>
                {showMappingPanel
                  ? isAr
                    ? 'إخفاء لوحة الربط'
                    : 'Collapse Mapping'
                  : isAr
                  ? 'تعديل ربط الأعمدة'
                  : 'Edit Column Mapping'}
              </span>
              {showMappingPanel ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Mapping Dropdowns Body */}
        {showMappingPanel && (
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* 1. Revenue / Sales Column */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-800/60 space-y-1.5">
                <label className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    {isAr ? 'عمود قيمة المبيعات *' : 'Sales / Revenue *'}
                  </span>
                  <span className="text-[10px] text-rose-500 font-extrabold">
                    {isAr ? 'أساسي' : 'Required'}
                  </span>
                </label>
                <select
                  value={mapping.revenueCol}
                  onChange={(e) => setMapping({ ...mapping, revenueCol: e.target.value })}
                  className="w-full text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">{isAr ? '-- اختر عمود المبيعات --' : '-- Select Column --'}</option>
                  {sheet.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Net Profit Column */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-800/60 space-y-1.5">
                <label className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                    {isAr ? 'عمود صافي الربح' : 'Net Profit Column'}
                  </span>
                  <span className="text-[10px] text-blue-600 font-bold">
                    {isAr ? 'مالي' : 'Financial'}
                  </span>
                </label>
                <select
                  value={mapping.profitCol}
                  onChange={(e) => setMapping({ ...mapping, profitCol: e.target.value })}
                  className="w-full text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">
                    {isAr ? '-- يُحسب تلقائياً (المبيعات - التكلفة) --' : '-- Auto (Revenue - Cost) --'}
                  </option>
                  {sheet.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Cost Column */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                <label className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-rose-500" />
                    {isAr ? 'عمود التكلفة / المصروف' : 'Cost / Expense Column'}
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

              {/* 4. Category / Product Segment Column */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                <label className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-500" />
                    {isAr ? 'عمود الفئة / القطاع / الصنف' : 'Category / Segment'}
                  </span>
                  <span className="text-[10px] text-purple-500 font-bold">
                    {isAr ? 'تصنيف' : 'Segment'}
                  </span>
                </label>
                <select
                  value={mapping.categoryCol}
                  onChange={(e) => setMapping({ ...mapping, categoryCol: e.target.value })}
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

              {/* 5. Branch / Region Column */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                <label className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    {isAr ? 'عمود الفرع / المنطقة' : 'Branch / Region'}
                  </span>
                  <span className="text-[10px] text-amber-600 font-bold">
                    {isAr ? 'جغرافي' : 'Geo'}
                  </span>
                </label>
                <select
                  value={mapping.regionCol}
                  onChange={(e) => setMapping({ ...mapping, regionCol: e.target.value })}
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

              {/* 6. Client / Customer Column */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                <label className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                    {isAr ? 'عمود اسم العميل' : 'Customer / Client'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isAr ? 'عملاء' : 'Client'}
                  </span>
                </label>
                <select
                  value={mapping.clientCol}
                  onChange={(e) => setMapping({ ...mapping, clientCol: e.target.value })}
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

              {/* 7. Salesperson / Account Manager Column */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                <label className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-teal-500" />
                    {isAr ? 'عمود المندوب / المسؤول' : 'Sales Rep / Manager'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isAr ? 'فريق البيع' : 'Team'}
                  </span>
                </label>
                <select
                  value={mapping.salespersonCol}
                  onChange={(e) => setMapping({ ...mapping, salespersonCol: e.target.value })}
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

              {/* 8. Quantity Column */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                <label className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-cyan-500" />
                    {isAr ? 'عمود الكمية المباعة' : 'Quantity Column'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isAr ? 'كميات' : 'Units'}
                  </span>
                </label>
                <select
                  value={mapping.qtyCol}
                  onChange={(e) => setMapping({ ...mapping, qtyCol: e.target.value })}
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

              {/* 9. Date Column */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                <label className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    {isAr ? 'عمود التاريخ' : 'Date Column'}
                  </span>
                  <span className="text-[10px] text-blue-500 font-bold">
                    {isAr ? 'زمني' : 'Date'}
                  </span>
                </label>
                <select
                  value={mapping.dateCol}
                  onChange={(e) => setMapping({ ...mapping, dateCol: e.target.value })}
                  className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">{isAr ? '-- بدون عمود تاريخ --' : '-- None --'}</option>
                  {sheet.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* 10. Status Column */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                <label className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                    {isAr ? 'عمود حالة العملية' : 'Status Column'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isAr ? 'حالة' : 'Status'}
                  </span>
                </label>
                <select
                  value={mapping.statusCol}
                  onChange={(e) => setMapping({ ...mapping, statusCol: e.target.value })}
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
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/60">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {isAr
                  ? `إجمالي المبيعات المحسوب وفق الربط الحالي: `
                  : `Calculated Total Revenue from Mapping: `}
                <span className="font-black text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(swot.summaryMetrics.totalRevenue, isAr)}
                </span>
                {' • '}
                {isAr ? `صافي الربح: ` : `Net Profit: `}
                <span className="font-black text-blue-600 dark:text-blue-400">
                  {formatCurrency(swot.summaryMetrics.totalProfit, isAr)} (
                  {swot.summaryMetrics.overallMarginPercent}%)
                </span>
              </div>

              <button
                onClick={() => {
                  setMappingConfirmed(true);
                  setShowMappingPanel(false);
                }}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isAr ? 'اعتماد ربط الأعمدة وتحديث النتائج' : 'Confirm Mapping & Update Results'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* STEP 2: Strengths, Weaknesses & Actionable Sales Improvement Proposals (نقاط القوة والضعف ومقترحات التحسين) */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {isAr
                  ? 'تحليل نقاط القوة والضعف ومقترحات تحسين المبيعات'
                  : 'Sales Strengths, Weaknesses & Actionable Growth Proposals'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr
                  ? 'تشخيص استراتيجي مبني على الأعمدة المربوطة في ملف المبيعات لتعظيم الإيرادات ومعالجة الفجوات البيعية'
                  : 'Strategic diagnosis based on your mapped sales columns to maximize revenue and resolve bottlenecks'}
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Grid for Strengths & Weaknesses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column 1: Strengths (نقاط القوة) */}
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border-2 border-emerald-500/30 dark:border-emerald-500/40 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-100 dark:border-emerald-900/50 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-emerald-800 dark:text-emerald-300">
                    {isAr ? 'نقاط القوة في المبيعات (Strengths)' : 'Sales Strengths & Drivers'}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isAr
                      ? 'عوامل التفوق والمحركات الرئيسية للإيرادات والأرباح'
                      : 'Core revenue generators and competitive advantages'}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                {swot.strengths.length} {isAr ? 'نقاط قوة' : 'Strengths'}
              </span>
            </div>

            <div className="space-y-3">
              {swot.strengths.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/50 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{item.title}</span>
                    </h5>
                    {item.metric && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-600 text-white flex-shrink-0">
                        {item.metric}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed ps-5">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Weaknesses (نقاط الضعف) */}
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border-2 border-rose-500/30 dark:border-rose-500/40 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-900/50 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-rose-800 dark:text-rose-300">
                    {isAr ? 'نقاط الضعف والفجوات البيعية (Weaknesses)' : 'Sales Weaknesses & Bottlenecks'}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isAr
                      ? 'الجوانب التي تحتاج إلى معالجة وتطوير لوقف تسرب الإيرادات'
                      : 'Underperforming segments and operational bottlenecks'}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                {swot.weaknesses.length} {isAr ? 'نقاط ضعف' : 'Weaknesses'}
              </span>
            </div>

            <div className="space-y-3">
              {swot.weaknesses.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-800/50 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                      <span>{item.title}</span>
                    </h5>
                    {item.metric && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-600 text-white flex-shrink-0">
                        {item.metric}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed ps-5">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Full-Width Section: Actionable Sales Improvement Proposals (المقترحات العملية لتحسين المبيعات أكثر) */}
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-7 text-white border border-indigo-500/30 shadow-xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/25">
                <Rocket className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base sm:text-lg font-black">
                    {isAr
                      ? 'المقترحات التنفيذية وخطة العمل لتحسين وزيادة المبيعات'
                      : 'Actionable Proposals & Roadmap to Boost Sales'}
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    {isAr ? 'توصيات ذكية قابلة للتطبيق' : 'Actionable Growth Plan'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {isAr
                    ? 'خطوات عملية مقترحة بناءً على أرقام ملف المبيعات لاستغلال نقاط القوة وعلاج نقاط الضعف'
                    : 'Concrete steps tailored to your dataset to capitalize on strengths and turn weaknesses into growth'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {swot.recommendations.map((rec, index) => (
              <div
                key={rec.id}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/15 hover:border-amber-400/50 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      {isAr ? `مقترح #${index + 1}` : `Proposal #${index + 1}`}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        rec.priority === 'high'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      }`}
                    >
                      {rec.priority === 'high'
                        ? isAr
                          ? 'أولوية قصوى'
                          : 'High Priority'
                        : isAr
                        ? 'أولوية متوسطة'
                        : 'Medium Priority'}
                    </span>
                  </div>

                  <h5 className="text-sm font-extrabold text-white leading-snug">
                    {rec.title}
                  </h5>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {rec.actionPlan}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold">
                    {isAr ? 'الأثر المتوقع:' : 'Expected Impact:'}
                  </span>
                  <span className="font-extrabold text-emerald-400 flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    {rec.expectedImpact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
