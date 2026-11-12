import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Target,
  Upload,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { SheetData, SalesColumnMapping, WorkbookData } from '../types';
import { useI18n } from '../locales/i18nContext';
import {
  parseCleanNumber,
  isUnitPriceColumn,
  isUnitCostColumn,
  formatCurrency,
  autoDetectSalesMapping,
} from '../utils/analyticsEngine';
import { parseExcelFile } from '../utils/excelParser';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from './ui/Pagination';

interface SalesTargetAndComparisonPanelProps {
  sheet: SheetData;
  mapping: SalesColumnMapping;
}

const TARGET_STORAGE_KEY = 'datasolu_sales_targets_v1';

interface AggregatedPeriodStats {
  totalRevenue: number;
  totalProfit: number;
  totalCost: number;
  totalQty: number;
  byCategory: Record<string, { revenue: number; profit: number; qty: number }>;
  byRegion: Record<string, { revenue: number; profit: number; qty: number }>;
}

const computeRowsAggregate = (
  rows: Record<string, any>[],
  mapping: SalesColumnMapping
): AggregatedPeriodStats => {
  const revIsUnit = isUnitPriceColumn(mapping.revenueCol);
  const costIsUnit = isUnitCostColumn(mapping.costCol);

  let totalRevenue = 0;
  let totalProfit = 0;
  let totalCost = 0;
  let totalQty = 0;
  const byCategory: Record<string, { revenue: number; profit: number; qty: number }> = {};
  const byRegion: Record<string, { revenue: number; profit: number; qty: number }> = {};

  rows.forEach((row) => {
    const rawQty = mapping.qtyCol ? parseCleanNumber(row[mapping.qtyCol]) : 1;
    const effectiveQty = mapping.qtyCol ? (rawQty > 0 ? rawQty : 1) : 1;

    const rawRev = mapping.revenueCol ? parseCleanNumber(row[mapping.revenueCol]) : 0;
    const rowRev = revIsUnit && mapping.qtyCol ? rawRev * effectiveQty : rawRev;

    const rawCost = mapping.costCol ? parseCleanNumber(row[mapping.costCol]) : 0;
    const rowCost = costIsUnit && mapping.qtyCol ? rawCost * effectiveQty : rawCost;

    let rowProfit = 0;
    if (mapping.profitCol) {
      rowProfit = parseCleanNumber(row[mapping.profitCol]);
    } else if (mapping.revenueCol && mapping.costCol) {
      rowProfit = rowRev - rowCost;
    } else {
      rowProfit = rowRev * 0.25;
    }

    totalRevenue += rowRev;
    totalCost += rowCost;
    totalProfit += rowProfit;
    totalQty += effectiveQty;

    if (mapping.categoryCol) {
      const cat = String(row[mapping.categoryCol] || 'غير مصنف').trim() || 'غير مصنف';
      if (!byCategory[cat]) byCategory[cat] = { revenue: 0, profit: 0, qty: 0 };
      byCategory[cat].revenue += rowRev;
      byCategory[cat].profit += rowProfit;
      byCategory[cat].qty += effectiveQty;
    }

    if (mapping.regionCol) {
      const reg = String(row[mapping.regionCol] || 'غير محدد').trim() || 'غير محدد';
      if (!byRegion[reg]) byRegion[reg] = { revenue: 0, profit: 0, qty: 0 };
      byRegion[reg].revenue += rowRev;
      byRegion[reg].profit += rowProfit;
      byRegion[reg].qty += effectiveQty;
    }
  });

  return {
    totalRevenue,
    totalProfit,
    totalCost,
    totalQty,
    byCategory,
    byRegion,
  };
};

export const SalesTargetAndComparisonPanel: React.FC<SalesTargetAndComparisonPanelProps> = ({
  sheet,
  mapping,
}) => {
  const { language } = useI18n();
  const isAr = language === 'ar';

  const [targets, setTargets] = useState<{
    revenueTarget: number;
    profitTarget: number;
    remainingDays: number;
  }>(() => {
    try {
      const saved = localStorage.getItem(TARGET_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          revenueTarget: Number(parsed.revenueTarget) || 0,
          profitTarget: Number(parsed.profitTarget) || 0,
          remainingDays: Math.max(1, Number(parsed.remainingDays) || 15),
        };
      }
    } catch {
      // ignore
    }
    return { revenueTarget: 0, profitTarget: 0, remainingDays: 15 };
  });

  useEffect(() => {
    try {
      localStorage.setItem(TARGET_STORAGE_KEY, JSON.stringify(targets));
    } catch {
      // ignore
    }
  }, [targets]);

  const currentStats = useMemo(
    () => computeRowsAggregate(sheet.rows, mapping),
    [sheet.rows, mapping]
  );

  const effectiveRevTarget =
    targets.revenueTarget > 0
      ? targets.revenueTarget
      : Math.round(currentStats.totalRevenue * 1.2);
  const effectiveProfitTarget =
    targets.profitTarget > 0
      ? targets.profitTarget
      : Math.round(Math.max(1000, currentStats.totalProfit * 1.25));

  const revProgressPct =
    effectiveRevTarget > 0
      ? Math.min(200, (currentStats.totalRevenue / effectiveRevTarget) * 100)
      : 0;
  const profitProgressPct =
    effectiveProfitTarget > 0
      ? Math.min(200, (currentStats.totalProfit / effectiveProfitTarget) * 100)
      : 0;

  const remainingRevToTarget = Math.max(0, effectiveRevTarget - currentStats.totalRevenue);
  const remainingProfitToTarget = Math.max(0, effectiveProfitTarget - currentStats.totalProfit);
  const requiredDailyRev =
    targets.remainingDays > 0 ? remainingRevToTarget / targets.remainingDays : remainingRevToTarget;
  const requiredDailyProfit =
    targets.remainingDays > 0
      ? remainingProfitToTarget / targets.remainingDays
      : remainingProfitToTarget;

  const [comparisonWorkbook, setComparisonWorkbook] = useState<WorkbookData | null>(null);
  const [comparisonError, setComparisonError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadComparisonFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setComparisonError(null);
    try {
      const wb = await parseExcelFile(file);
      setComparisonWorkbook(wb);
    } catch (err: any) {
      setComparisonError(
        err?.message || (isAr ? 'تعذر قراءة ملف المقارنة' : 'Failed to parse comparison file')
      );
    } finally {
      e.target.value = '';
    }
  };

  const comparisonData = useMemo(() => {
    if (comparisonWorkbook && comparisonWorkbook.activeSheet) {
      const prevSheet = comparisonWorkbook.sheets[comparisonWorkbook.activeSheet];
      if (prevSheet && prevSheet.rows.length > 0) {
        const prevMapping = autoDetectSalesMapping(prevSheet.columns);
        const prevStats = computeRowsAggregate(prevSheet.rows, {
          ...prevMapping,
          revenueCol: prevMapping.revenueCol || mapping.revenueCol,
          profitCol: prevMapping.profitCol || mapping.profitCol,
          costCol: prevMapping.costCol || mapping.costCol,
          qtyCol: prevMapping.qtyCol || mapping.qtyCol,
          categoryCol: prevMapping.categoryCol || mapping.categoryCol,
          regionCol: prevMapping.regionCol || mapping.regionCol,
        });
        return {
          mode: 'external_file' as const,
          prevLabelAr: `الملف السابق (${comparisonWorkbook.fileName})`,
          prevLabelEn: `Previous (${comparisonWorkbook.fileName})`,
          currLabelAr: 'الملف الحالي',
          currLabelEn: 'Current',
          prevStats,
          currStats: currentStats,
        };
      }
    }

    const mid = Math.max(1, Math.floor(sheet.rows.length / 2));
    const firstHalfRows = sheet.rows.slice(0, mid);
    const secondHalfRows = sheet.rows.slice(mid);

    return {
      mode: 'auto_split' as const,
      prevLabelAr: 'النصف الأول من الفترة',
      prevLabelEn: 'First Half',
      currLabelAr: 'النصف الثاني (الأحدث)',
      currLabelEn: 'Second Half',
      prevStats: computeRowsAggregate(firstHalfRows, mapping),
      currStats: computeRowsAggregate(secondHalfRows, mapping),
    };
  }, [comparisonWorkbook, sheet.rows, mapping, currentStats]);

  const revGrowthPct =
    comparisonData.prevStats.totalRevenue > 0
      ? ((comparisonData.currStats.totalRevenue - comparisonData.prevStats.totalRevenue) /
          comparisonData.prevStats.totalRevenue) *
        100
      : 0;
  const profitGrowthPct =
    comparisonData.prevStats.totalProfit !== 0
      ? ((comparisonData.currStats.totalProfit - comparisonData.prevStats.totalProfit) /
          Math.abs(comparisonData.prevStats.totalProfit)) *
        100
      : 0;
  const qtyGrowthPct =
    comparisonData.prevStats.totalQty > 0
      ? ((comparisonData.currStats.totalQty - comparisonData.prevStats.totalQty) /
          comparisonData.prevStats.totalQty) *
        100
      : 0;

  const allShifts = useMemo(() => {
    const allCats = new Set([
      ...Object.keys(comparisonData.prevStats.byCategory),
      ...Object.keys(comparisonData.currStats.byCategory),
    ]);
    const catList = Array.from(allCats).map((cat) => {
      const prevRev = comparisonData.prevStats.byCategory[cat]?.revenue || 0;
      const currRev = comparisonData.currStats.byCategory[cat]?.revenue || 0;
      const diff = currRev - prevRev;
      const pct = prevRev > 0 ? (diff / prevRev) * 100 : currRev > 0 ? 100 : 0;
      return { name: cat, prevRev, currRev, diff, pct };
    });

    const allRegs = new Set([
      ...Object.keys(comparisonData.prevStats.byRegion),
      ...Object.keys(comparisonData.currStats.byRegion),
    ]);
    const regList = Array.from(allRegs).map((reg) => {
      const prevRev = comparisonData.prevStats.byRegion[reg]?.revenue || 0;
      const currRev = comparisonData.currStats.byRegion[reg]?.revenue || 0;
      const diff = currRev - prevRev;
      const pct = prevRev > 0 ? (diff / prevRev) * 100 : currRev > 0 ? 100 : 0;
      return { name: reg, prevRev, currRev, diff, pct };
    });

    return [...catList, ...regList].sort((a, b) => b.diff - a.diff);
  }, [comparisonData]);

  const shiftsPg = usePagination(allShifts, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Sales & Profit Target Gauge */}
      <div className="rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700/70 pb-3">
          <div className="w-9 h-9 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {isAr ? 'مستهدفات المبيعات والأرباح الشهرية' : 'Monthly Sales & Profit Targets'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <label className="text-[11px] font-bold text-slate-500 block">
              {isAr ? 'هدف المبيعات:' : 'Revenue Target:'}
            </label>
            <input
              type="number"
              min="0"
              step="500"
              value={effectiveRevTarget}
              onChange={(e) =>
                setTargets((prev) => ({
                  ...prev,
                  revenueTarget: Math.max(0, Number(e.target.value)),
                }))
              }
              className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-black text-slate-900 dark:text-white"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <label className="text-[11px] font-bold text-slate-500 block">
              {isAr ? 'هدف صافي الربح:' : 'Profit Target:'}
            </label>
            <input
              type="number"
              min="0"
              step="250"
              value={effectiveProfitTarget}
              onChange={(e) =>
                setTargets((prev) => ({
                  ...prev,
                  profitTarget: Math.max(0, Number(e.target.value)),
                }))
              }
              className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-black text-slate-900 dark:text-white"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <label className="text-[11px] font-bold text-slate-500 block">
              {isAr ? 'الأيام المتبقية:' : 'Remaining Days:'}
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={targets.remainingDays}
              onChange={(e) =>
                setTargets((prev) => ({
                  ...prev,
                  remainingDays: Math.max(1, Number(e.target.value)),
                }))
              }
              className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-black text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Revenue Target Gauge */}
        <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {isAr ? 'إنجاز المبيعات:' : 'Revenue:'}{' '}
              {formatCurrency(currentStats.totalRevenue, isAr)} / {formatCurrency(effectiveRevTarget, isAr)}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black">
              {revProgressPct.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-emerald-200/70 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, revProgressPct)}%` }}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
            <span>
              {remainingRevToTarget > 0
                ? `${isAr ? 'المتبقي:' : 'Remaining:'} ${formatCurrency(remainingRevToTarget, isAr)}`
                : isAr
                ? 'تم تحقيق الهدف'
                : 'Target achieved'}
            </span>
            {remainingRevToTarget > 0 && (
              <span className="text-emerald-700 dark:text-emerald-300 font-black">
                {formatCurrency(requiredDailyRev, isAr)} / {isAr ? 'يوم' : 'day'}
              </span>
            )}
          </div>
        </div>

        {/* Profit Target Gauge */}
        <div className="p-3.5 rounded-xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200/80 dark:border-brand-800/60 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {isAr ? 'إنجاز الربح:' : 'Profit:'}{' '}
              {formatCurrency(currentStats.totalProfit, isAr)} / {formatCurrency(effectiveProfitTarget, isAr)}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-brand-600 text-white font-black">
              {profitProgressPct.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-brand-200/70 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full bg-brand-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, profitProgressPct)}%` }}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
            <span>
              {remainingProfitToTarget > 0
                ? `${isAr ? 'المتبقي:' : 'Remaining:'} ${formatCurrency(remainingProfitToTarget, isAr)}`
                : isAr
                ? 'تم تحقيق الهدف'
                : 'Target achieved'}
            </span>
            {remainingProfitToTarget > 0 && (
              <span className="text-brand-700 dark:text-brand-300 font-black">
                {formatCurrency(requiredDailyProfit, isAr)} / {isAr ? 'يوم' : 'day'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Period-over-Period Comparison */}
      <div className="rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700/70 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {isAr ? 'مقارنة الفترتين (الحالية مقابل السابقة)' : 'Period Comparison'}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleUploadComparisonFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isAr ? 'ملف الفترة السابقة' : 'Previous File'}</span>
            </button>
            {comparisonWorkbook && (
              <button
                type="button"
                onClick={() => setComparisonWorkbook(null)}
                className="p-1.5 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 hover:bg-rose-200"
                title={isAr ? 'إلغاء ملف المقارنة' : 'Clear comparison file'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {comparisonError && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold">
            {comparisonError}
          </div>
        )}

        <div className="text-[11px] font-bold text-brand-600 dark:text-brand-300 bg-brand-50/70 dark:bg-brand-950/50 px-3 py-1.5 rounded-lg border border-brand-200/70 dark:border-brand-800/60 flex items-center justify-between">
          <span>
            {isAr
              ? `${comparisonData.currLabelAr} مقابل ${comparisonData.prevLabelAr}`
              : `${comparisonData.currLabelEn} vs ${comparisonData.prevLabelEn}`}
          </span>
          <CheckCircle2 className="w-3.5 h-3.5" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 block">
              {isAr ? 'نمو المبيعات' : 'Revenue Change'}
            </span>
            <div
              className={`text-sm sm:text-base font-black mt-0.5 flex items-center gap-1 ${
                revGrowthPct >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {revGrowthPct >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>
                {revGrowthPct >= 0 ? '+' : ''}
                {revGrowthPct.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 block">
              {isAr ? 'نمو الأرباح' : 'Profit Change'}
            </span>
            <div
              className={`text-sm sm:text-base font-black mt-0.5 flex items-center gap-1 ${
                profitGrowthPct >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {profitGrowthPct >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>
                {profitGrowthPct >= 0 ? '+' : ''}
                {profitGrowthPct.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 block">
              {isAr ? 'نمو الكميات' : 'Volume Change'}
            </span>
            <div
              className={`text-sm sm:text-base font-black mt-0.5 flex items-center gap-1 ${
                qtyGrowthPct >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {qtyGrowthPct >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>
                {qtyGrowthPct >= 0 ? '+' : ''}
                {qtyGrowthPct.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Paginated Category & Branch Shift Table */}
        {allShifts.length > 0 && (
          <div className="space-y-2">
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold">
                  <tr>
                    <th className="py-2 px-3 text-start sticky start-0 bg-slate-100 dark:bg-slate-900 z-10">
                      {isAr ? 'الفئة / الفرع' : 'Category / Branch'}
                    </th>
                    <th className="py-2 px-2 text-center">{isAr ? 'السابقة' : 'Prev'}</th>
                    <th className="py-2 px-2 text-center">{isAr ? 'الحالية' : 'Curr'}</th>
                    <th className="py-2 px-2 text-center">{isAr ? 'التغير' : 'Change'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {shiftsPg.pageItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-2 px-3 font-bold text-slate-900 dark:text-white sticky start-0 bg-white dark:bg-slate-800 z-10 whitespace-nowrap">
                        {item.name}
                      </td>
                      <td className="py-2 px-2 text-center font-mono">
                        {formatCurrency(item.prevRev, isAr)}
                      </td>
                      <td className="py-2 px-2 text-center font-mono font-bold">
                        {formatCurrency(item.currRev, isAr)}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            item.pct >= 0
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {item.pct >= 0 ? '+' : ''}
                          {item.pct.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={shiftsPg.page}
              totalPages={shiftsPg.totalPages}
              pageSize={shiftsPg.pageSize}
              total={shiftsPg.total}
              onPageChange={shiftsPg.setPage}
              onPageSizeChange={shiftsPg.setPageSize}
              pageSizeOptions={[5, 10, 25, 50]}
            />
          </div>
        )}
      </div>
    </div>
  );
};
