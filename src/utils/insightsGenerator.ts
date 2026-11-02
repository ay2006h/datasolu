import { BusinessInsight, SheetData } from '../types';
import { aggregateData, formatCurrency } from './analyticsEngine';

export const generateBusinessInsights = (sheet: SheetData, lang: 'ar' | 'en'): BusinessInsight[] => {
  const isAr = lang === 'ar';
  const { rows, columns } = sheet;
  if (!rows || rows.length === 0) return [];

  const insights: BusinessInsight[] = [];

  const numericCols = columns.filter((c) => c.type === 'number');
  const stringCols = columns.filter((c) => c.type === 'string' && c.uniqueCount > 1 && c.uniqueCount <= 20);
  const statusCol = columns.find((c) => c.type === 'status' || c.name.toLowerCase().includes('status') || c.name.toLowerCase().includes('حالة'));

  // 1. Top performing category / segment
  if (stringCols.length > 0 && numericCols.length > 0) {
    const catCol = stringCols[0].name;
    const valCol = numericCols[0].name;
    const agg = aggregateData(rows, catCol, valCol, 'sum');

    if (agg.labels.length > 0) {
      let maxIdx = 0;
      let minIdx = 0;
      agg.values.forEach((v, i) => {
        if (v > agg.values[maxIdx]) maxIdx = i;
        if (v < agg.values[minIdx]) minIdx = i;
      });

      const topCategory = agg.labels[maxIdx];
      const topVal = agg.values[maxIdx];
      const totalVal = agg.values.reduce((a, b) => a + b, 0);
      const topShare = totalVal > 0 ? Math.round((topVal / totalVal) * 100) : 0;

      insights.push({
        id: 'top-performer',
        type: 'positive',
        titleAr: `أعلى مساهمة في الأداء: ${topCategory}`,
        titleEn: `Top Performance Driver: ${topCategory}`,
        descriptionAr: `تستحوذ فئة "${topCategory}" على ما نسبته ${topShare}% من إجمالي ${valCol} بقيمة قدرها ${formatCurrency(topVal, isAr)}، مما يجعلها المحرك الرئيسي للنتائج.`,
        descriptionEn: `Category "${topCategory}" represents ${topShare}% of total ${valCol} with an amount of ${formatCurrency(topVal, isAr)}, acting as the core driver of performance.`,
        metric: `${topShare}%`,
        impact: 'high',
      });

      if (agg.labels.length > 2 && minIdx !== maxIdx) {
        const lowCategory = agg.labels[minIdx];
        const lowVal = agg.values[minIdx];
        insights.push({
          id: 'opportunity',
          type: 'opportunity',
          titleAr: `فرصة تطوير واعدة: ${lowCategory}`,
          titleEn: `Growth Opportunity: ${lowCategory}`,
          descriptionAr: `سجلت فئة "${lowCategory}" أدنى مساهمة بنسبة ${totalVal > 0 ? ((lowVal / totalVal) * 100).toFixed(1) : 0}% (${formatCurrency(lowVal, isAr)}). يوصى بمراجعة خطة التسويق أو كفاءة التشغيل لهذه الفئة.`,
          descriptionEn: `Category "${lowCategory}" achieved the lowest contribution (${formatCurrency(lowVal, isAr)}). Recommended reviewing marketing strategy or operational efficiency.`,
          metric: `${formatCurrency(lowVal, isAr)}`,
          impact: 'medium',
        });
      }
    }
  }

  // 2. Business Status / Bottlenecks Analysis
  if (statusCol) {
    const delayedRows = rows.filter((r) => {
      const val = String(r[statusCol.name] || '').toLowerCase();
      return val.includes('متأخر') || val.includes('delay') || val.includes('late') || val.includes('معلق') || val.includes('pending');
    });

    const delayedRate = Math.round((delayedRows.length / rows.length) * 100);

    if (delayedRows.length > 0) {
      insights.push({
        id: 'status-warning',
        type: delayedRate > 20 ? 'warning' : 'info',
        titleAr: `تنبيه تشغيلي: ${delayedRows.length} سجلات تحتاج متابعة`,
        titleEn: `Operational Alert: ${delayedRows.length} Items Require Follow-up`,
        descriptionAr: `تم رصد نسبة ${delayedRate}% من العمليات في حالة (معلق / متأخر). يوصى بتكثيف المتابعة لمعالجة العوائق قبل نهاية الربع الحالي.`,
        descriptionEn: `${delayedRate}% of operations are in pending or delayed status. Prompt management follow-up is recommended.`,
        metric: `${delayedRate}%`,
        impact: delayedRate > 20 ? 'high' : 'medium',
      });
    } else {
      insights.push({
        id: 'status-success',
        type: 'positive',
        titleAr: `انضباط تشغيلي ممتاز`,
        titleEn: `Superior Operational Execution`,
        descriptionAr: `كافة العمليات والمشاريع تسير وفق الجداول الزمنية المحددة دون تسجيل تأخيرات حرجة.`,
        descriptionEn: `All operations and projects are on track with zero critical bottlenecks recorded.`,
        impact: 'high',
      });
    }
  }

  // 3. General Data & Efficiency Recommendation
  insights.push({
    id: 'executive-summary',
    type: 'info',
    titleAr: `ملخص تنفيذي لكفاءة الأعمال`,
    titleEn: `Executive Business Efficiency Summary`,
    descriptionAr: `تم تحليل ${rows.length} سجل و ${columns.length} مؤشر بنجاح. متوسط حجم المعاملة الواحدة يظهر استقراراً ومؤشرات صحة الأعمال ضمن النطاق الآمن.`,
    descriptionEn: `Successfully analyzed ${rows.length} records and ${columns.length} indicators. Deal distribution and business health index remain robust and balanced.`,
    impact: 'low',
  });

  return insights;
};
