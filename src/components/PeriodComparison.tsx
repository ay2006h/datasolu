import React, { useState, useMemo } from 'react';
import { SheetData, TimeGranularity } from '../types';
import { useI18n } from '../locales/i18nContext';
import { aggregateTimeSeries, formatCurrency } from '../utils/analyticsEngine';
import { Bar } from 'react-chartjs-2';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Layers,
  Award,
  AlertCircle,
} from 'lucide-react';

interface PeriodComparisonProps {
  sheet: SheetData;
}

export const PeriodComparison: React.FC<PeriodComparisonProps> = ({ sheet }) => {
  const { t, language, theme } = useI18n();
  const isAr = language === 'ar';
  const isDark = theme === 'dark';
  const { rows, columns } = sheet;

  const dateCols = columns.filter((c) => c.type === 'date');
  const numericCols = columns.filter((c) => c.type === 'number');

  // Auto detect primary date column
  const primaryDateCol =
    dateCols.find((c) => {
      const n = c.name.toLowerCase();
      return n.includes('date') || n.includes('تاريخ') || n.includes('التاريخ');
    })?.name ||
    dateCols[0]?.name ||
    columns.find((c) => c.name.toLowerCase().includes('date') || c.name.toLowerCase().includes('تاريخ'))?.name ||
    '';

  const [selectedDateCol, setSelectedDateCol] = useState<string>(primaryDateCol);
  const [selectedMetric, setSelectedMetric] = useState<string>(numericCols[0]?.name || '');
  const [granularity, setGranularity] = useState<TimeGranularity>('month');

  const activeDate = selectedDateCol || primaryDateCol;
  const activeMetric = selectedMetric || numericCols[0]?.name || '';

  // Compute time series aggregation
  const timeResult = useMemo(() => {
    if (!activeDate || !activeMetric) return null;
    return aggregateTimeSeries(rows, activeDate, activeMetric, granularity, 'sum', language);
  }, [rows, activeDate, activeMetric, granularity, language]);

  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';

  if (!timeResult || timeResult.labels.length === 0) {
    return null;
  }

  const { labels, values, periods, summary } = timeResult;

  // Chart data
  const chartData = {
    labels,
    datasets: [
      {
        label: activeMetric,
        data: values,
        backgroundColor: values.map((v, i) => {
          if (summary.highestPeriod && v === summary.highestPeriod.value) return '#10b981'; // Green for best
          if (summary.lowestPeriod && v === summary.lowestPeriod.value) return '#f59e0b'; // Amber for lowest
          return '#0284c7';
        }),
        borderRadius: 8,
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#334155',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        boxPadding: 4,
        bodyFont: { family: 'Cairo, Inter, sans-serif' },
        titleFont: { family: 'Cairo, Inter, sans-serif', weight: 'bold' as const },
        callbacks: {
          label: (context: any) => {
            const idx = context.dataIndex;
            const period = periods[idx];
            const valStr = `${context.dataset.label}: ${formatCurrency(context.raw, isAr)}`;
            const growthStr =
              period?.growthPercent !== undefined
                ? ` (${period.growthPercent >= 0 ? '+' : ''}${period.growthPercent}%)`
                : '';
            return valStr + growthStr;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: textColor, font: { family: 'Cairo, Inter, sans-serif' } },
        grid: { color: gridColor },
      },
      y: {
        ticks: { color: textColor, font: { family: 'Cairo, Inter, sans-serif' } },
        grid: { color: gridColor },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-6">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {t.time.compareTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.time.compareSubtitle}
            </p>
          </div>
        </div>

        {/* Time Granularity Switcher Pills */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 px-2 hidden sm:inline">
            {t.time.granularity}
          </span>
          <button
            onClick={() => setGranularity('day')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              granularity === 'day'
                ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {t.time.day}
          </button>
          <button
            onClick={() => setGranularity('month')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              granularity === 'month'
                ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {t.time.month}
          </button>
          <button
            onClick={() => setGranularity('quarter')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              granularity === 'quarter'
                ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {t.time.quarter}
          </button>
          <button
            onClick={() => setGranularity('year')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              granularity === 'year'
                ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {t.time.year}
          </button>
        </div>
      </div>

      {/* Metric and Date Column Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-500" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {t.time.dateColumn}
            </span>
            <select
              value={activeDate}
              onChange={(e) => setSelectedDateCol(e.target.value)}
              className="text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-1.5 text-slate-800 dark:text-slate-200"
            >
              {columns.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} {c.type === 'date' ? `(${isAr ? 'تاريخ' : 'Date'})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {isAr ? 'المؤشر المراد مقارنته:' : 'Metric to Compare:'}
            </span>
            <select
              value={activeMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-1.5 text-slate-800 dark:text-slate-200"
            >
              {numericCols.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <span className="text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-3 py-1 rounded-full">
          {periods.length} {isAr ? 'فترات زمنية محللة' : 'analyzed periods'}
        </span>
      </div>

      {/* Summary Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Peak Period */}
        {summary.highestPeriod && (
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                  {t.time.peakPeriod}
                </span>
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {summary.highestPeriod.label}
                </span>
              </div>
            </div>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(summary.highestPeriod.value, isAr)}
            </span>
          </div>
        )}

        {/* Lowest Period */}
        {summary.lowestPeriod && (
          <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                  {t.time.lowestPeriod}
                </span>
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {summary.lowestPeriod.label}
                </span>
              </div>
            </div>
            <span className="text-sm font-black text-amber-600 dark:text-amber-400">
              {formatCurrency(summary.lowestPeriod.value, isAr)}
            </span>
          </div>
        )}

        {/* Overall Growth */}
        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                {t.time.overallGrowth}
              </span>
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {summary.growthTotal >= 0 ? `+${summary.growthTotal}%` : `${summary.growthTotal}%`}
              </span>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {isAr ? 'من البداية للنهاية' : 'Start to End'}
          </span>
        </div>
      </div>

      {/* Comparative Bar Chart */}
      <div className="h-80 w-full mt-2">
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* Comparative Breakdown Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-700">
        <table className="w-full text-xs text-start">
          <thead className="bg-slate-100/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-3.5 text-start">{isAr ? 'الفترة الزمنية' : 'Period'}</th>
              <th className="p-3.5 text-center">{t.time.periodTotal} ({activeMetric})</th>
              <th className="p-3.5 text-center">{t.time.periodAvg}</th>
              <th className="p-3.5 text-center">{t.time.transactionsCount}</th>
              <th className="p-3.5 text-center">{t.time.growthRate}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {periods.map((p, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30">
                <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                  {p.periodLabel}
                </td>
                <td className="p-3.5 text-center font-mono font-bold text-brand-600 dark:text-brand-400">
                  {formatCurrency(p.totalValue, isAr)}
                </td>
                <td className="p-3.5 text-center font-mono">
                  {formatCurrency(p.avgValue, isAr)}
                </td>
                <td className="p-3.5 text-center font-mono">
                  {p.count}
                </td>
                <td className="p-3.5 text-center">
                  {p.growthPercent !== undefined ? (
                    <span
                      className={`inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
                        p.growthPercent >= 0
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {p.growthPercent >= 0 ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      )}
                      <span>{p.growthPercent >= 0 ? `+${p.growthPercent}%` : `${p.growthPercent}%`}</span>
                    </span>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
