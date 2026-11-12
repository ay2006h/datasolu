export const APP_VERSION = 'v2.6.0';
export const APP_VERSION_NUMBER = '2.6.0';
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
    version: 'v2.6.0',
    date: '2026-11-12',
    titleAr: 'توحيد الهوية البصرية، اختيار الثيمات، تقسيم الصفحات (Paging) في كافة الجداول، وتطوير تجربة الموبايل والكمبيوتر',
    titleEn: 'Unified Visual Identity, Theme Picker, Full Table Pagination & Mobile/Desktop UX Overhaul',
    highlightsAr: [
      'هوية منصة التحليلات البيانية: تصميم معياري موحد يسمح بإضافة وحدات تحليلية جديدة مع الحفاظ على الهوية البصرية.',
      'مُبدّل الهوية البصرية (Theme Picker): إمكانية الاختيار الفوري بين 4 هويات لونية متناسقة (أزرق محيطي، نيلي ملكي، فيروزي تنفيذي، بنفسجي) مع حفظ التفضيل.',
      'نظام تقسيم الصفحات (Paging) وتحديد عدد العناصر: إضافة ترقيم صفحات واختيار عدد العناصر بالصفحة في جميع الجداول والقوائم الكبيرة عبر المبيعات والمخزون والبورصة.',
      'شريط تنقل سفلي للموبايل (Mobile Bottom Bar): سهولة التنقل بين الأقسام بلمسة واحدة على الهواتف مع تثبيت العمود الأول للجداول العريضة.',
      'تقليل النصوص والشروحات الزائدة وتجربة البيانات الجاهزة بضغطة واحدة من الصفحة الرئيسية.',
    ],
    highlightsEn: [
      'Modular Data Analytics Platform identity ready for adding new analytical workspaces.',
      'Visual Identity Theme Picker with 4 cohesive palettes (Ocean Blue, Royal Indigo, Executive Teal, Violet).',
      'Client-side Pagination & Page-Size selector across all large tables and lists in Sales, Inventory, and Stocks.',
      'Fixed Mobile Bottom Navigation Bar and sticky first columns on wide tables.',
      'Streamlined microcopy and 1-click Demo Data preview directly from the Home page.',
    ],
  },
  {
    version: 'v2.5.0',
    date: '2026-11-12',
    titleAr: 'منبه الأهداف السعرية، سجل التوزيعات، محاكي تعديل المتوسط، ميزانية أوامر الشراء، كاشف الرواكد، وأهداف ومقارنة المبيعات',
    titleEn: 'Price Alerts, Dividends Tracker, Avg Cost Simulator, PO Budget Estimator, Dead Stock Advisor & Sales Targets/Comparison',
    highlightsAr: [
      'قسم البورصة (1): منبه ذكي للأهداف السعرية ووقف الخسارة وتنبيهات التشبع البيعي/الشرائي (RSI).',
      'قسم البورصة (2): سجل توزيعات الأرباح النقدية للأسهم وإضافتها للسيولة وحساب العائد الكلي للسهم (ربح السعر + التوزيعات).',
      'قسم البورصة (3): حاسبة محاكاة تعديل متوسط سعر الشراء (التعزيز قبل التنفيذ) داخل كل سهم مشترى.',
      'قسم المخزون (4): محاكاة ميزانية أمر الشراء للأصناف المطلوب طلبها وترتيب الأولويات تلقائياً ضمن سقف الميزانية.',
      'قسم المخزون (5): كاشف الأصناف الراكدة والسيولة المجمدة مع اقتراح نسبة خصم ترويجي لتحرير الكاش بدون خسارة.',
      'قسم المبيعات (6): تحديد هدف المبيعات والأرباح الشهري ومؤشر نسبة الإنجاز والمعدل اليومي المطلوب.',
      'قسم المبيعات (7): مقارنة فترتين (رفع ملف الشهر السابق أو مقارنة شطري الفترة الحالية) لكشف الأصناف والفروع النامية والمتراجعة.',
    ],
    highlightsEn: [
      'Stocks (1): Smart Price, Target, Stop-Loss & RSI Oversold/Overbought Alert Radar.',
      'Stocks (2): Cash Dividends Tracker with optional auto-credit to portfolio cash and Total Return calculation.',
      'Stocks (3): Interactive Average Cost Down/Up Simulator inside each purchased stock card.',
      'Inventory (4): Purchase Order Budget Simulator & Priority Optimizer for reorder items.',
      'Inventory (5): Dead Stock Capital Lock Detector & Promotional Discount Liquidation Advisor.',
      'Sales (6): Monthly Revenue & Net Profit Target Gauge with Required Daily Run-Rate.',
      'Sales (7): Period-over-Period File & Snapshot Comparison for growing/declining products and branches.',
    ],
  },
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
