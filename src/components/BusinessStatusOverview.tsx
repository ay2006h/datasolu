import React from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Target,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { BusinessStatusSummary } from '../types';
import { useI18n } from '../locales/i18nContext';

interface BusinessStatusOverviewProps {
  statusData: BusinessStatusSummary;
}

export const BusinessStatusOverview: React.FC<BusinessStatusOverviewProps> = ({
  statusData,
}) => {
  const { t, language } = useI18n();

  const getHealthBadge = (score: number) => {
    if (score >= 85) {
      return {
        label: t.businessStatus.excellent,
        bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        color: '#10b981',
      };
    }
    if (score >= 70) {
      return {
        label: t.businessStatus.good,
        bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        color: '#3b82f6',
      };
    }
    if (score >= 50) {
      return {
        label: t.businessStatus.warning,
        bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        color: '#f59e0b',
      };
    }
    return {
      label: t.businessStatus.critical,
      bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      color: '#ef4444',
    };
  };

  const healthBadge = getHealthBadge(statusData.overallHealthScore);

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {t.businessStatus.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.businessStatus.subtitle}
            </p>
          </div>
        </div>

        {/* Health status badge */}
        <div
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 ${healthBadge.bg}`}
        >
          <span
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{ backgroundColor: healthBadge.color }}
          />
          <span>{healthBadge.label}</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* 1. Health Score Gauge Card */}
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG circular gauge */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-200 dark:text-slate-700"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                strokeDasharray={`${statusData.overallHealthScore}, 100`}
                strokeWidth="3.8"
                strokeLinecap="round"
                stroke={healthBadge.color}
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {statusData.overallHealthScore}%
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {language === 'ar' ? 'مؤشر الكفاءة' : 'Index'}
              </span>
            </div>
          </div>

          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-3">
            {t.businessStatus.healthScore}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[200px]">
            {language === 'ar'
              ? 'مبني على سرعة التنفيذ ونسب الإنجاز ومعالجة التأخيرات'
              : 'Computed based on completion velocity and resolved bottlenecks'}
          </p>
        </div>

        {/* 2. Operations Status Breakdown */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {t.businessStatus.statusBreakdown}
            </h4>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {statusData.totalVolume} {language === 'ar' ? 'معاملة / مشروع' : 'total items'}
            </span>
          </div>

          {/* Progress Stack Bar */}
          <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-700 p-0.5 gap-0.5">
            {statusData.statusCounts.map((item, idx) => (
              <div
                key={idx}
                style={{
                  width: `${Math.max(item.percentage, 3)}%`,
                  backgroundColor: item.color,
                }}
                className="h-full rounded-sm transition-all duration-500 first:rounded-l-full last:rounded-r-full"
                title={`${item.status}: ${item.count} (${item.percentage}%)`}
              />
            ))}
          </div>

          {/* Status Pills Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {statusData.statusCounts.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                    {item.status}
                  </span>
                </div>
                <div className="text-end">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {item.count}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Target vs Actual Progress Indicator */}
          <div className="p-4 rounded-xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200/70 dark:border-brand-800/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-300 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  {t.businessStatus.targetVsActual}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {language === 'ar' ? 'الهدف الفصلي المستهدف: 100%' : 'Target Quarterly Milestone: 100%'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-32 bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-brand-600 dark:bg-brand-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${statusData.targetAchievedPercent}%` }}
                />
              </div>
              <span className="text-xs font-black text-brand-700 dark:text-brand-300">
                {statusData.targetAchievedPercent}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
