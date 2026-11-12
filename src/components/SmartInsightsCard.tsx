import React from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Info,
  CheckCircle,
} from 'lucide-react';
import { BusinessInsight } from '../types';
import { useI18n } from '../locales/i18nContext';

interface SmartInsightsCardProps {
  insights: BusinessInsight[];
}

export const SmartInsightsCard: React.FC<SmartInsightsCardProps> = ({ insights }) => {
  const { t, language } = useI18n();

  const getInsightIcon = (type: BusinessInsight['type']) => {
    switch (type) {
      case 'positive':
        return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'opportunity':
        return <Lightbulb className="w-5 h-5 text-indigo-500" />;
      default:
        return <Info className="w-5 h-5 text-brand-500" />;
    }
  };

  const getInsightBorder = (type: BusinessInsight['type']) => {
    switch (type) {
      case 'positive':
        return 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20';
      case 'warning':
        return 'border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20';
      case 'opportunity':
        return 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20';
      default:
        return 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/20';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-700/60">
        <div className="w-9 h-9 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center">
          <Sparkles className="w-5 h-5" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          {t.insights.title}
        </h3>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`p-4 rounded-2xl border transition-all hover:shadow-md ${getInsightBorder(
              insight.type
            )}`}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex-shrink-0">
                {getInsightIcon(insight.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {language === 'ar' ? insight.titleAr : insight.titleEn}
                  </h4>
                  {insight.metric && (
                    <span className="text-xs font-black text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-full flex-shrink-0">
                      {insight.metric}
                    </span>
                  )}
                </div>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {language === 'ar' ? insight.descriptionAr : insight.descriptionEn}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
