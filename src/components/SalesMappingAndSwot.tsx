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
import { ColumnInfoTooltip } from './ColumnInfoTooltip';
import {
  autoDetectSalesMapping,
  analyzeSalesStrengthsWeaknessesAndTips,
  formatCurrency,
  isUnitPriceColumn,
  isUnitCostColumn,
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
      <div className={`bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all ${showMappingPanel ? 'overflow-visible' : 'overflow-hidden'}`}>
        {/* Top Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {isAr ? 'ربط أعمدة ملف المبيعات' : 'Sales Column Mapping'}
                </h3>
                {mappingConfirmed && (
                  <span className="text-[11px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {isAr ? 'معتمد' : 'Active'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setMapping(autoDetectSalesMapping(sheet.columns));
                setMappingConfirmed(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isAr ? 'كشف تلقائي' : 'Auto-Detect'}</span>
            </button>

            <button
              onClick={() => setShowMappingPanel(!showMappingPanel)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all"
            >
              <span>
                {showMappingPanel
                  ? isAr
                    ? 'إخفاء'
                    : 'Collapse'
                  : isAr
                  ? 'تعديل الأعمدة'
                  : 'Edit Columns'}
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
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-800/60 space-y-1.5 relative">
                <label className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isAr ? 'عمود قيمة المبيعات *' : 'Sales / Revenue *'}</span>
                    <ColumnInfoTooltip
                      title={isAr ? 'عمود قيمة المبيعات أو سعر البيع' : 'Sales Revenue / Unit Price'}
                      description={
                        isAr
                          ? 'العمود الذي يحتوي على إجمالي المبيعات أو سعر بيع الحبة الواحدة. يمكنك التبديل أدناه بين (إجمالي المبيعات) أو (سعر بيع الحبة الواحدة) ليقوم النظام بضربه في الكمية المباعة تلقائياً واحتساب الإيرادات والأرباح بدقة.'
                          : 'Total sales revenue or unit selling price. Toggle below to calculate total sales as (Unit Price × Sold Qty) automatically.'
                      }
                      examples={['المبيعات', 'الإيراد', 'سعر البيع', 'سعر الحبة', 'Total', 'Revenue', 'Sales', 'Unit Price']}
                      impact={
                        isAr
                          ? 'ركيزة كل الحسابات المالية: إجمالي الدخل، معدلات النمو، ورسوم أداء الفئات والمناطق.'
                          : 'Powers total revenue, growth rates, category breakdowns, and revenue charts.'
                      }
                      required={true}
                      isAr={isAr}
                    />
                  </span>
                  <span className="text-[10px] text-rose-500 font-extrabold">
                    {isAr ? 'أساسي' : 'Required'}
                  </span>
                </label>
                <select
                  value={mapping.revenueCol}
                  onChange={(e) => {
                    const col = e.target.value;
                    setMapping({
                      ...mapping,
                      revenueCol: col,
                      revenueType: isUnitPriceColumn(col) ? 'unit_price' : mapping.revenueType || 'total',
                    });
                  }}
                  className="w-full text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">{isAr ? '-- اختر عمود المبيعات --' : '-- Select Column --'}</option>
                  {sheet.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>

                {/* Unit Selling Price vs Total Sales Toggle */}
                {mapping.revenueCol && (
                  <div className="pt-1.5 border-t border-emerald-200/60 dark:border-emerald-800/40">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      <span>{isAr ? 'نوع القيمة بالعمود:' : 'Data type:'}</span>
                      {mapping.revenueType === 'unit_price' && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-0.5">
                          <span>×</span>
                          <span>{isAr ? 'الكمية' : 'Qty'}</span>
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-1 p-0.5 bg-white/90 dark:bg-slate-900/90 rounded-lg border border-emerald-200/70 dark:border-emerald-800/60">
                      <button
                        type="button"
                        onClick={() => setMapping({ ...mapping, revenueType: 'total' })}
                        className={`text-[10px] font-bold py-1 px-1 rounded-md transition-all text-center ${
                          mapping.revenueType !== 'unit_price'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {isAr ? 'إجمالي' : 'Total'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setMapping({ ...mapping, revenueType: 'unit_price' })}
                        className={`text-[10px] font-bold py-1 px-1 rounded-md transition-all text-center ${
                          mapping.revenueType === 'unit_price'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {isAr ? 'سعر حبة × كمية' : 'Unit × Qty'}
                      </button>
                    </div>
                    {mapping.revenueType === 'unit_price' && (
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-300 mt-1 leading-tight">
                        {isAr
                          ? '💡 يُحسب الإجمالي = (سعر الحبة × الكمية المباعة)'
                          : '💡 Auto-calculated = (Unit Price × Sold Qty)'}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* 2. Net Profit Column */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-800/60 space-y-1.5 relative">
                <label className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                    <span>{isAr ? 'عمود صافي الربح' : 'Net Profit Column'}</span>
                    <ColumnInfoTooltip
                      title={isAr ? 'عمود صافي الربح' : 'Net Profit Column'}
                      description={
                        isAr
                          ? 'عمود الأرباح الصافية المحققة بعد خصم التكاليف. إذا لم يكن متوفراً في ملفك، اتركه فارغاً وسيحسبه النظام تلقائياً عبر (المبيعات - التكلفة).'
                          : 'Net profit column. If omitted, the system automatically calculates it as (Revenue - Cost).'
                      }
                      examples={['صافي الربح', 'الربح', 'Net Profit', 'Profit', 'الأرباح']}
                      impact={
                        isAr
                          ? 'تحديد هوامش الربحية الصافية والمنتجات الأكثر ربحاً ونقاط القوة المالية.'
                          : 'Computes overall margin percentage, gross profit, and high-margin product highlights.'
                      }
                      required={false}
                      isAr={isAr}
                    />
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
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5 relative">
                <label className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-rose-500" />
                    <span>{isAr ? 'عمود التكلفة / المصروف' : 'Cost / Expense Column'}</span>
                    <ColumnInfoTooltip
                      title={isAr ? 'عمود التكلفة أو سعر الشراء' : 'Cost / Unit Cost Column'}
                      description={
                        isAr
                          ? 'العمود الذي يوضح تكلفة البضاعة المباعة أو تكلفة شراء الحبة الواحدة (سعر الشراء). يمكنك التبديل أدناه بين (إجمالي التكلفة) أو (تكلفة الحبة الواحدة) ليقوم النظام بضربها في الكمية المباعة تلقائياً وحساب صافي الأرباح بدقة متناهية.'
                          : 'Total transaction cost or unit cost (procurement price). Toggle below to calculate total cost as (Unit Cost × Qty) automatically.'
                      }
                      examples={['التكلفة', 'سعر التكلفة', 'تكلفة الحبة', 'Cost', 'Unit Cost', 'Total Cost', 'سعر الشراء', 'COGS']}
                      impact={
                        isAr
                          ? 'حساب إجمالي التكاليف وحساب صافي الأرباح التلقائي وكشف بنود التكلفة العالية.'
                          : 'Computes total cost and enables automated net profit calculation.'
                      }
                      required={false}
                      isAr={isAr}
                    />
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isAr ? 'مالي' : 'Financial'}
                  </span>
                </label>
                <select
                  value={mapping.costCol}
                  onChange={(e) => {
                    const col = e.target.value;
                    setMapping({
                      ...mapping,
                      costCol: col,
                      costType: isUnitCostColumn(col) ? 'unit_cost' : mapping.costType || 'total',
                    });
                  }}
                  className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">{isAr ? '-- غير محدد --' : '-- None --'}</option>
                  {sheet.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>

                {/* Unit Cost Price vs Total Cost Toggle */}
                {mapping.costCol && (
                  <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700/60">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      <span>{isAr ? 'نوع التكلفة بالعمود:' : 'Cost data type:'}</span>
                      {mapping.costType === 'unit_cost' && (
                        <span className="text-rose-500 font-extrabold flex items-center gap-0.5">
                          <span>×</span>
                          <span>{isAr ? 'الكمية' : 'Qty'}</span>
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-1 p-0.5 bg-white/90 dark:bg-slate-900/90 rounded-lg border border-slate-300 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => setMapping({ ...mapping, costType: 'total' })}
                        className={`text-[10px] font-bold py-1 px-1 rounded-md transition-all text-center ${
                          mapping.costType !== 'unit_cost'
                            ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {isAr ? 'إجمالي' : 'Total'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setMapping({ ...mapping, costType: 'unit_cost' })}
                        className={`text-[10px] font-bold py-1 px-1 rounded-md transition-all text-center ${
                          mapping.costType === 'unit_cost'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {isAr ? 'تكلفة حبة × كمية' : 'Unit × Qty'}
                      </button>
                    </div>
                    {mapping.costType === 'unit_cost' && (
                      <p className="text-[10px] text-rose-600 dark:text-rose-300 mt-1 leading-tight">
                        {isAr
                          ? '💡 تُحسب التكلفة الإجمالية = (تكلفة الحبة × الكمية المباعة)'
                          : '💡 Auto-calculated = (Unit Cost × Sold Qty)'}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* 4. Category / Product Segment Column */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5 relative">
                <label className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-500" />
                    <span>{isAr ? 'عمود الفئة / القطاع / الصنف' : 'Category / Segment'}</span>
                    <ColumnInfoTooltip
                      title={isAr ? 'عمود الفئة أو القطاع أو الصنف' : 'Category / Segment Column'}
                      description={
                        isAr
                          ? 'العمود الذي يحدد قسم المنتج، فئة الخدمة، أو التصنيف التجاري لتجميع المبيعات وتحليلها.'
                          : 'Product category, line of business, or segment column for grouped analytics.'
                      }
                      examples={['الفئة', 'التصنيف', 'القسم', 'نوع المنتج', 'Category', 'Department', 'Group']}
                      impact={
                        isAr
                          ? 'تحديد الفئة الأكثر مبيعاً والأعلى ربحاً، وتشخيص الفئات المتعثرة في تحليل SWOT.'
                          : 'Identifies star categories and underperforming product lines in SWOT diagnosis.'
                      }
                      required={false}
                      isAr={isAr}
                      align="end"
                    />
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
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5 relative">
                <label className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isAr ? 'عمود الفرع / المنطقة' : 'Branch / Region'}</span>
                    <ColumnInfoTooltip
                      title={isAr ? 'عمود الفرع أو المنطقة الجغرافية' : 'Branch / Region Column'}
                      description={
                        isAr
                          ? 'العمود الذي يحدد الفرع أو المدينة أو المعرض أو المنطقة الجغرافية التي تمت فيها العملية.'
                          : 'Store, branch, city, or geographic territory where sales occurred.'
                      }
                      examples={['الفرع', 'المنطقة', 'المدينة', 'المتجر', 'Branch', 'City', 'Region', 'Location']}
                      impact={
                        isAr
                          ? 'مقارنة أداء الفروع والمناطق وتحديد المعارض الرائدة والمعارض التي تتطلب دعماً تسويقياً.'
                          : 'Enables branch vs branch comparisons and regional expansion opportunities.'
                      }
                      required={false}
                      isAr={isAr}
                      align="end"
                    />
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
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5 relative">
                <label className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{isAr ? 'عمود اسم العميل' : 'Customer / Client'}</span>
                    <ColumnInfoTooltip
                      title={isAr ? 'عمود اسم العميل' : 'Customer / Client Column'}
                      description={
                        isAr
                          ? 'العمود الذي يسجل اسم العميل أو اسم الشركة المشترية لمعرفة العملاء الأهم وتكرار الشراء.'
                          : 'Customer name or company name column to track customer-level performance.'
                      }
                      examples={['العميل', 'اسم العميل', 'الشركة', 'Customer', 'Client Name', 'Account Name']}
                      impact={
                        isAr
                          ? 'تحديد العملاء المميزين (VIP)، ومعدل تكرار الشراء، ونسبة اعتماد المبيعات على عملاء رئيسيين.'
                          : 'Detects top VIP customers, purchasing concentration, and customer retention metrics.'
                      }
                      required={false}
                      isAr={isAr}
                    />
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
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5 relative">
                <label className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-teal-500" />
                    <span>{isAr ? 'عمود المندوب / المسؤول' : 'Sales Rep / Manager'}</span>
                    <ColumnInfoTooltip
                      title={isAr ? 'عمود المندوب أو المسؤول' : 'Sales Rep / Manager Column'}
                      description={
                        isAr
                          ? 'العمود الذي يسجل اسم مندوب المبيعات أو مسؤول الحساب أو الكاشير الذي أجرى المعاملة.'
                          : 'The sales representative, cashier, or account manager handling the transaction.'
                      }
                      examples={['المندوب', 'البائع', 'مسؤول المبيعات', 'Salesperson', 'Sales Rep', 'Cashier']}
                      impact={
                        isAr
                          ? 'تقييم كفاءة فريق البيع، مقارنة أداء الموظفين، ودعم خطط الحوافز والعمولات.'
                          : 'Assesses sales team productivity and helps evaluate commission programs.'
                      }
                      required={false}
                      isAr={isAr}
                    />
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
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5 relative">
                <label className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-cyan-500" />
                    <span>{isAr ? 'عمود الكمية المباعة' : 'Quantity Column'}</span>
                    <ColumnInfoTooltip
                      title={isAr ? 'عمود الكمية المباعة' : 'Sold Quantity Column'}
                      description={
                        isAr
                          ? 'العمود الذي يحتوي على عدد الوحدات أو القطع المباعة في كل صف.'
                          : 'Number of units, pieces, or volume sold in each transaction.'
                      }
                      examples={['الكمية', 'عدد القطع', 'العدد', 'Qty', 'Quantity', 'Units Sold', 'Count']}
                      impact={
                        isAr
                          ? 'حساب إجمالي حجم المبيعات بالوحدات ومتوسط سعر القطعة وسرعة دوران المبيعات.'
                          : 'Computes total units sold and average transaction volume.'
                      }
                      required={false}
                      isAr={isAr}
                    />
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
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5 relative">
                <label className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>{isAr ? 'عمود التاريخ' : 'Date Column'}</span>
                    <ColumnInfoTooltip
                      title={isAr ? 'عمود التاريخ' : 'Date Column'}
                      description={
                        isAr
                          ? 'العمود الذي يحتوي على تاريخ الفاتورة أو العملية (مثل: 2026-10-15).'
                          : 'The transaction or invoice date in standard date format.'
                      }
                      examples={['التاريخ', 'تاريخ الفاتورة', 'تاريخ الطلب', 'Date', 'Invoice Date', 'Order Date']}
                      impact={
                        isAr
                          ? 'تمكين مقارنة الفترات (شهري، ربع سنوي)، قياس معدل النمو، ومنحنيات الأداء الزمني.'
                          : 'Powers time-based comparisons, monthly trends, and growth trajectory.'
                      }
                      required={false}
                      isAr={isAr}
                      align="end"
                    />
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
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5 relative">
                <label className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{isAr ? 'عمود حالة العملية' : 'Status Column'}</span>
                    <ColumnInfoTooltip
                      title={isAr ? 'عمود حالة العملية' : 'Status Column'}
                      description={
                        isAr
                          ? 'العمود الذي يوضح حالة الفاتورة أو الطلب (مثل: مكتمل، ملغي، قيد الانتظار، مدفوع).'
                          : 'Order status column (Completed, Cancelled, Pending, Paid, etc).'
                      }
                      examples={['الحالة', 'حالة الطلب', 'حالة الفاتورة', 'Status', 'Order Status', 'State']}
                      impact={
                        isAr
                          ? 'استبعاد العمليات الملغاة آلياً، وعرض معدل إتمام المعاملات وحالات الدفع.'
                          : 'Filters out cancelled transactions and gives completion rates.'
                      }
                      required={false}
                      isAr={isAr}
                      align="end"
                    />
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

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
              <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2">
                <span>
                  {isAr ? 'إجمالي المبيعات المحسوب: ' : 'Calculated Revenue: '}
                  <strong className="font-black text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(swot.summaryMetrics.totalRevenue, isAr)}
                  </strong>
                  {mapping.revenueType === 'unit_price' && (
                    <span className="text-[10px] text-emerald-600 font-normal ms-1">
                      ({isAr ? 'سعر الحبة × الكمية' : 'Unit × Qty'})
                    </span>
                  )}
                </span>
                <span>•</span>
                <span>
                  {isAr ? 'إجمالي التكلفة: ' : 'Total Cost: '}
                  <strong className="font-bold text-slate-700 dark:text-slate-200">
                    {formatCurrency(swot.summaryMetrics.totalCost, isAr)}
                  </strong>
                  {mapping.costType === 'unit_cost' && (
                    <span className="text-[10px] text-rose-500 font-normal ms-1">
                      ({isAr ? 'تكلفة الحبة × الكمية' : 'Unit × Qty'})
                    </span>
                  )}
                </span>
                <span>•</span>
                <span>
                  {isAr ? 'صافي الأرباح: ' : 'Net Profit: '}
                  <strong className="font-black text-blue-600 dark:text-blue-400">
                    {formatCurrency(swot.summaryMetrics.totalProfit, isAr)}
                  </strong>
                  <span className="text-[11px] font-semibold text-slate-400 ms-1">
                    ({swot.summaryMetrics.overallMarginPercent}%)
                  </span>
                </span>
              </div>

              <button
                onClick={() => {
                  setMappingConfirmed(true);
                  setShowMappingPanel(false);
                }}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold shadow-sm transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isAr ? 'اعتماد الأعمدة' : 'Confirm Mapping'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* STEP 2: Strengths, Weaknesses & Actionable Sales Improvement Proposals */}
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {isAr ? 'نقاط القوة والضعف ومقترحات التحسين' : 'Strengths, Weaknesses & Growth Proposals'}
          </h3>
        </div>

        {/* 2-Column Grid for Strengths & Weaknesses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Column 1: Strengths */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {isAr ? 'نقاط القوة' : 'Strengths'}
                </h4>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                {swot.strengths.length}
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

          {/* Column 2: Weaknesses */}
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {isAr ? 'نقاط الضعف والفجوات' : 'Weaknesses & Gaps'}
                </h4>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                {swot.weaknesses.length}
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

        {/* Actionable Sales Improvement Proposals */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700/60 pb-3">
            <div className="w-9 h-9 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center">
              <Rocket className="w-5 h-5" />
            </div>
            <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {isAr ? 'المقترحات التنفيذية لزيادة المبيعات' : 'Actionable Growth Proposals'}
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {swot.recommendations.map((rec, index) => (
              <div
                key={rec.id}
                className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                      <Sparkles className="w-3 h-3" />
                      #{index + 1}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rec.priority === 'high'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {rec.priority === 'high'
                        ? isAr
                          ? 'أولوية قصوى'
                          : 'High Priority'
                        : isAr
                        ? 'أولوية متوسطة'
                        : 'Medium'}
                    </span>
                  </div>

                  <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {rec.title}
                  </h5>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {rec.actionPlan}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold">
                    {isAr ? 'الأثر المتوقع:' : 'Impact:'}
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
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
