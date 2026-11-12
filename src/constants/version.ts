export const APP_VERSION = 'v2.4.0';
export const APP_VERSION_NUMBER = '2.4.0';
export const APP_LAST_UPDATED = '2026-11-12';

export interface VersionChangelogItem {
  version: string;
  date: string;
  titleAr: string;
  titleEn: string;
  highlightsAr: string[];
  highlightsEn: string[];
}

export const VERSION_CHANGELOG: VersionChangelogItem[] = [
  {
    version: 'v2.4.0',
    date: '2026-11-12',
    titleAr: 'توحيد العملات الحية للمحفظة، استكشاف البورصات، وتوصيات الأسهم المشتراة حسب المؤشرات',
    titleEn: 'Live FX Portfolio Unification, Exchange Explorer & Purchased Stock Indicator Decisions',
    highlightsAr: [
      'تثبيت وتوحيد عملة المحفظة تلقائياً عند الشراء من أكثر من بورصة بعملات مختلفة مع تحديث يومي لسعر الصرف.',
      'تخصيص العملة لكل قسم بشكل مستقل، مع قصر العملة الموحدة في قسم البورصة على (إجمالي قيمة المحفظة، القيمة السوقية للأسهم، والسيولة النقدية المتاحة).',
      'نافذة منبثقة ذكية لإدخال السيولة النقدية بأي عملة (أو عدة عملات) وتحويلها فورياً لعملة المحفظة المختارة.',
      'محرك بحث واستكشاف شامل للبورصة المحددة لعرض كافة أسهم السوق المختار وفحصها.',
      'قسم توصيات خاص للأسهم المشتراة يحفظ أسعار الشراء ويعطي القرار المرشح آلياً بناءً على المؤشرات الفنية والمالية.',
    ],
    highlightsEn: [
      'Automatic multi-currency portfolio unification with daily live exchange rate updates.',
      'Independent currency selector per workspace section; in Stock Market applied strictly to Total Portfolio Equity, Holdings Market Value, and Available Cash.',
      'Multi-currency Cash Balance modal with instant conversion to the selected portfolio currency.',
      'Exchange Explorer search to list and scan all stocks in the selected market.',
      'Dedicated Purchased Stocks Recommendations engine saving buy prices and generating indicator-based candidate decisions.',
    ],
  },
  {
    version: 'v2.3.0',
    date: '2026-11-12',
    titleAr: 'تطوير فاحص الأسعار الفعلي وجدول بيانات الأيام السابقة للأسهم (OHLCV)',
    titleEn: 'Live Market Proxy Scanner & Previous Days Historical OHLCV Table',
    highlightsAr: [
      'ربط مباشر لفحص أسعار الأسهم الفعلية في السوق السعودي والمصري والأمريكي والإماراتي.',
      'جلب وعرض جدول كامل لبيانات وأسعار الأيام السابقة (الافتتاح، الأعلى، الأدنى، الإغلاق، التغير، وحجم التداول).',
    ],
    highlightsEn: [
      'Direct edge proxy for live stock prices across Tadawul, EGX, US, and UAE markets.',
      'Full historical daily OHLCV table and chart dates for previous trading sessions.',
    ],
  },
  {
    version: 'v2.2.0',
    date: '2026-11-11',
    titleAr: 'إطلاق قسم تحليل البورصة المتكامل والحفظ الداخلي الكامل 100%',
    titleEn: 'Integrated Stock Market Hub & 100% Local Privacy Architecture',
    highlightsAr: [
      'بداية المنصة فارغة تماماً بدون بيانات محاكاة مع حفظ داخلي كامل على جهاز المستخدم.',
      'إدارة المحفظة والخطط المحتملة والرأي الشخصي وإخلاء المسؤولية القانوني.',
    ],
    highlightsEn: [
      'Zero mock data on startup with 100% client-side local storage privacy.',
      'Portfolio tracker, trade plan builder, personal opinions, and legal disclaimer.',
    ],
  },
];
