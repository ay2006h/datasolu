import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  Layers,
  CheckCircle2,
  BarChart2,
  Activity,
} from 'lucide-react';
import { KpiMetric } from '../types';
import { useI18n } from '../locales/i18nContext';

interface KpiCardsProps {
  metrics: KpiMetric[];
}

export const KpiCards: React.FC<KpiCardsProps> = ({ metrics }) => {
  const { t, language } = useI18n();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'TrendingUp':
        return <TrendingUp className="w-5 h-5" />;
      case 'DollarSign':
        return <DollarSign className="w-5 h-5" />;
      case 'Receipt':
        return <Receipt className="w-5 h-5" />;
      case 'Layers':
        return <Layers className="w-5 h-5" />;
      case 'CheckCircle2':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'BarChart2':
        return <BarChart2 className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'emerald':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/40',
          border: 'border-emerald-200 dark:border-emerald-800/60',
          iconBg: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300',
          text: 'text-emerald-600 dark:text-emerald-400',
          badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/80 dark:text-emerald-300',
        };
      case 'blue':
        return {
          bg: 'bg-blue-50 dark:bg-blue-950/40',
          border: 'border-blue-200 dark:border-blue-800/60',
          iconBg: 'bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300',
          text: 'text-blue-600 dark:text-blue-400',
          badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/80 dark:text-blue-300',
        };
      case 'purple':
        return {
          bg: 'bg-purple-50 dark:bg-purple-950/40',
          border: 'border-purple-200 dark:border-purple-800/60',
          iconBg: 'bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300',
          text: 'text-purple-600 dark:text-purple-400',
          badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/80 dark:text-purple-300',
        };
      case 'amber':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/40',
          border: 'border-amber-200 dark:border-amber-800/60',
          iconBg: 'bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300',
          text: 'text-amber-600 dark:text-amber-400',
          badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/80 dark:text-amber-300',
        };
      case 'rose':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/40',
          border: 'border-rose-200 dark:border-rose-800/60',
          iconBg: 'bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300',
          text: 'text-rose-600 dark:text-rose-400',
          badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/80 dark:text-rose-300',
        };
      default:
        return {
          bg: 'bg-indigo-50 dark:bg-indigo-950/40',
          border: 'border-indigo-200 dark:border-indigo-800/60',
          iconBg: 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300',
          text: 'text-indigo-600 dark:text-indigo-400',
          badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/80 dark:text-indigo-300',
        };
    }
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {metrics.map((kpi) => {
        const colors = getColorClasses(kpi.color);

        return (
          <div
            key={kpi.id}
            className="relative overflow-hidden rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 transition-all duration-200 hover:shadow-md bg-white dark:bg-slate-800/90"
          >
            {/* Top row: title & icon */}
            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 line-clamp-1">
                {language === 'ar' ? kpi.title : kpi.titleEn}
              </span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors.iconBg}`}>
                {getIcon(kpi.icon)}
              </div>
            </div>

            {/* Value */}
            <div className="flex items-baseline gap-2 mb-2">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {kpi.formattedValue}
              </h3>
            </div>

            {/* Bottom row: trend & subtitle */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-700/60">
              {kpi.changePercent !== undefined && (
                <div
                  className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[11px] ${
                    kpi.trend === 'up'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                      : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                  }`}
                >
                  {kpi.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{kpi.changePercent > 0 ? `+${kpi.changePercent}%` : `${kpi.changePercent}%`}</span>
                </div>
              )}

              {kpi.subtitle && (
                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                  {kpi.subtitle}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
