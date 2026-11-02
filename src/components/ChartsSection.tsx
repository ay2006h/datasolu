import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { SheetData, TimeGranularity } from '../types';
import { useI18n } from '../locales/i18nContext';
import { aggregateData, aggregateTimeSeries, formatCurrency } from '../utils/analyticsEngine';
import { BarChart3, PieChart, TrendingUp, Compass, Layers, Calendar } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartsSectionProps {
  sheet: SheetData;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ sheet }) => {
  const { t, language, theme } = useI18n();
  const isDark = theme === 'dark';
  const isAr = language === 'ar';
  const { rows, columns } = sheet;

  const numericCols = columns.filter((c) => c.type === 'number');
  const stringCols = columns.filter((c) => c.type === 'string' && c.uniqueCount <= 30);
  const dateCols = columns.filter((c) => c.type === 'date');

  // Auto-detect date column
  const primaryDate =
    dateCols.find((c) => {
      const n = c.name.toLowerCase();
      return n.includes('date') || n.includes('تاريخ') || n.includes('التاريخ');
    })?.name ||
    dateCols[0]?.name ||
    columns.find((c) => c.name.toLowerCase().includes('date') || c.name.toLowerCase().includes('تاريخ'))?.name ||
    '';

  const primaryNum = numericCols[0]?.name || '';
  const primaryCat = stringCols[0]?.name || columns[0]?.name || '';

  // State for user selectable metric and time granularity
  const [selectedNumCol, setSelectedNumCol] = useState(primaryNum);
  const [timeGranularity, setTimeGranularity] = useState<TimeGranularity>('month');
  const activeMetric = selectedNumCol || primaryNum;

  // 1. Time series data using full chronological aggregateTimeSeries
  const timeData = useMemo(() => {
    if (!primaryDate || !activeMetric) return null;
    return aggregateTimeSeries(rows, primaryDate, activeMetric, timeGranularity, 'sum', language);
  }, [rows, primaryDate, activeMetric, timeGranularity, language]);

  // 2. Category breakdown data
  const catData = useMemo(() => {
    if (!primaryCat || !activeMetric) return { labels: [], values: [] };
    return aggregateData(rows, primaryCat, activeMetric, 'sum');
  }, [rows, primaryCat, activeMetric]);

  // 3. Status or Secondary dimension share
  const statusCol = columns.find((c) => c.type === 'status') || stringCols[1] || stringCols[0];
  const shareData = useMemo(() => {
    if (!statusCol || !activeMetric) return { labels: [], values: [] };
    return aggregateData(rows, statusCol.name, activeMetric, 'count');
  }, [rows, statusCol, activeMetric]);

  // Chart options common theme
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: textColor,
          font: { family: 'Cairo, Inter, sans-serif', size: 12 },
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#334155',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        bodyFont: { family: 'Cairo, Inter, sans-serif' },
        titleFont: { family: 'Cairo, Inter, sans-serif', weight: 'bold' as const },
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${formatCurrency(context.raw, isAr)}`;
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

  const palette = [
    '#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316'
  ];

  return (
    <div className="space-y-6">
      {/* Metric Selector Toolbar */}
      {numericCols.length > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-500" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {language === 'ar' ? 'المؤشر الرقمي النشط في الرسوم:' : 'Active Metric in Charts:'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {numericCols.map((col) => (
              <button
                key={col.name}
                onClick={() => setSelectedNumCol(col.name)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                  activeMetric === col.name
                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                {col.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid of Executive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Trend Over Time (with Granularity Toggle: Days, Months, Quarters, Years) */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {timeData ? t.charts.trendOverTime : t.charts.breakdownByCategory}
                </h4>
                {primaryDate && (
                  <span className="text-[11px] text-slate-400">
                    {isAr ? `بناءً على: ${primaryDate}` : `Based on: ${primaryDate}`}
                  </span>
                )}
              </div>
            </div>

            {/* Granularity Pill Switcher */}
            {timeData && (
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setTimeGranularity('day')}
                  className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    timeGranularity === 'day'
                      ? 'bg-white dark:bg-slate-800 text-brand-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {isAr ? 'يومي' : 'Day'}
                </button>
                <button
                  onClick={() => setTimeGranularity('month')}
                  className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    timeGranularity === 'month'
                      ? 'bg-white dark:bg-slate-800 text-brand-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {isAr ? 'شهري' : 'Month'}
                </button>
                <button
                  onClick={() => setTimeGranularity('quarter')}
                  className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    timeGranularity === 'quarter'
                      ? 'bg-white dark:bg-slate-800 text-brand-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {isAr ? 'ربع سنوي' : 'Qtr'}
                </button>
                <button
                  onClick={() => setTimeGranularity('year')}
                  className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    timeGranularity === 'year'
                      ? 'bg-white dark:bg-slate-800 text-brand-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {isAr ? 'سنوي' : 'Year'}
                </button>
              </div>
            )}
          </div>

          <div className="h-72 w-full mt-2">
            {timeData ? (
              <Line
                data={{
                  labels: timeData.labels,
                  datasets: [
                    {
                      label: activeMetric,
                      data: timeData.values,
                      borderColor: '#0284c7',
                      backgroundColor: 'rgba(2, 132, 199, 0.15)',
                      fill: true,
                      tension: 0.35,
                      pointBackgroundColor: '#0284c7',
                      pointRadius: timeData.labels.length > 30 ? 2 : 4,
                      pointHoverRadius: 6,
                    },
                  ],
                }}
                options={commonOptions}
              />
            ) : (
              <Bar
                data={{
                  labels: catData.labels.slice(0, 10),
                  datasets: [
                    {
                      label: activeMetric,
                      data: catData.values.slice(0, 10),
                      backgroundColor: '#0284c7',
                      borderRadius: 6,
                    },
                  ],
                }}
                options={commonOptions}
              />
            )}
          </div>
        </div>

        {/* 2. Category Performance Comparison Bar Chart */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {t.charts.breakdownByCategory} ({primaryCat})
              </h4>
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {catData.labels.length} {language === 'ar' ? 'فئات' : 'categories'}
            </span>
          </div>

          <div className="h-72 w-full mt-2">
            <Bar
              data={{
                labels: catData.labels.slice(0, 10),
                datasets: [
                  {
                    label: activeMetric,
                    data: catData.values.slice(0, 10),
                    backgroundColor: catData.labels.slice(0, 10).map((_, i) => palette[i % palette.length]),
                    borderRadius: 8,
                  },
                ],
              }}
              options={{
                ...commonOptions,
                plugins: {
                  ...commonOptions.plugins,
                  legend: { display: false },
                },
              }}
            />
          </div>
        </div>

        {/* 3. Proportions Doughnut Chart */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <PieChart className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {t.charts.distributionShare} ({statusCol?.name || primaryCat})
              </h4>
            </div>
          </div>

          <div className="h-72 w-full flex items-center justify-center mt-2">
            <Doughnut
              data={{
                labels: shareData.labels,
                datasets: [
                  {
                    data: shareData.values,
                    backgroundColor: palette,
                    borderWidth: 2,
                    borderColor: isDark ? '#1e293b' : '#ffffff',
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right' as const,
                    labels: {
                      color: textColor,
                      font: { family: 'Cairo, Inter, sans-serif', size: 11 },
                    },
                  },
                },
                cutout: '65%',
              }}
            />
          </div>
        </div>

        {/* 4. Radar Matrix or Multi-metric Comparison */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {t.charts.performanceRadar}
              </h4>
            </div>
          </div>

          <div className="h-72 w-full flex items-center justify-center mt-2">
            <Radar
              data={{
                labels: catData.labels.slice(0, 6),
                datasets: [
                  {
                    label: activeMetric,
                    data: catData.values.slice(0, 6),
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    borderColor: '#6366f1',
                    pointBackgroundColor: '#6366f1',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#6366f1',
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  r: {
                    angleLines: { color: gridColor },
                    grid: { color: gridColor },
                    pointLabels: {
                      color: textColor,
                      font: { family: 'Cairo, Inter, sans-serif', size: 11 },
                    },
                    ticks: {
                      display: false,
                    },
                  },
                },
                plugins: {
                  legend: {
                    position: 'top' as const,
                    labels: { color: textColor, font: { family: 'Cairo, Inter, sans-serif' } },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
