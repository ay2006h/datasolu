import React, { useState } from 'react';
import { SheetData, ChartType, AggregationType } from '../types';
import { useI18n } from '../locales/i18nContext';
import { aggregateData } from '../utils/analyticsEngine';
import { Bar, Line, Doughnut, Radar } from 'react-chartjs-2';
import { Sliders, Sparkles, BarChart, LineChart, PieChart, Activity } from 'lucide-react';

interface CustomChartBuilderProps {
  sheet: SheetData;
}

export const CustomChartBuilder: React.FC<CustomChartBuilderProps> = ({ sheet }) => {
  const { t, language, theme } = useI18n();
  const isDark = theme === 'dark';
  const { rows, columns } = sheet;

  const numericCols = columns.filter((c) => c.type === 'number');
  const allCols = columns;

  const [chartType, setChartType] = useState<ChartType>('bar');
  const [xCol, setXCol] = useState<string>(allCols[0]?.name || '');
  const [yCol, setYCol] = useState<string>(numericCols[0]?.name || allCols[0]?.name || '');
  const [aggregation, setAggregation] = useState<AggregationType>('sum');
  const [sortBy, setSortBy] = useState<'desc' | 'asc' | 'none'>('desc');

  // Compute aggregated data
  const rawAgg = xCol && yCol ? aggregateData(rows, xCol, yCol, aggregation) : { labels: [], values: [] };

  // Sort data if requested
  const combined = rawAgg.labels.map((label, i) => ({ label, value: rawAgg.values[i] }));
  if (sortBy === 'desc') {
    combined.sort((a, b) => b.value - a.value);
  } else if (sortBy === 'asc') {
    combined.sort((a, b) => a.value - b.value);
  }

  const sortedLabels = combined.map((c) => c.label).slice(0, 15);
  const sortedValues = combined.map((c) => c.value).slice(0, 15);

  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';

  const palette = [
    '#0284c7', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#06b6d4'
  ];

  const chartData = {
    labels: sortedLabels,
    datasets: [
      {
        label: `${yCol} (${aggregation.toUpperCase()})`,
        data: sortedValues,
        backgroundColor: chartType === 'pie' || chartType === 'doughnut' ? palette : 'rgba(2, 132, 199, 0.75)',
        borderColor: '#0284c7',
        borderWidth: chartType === 'line' || chartType === 'radar' ? 2 : 1,
        borderRadius: chartType === 'bar' ? 6 : 0,
        fill: chartType === 'area',
        tension: 0.35,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: textColor,
          font: { family: 'Cairo, Inter, sans-serif' },
        },
      },
    },
    scales:
      chartType !== 'pie' && chartType !== 'doughnut' && chartType !== 'radar'
        ? {
            x: { ticks: { color: textColor, font: { family: 'Cairo, Inter, sans-serif' } }, grid: { color: gridColor } },
            y: { ticks: { color: textColor, font: { family: 'Cairo, Inter, sans-serif' } }, grid: { color: gridColor } },
          }
        : undefined,
  };

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-700/60">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center">
          <Sliders className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {t.charts.customBuilderTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.charts.customBuilderSubtitle}
          </p>
        </div>
      </div>

      {/* Control Form Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800">
        {/* 1. Chart Type */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
            {t.charts.chartType}
          </label>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as ChartType)}
            className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-500"
          >
            <option value="bar">{t.charts.barChart}</option>
            <option value="line">{t.charts.lineChart}</option>
            <option value="pie">{t.charts.pieChart}</option>
            <option value="doughnut">{t.charts.doughnutChart}</option>
            <option value="radar">{t.charts.radarChart}</option>
          </select>
        </div>

        {/* 2. X Axis */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
            {t.charts.xAxis}
          </label>
          <select
            value={xCol}
            onChange={(e) => setXCol(e.target.value)}
            className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-500"
          >
            {allCols.map((col) => (
              <option key={col.name} value={col.name}>
                {col.name} ({col.type})
              </option>
            ))}
          </select>
        </div>

        {/* 3. Y Axis */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
            {t.charts.yAxis}
          </label>
          <select
            value={yCol}
            onChange={(e) => setYCol(e.target.value)}
            className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-500"
          >
            {numericCols.map((col) => (
              <option key={col.name} value={col.name}>
                {col.name}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Aggregation */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
            {t.charts.aggregation}
          </label>
          <select
            value={aggregation}
            onChange={(e) => setAggregation(e.target.value as AggregationType)}
            className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-500"
          >
            <option value="sum">{t.charts.sum}</option>
            <option value="avg">{t.charts.avg}</option>
            <option value="count">{t.charts.count}</option>
            <option value="max">{t.charts.max}</option>
            <option value="min">{t.charts.min}</option>
          </select>
        </div>
      </div>

      {/* Rendered Chart Canvas */}
      <div className="h-80 w-full p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center">
        {chartType === 'bar' && <Bar data={chartData} options={chartOptions} />}
        {chartType === 'line' && <Line data={chartData} options={chartOptions} />}
        {chartType === 'pie' && <Doughnut data={chartData} options={{ ...chartOptions, cutout: 0 }} />}
        {chartType === 'doughnut' && <Doughnut data={chartData} options={chartOptions} />}
        {chartType === 'radar' && <Radar data={chartData} options={chartOptions} />}
      </div>
    </div>
  );
};
