import {
  StockItem,
  StockTransaction,
  PortfolioHolding,
  StockTradePlan,
  PersonalStockOpinion,
  AnalyticalSignal,
  SitePickCategory,
  MarketRegion,
} from '../types';

export const DEFAULT_STOCKS_DATA: StockItem[] = [
  // =========================================================================
  // 1. السوق السعودي (تداول - Tadawul)
  // =========================================================================
  {
    id: 'sa-1120',
    symbol: '1120.SR',
    nameAr: 'مصرف الراجحي',
    nameEn: 'Al Rajhi Bank',
    market: 'saudi',
    currency: 'SAR',
    sectorAr: 'البنوك والخدمات المالية',
    sectorEn: 'Banking & Financials',
    currentPrice: 88.4,
    previousClose: 86.9,
    changePercent: 1.73,
    high52W: 94.5,
    low52W: 75.2,
    rsi14: 56.4,
    ma50: 85.8,
    ma200: 82.1,
    support1: 85.5,
    support2: 82.0,
    resistance1: 91.0,
    resistance2: 94.5,
    volumeTrend: 'high',
    peRatio: 19.2,
    pbRatio: 3.4,
    roePercent: 18.6,
    dividendYieldPercent: 3.1,
    estimatedFairValue: 96.5,
    isSiteFavorite: true,
    sitePickCategory: 'growth',
    siteAnalyticalScore: 88,
    analyticalSignal: 'strong_accumulation',
    siteRationaleAr:
      'يتداول السهم أعلى المتوسط المتحرك 50 و200 يوم مع نمو مستمر في محفظة التمويل وعائد قوي على حقوق الملكية (18.6%) وهامش أمان إيجابي مقارنة بالقيمة العادلة التقديرية.',
    siteRationaleEn:
      'Trading above 50 & 200 DMA with solid financing portfolio expansion, strong 18.6% ROE, and upside to estimated fair value.',
    priceHistory: [81.5, 82.2, 83.0, 82.6, 84.1, 85.0, 84.7, 86.0, 86.5, 86.9, 87.6, 88.4],
    isWatchlisted: true,
  },
  {
    id: 'sa-2222',
    symbol: '2222.SR',
    nameAr: 'أرامكو السعودية',
    nameEn: 'Saudi Aramco',
    market: 'saudi',
    currency: 'SAR',
    sectorAr: 'الطاقة والبتروكيماويات',
    sectorEn: 'Energy',
    currentPrice: 27.65,
    previousClose: 27.5,
    changePercent: 0.55,
    high52W: 32.6,
    low52W: 26.8,
    rsi14: 41.2,
    ma50: 28.1,
    ma200: 29.4,
    support1: 27.1,
    support2: 26.5,
    resistance1: 28.8,
    resistance2: 30.2,
    volumeTrend: 'normal',
    peRatio: 14.8,
    pbRatio: 4.1,
    roePercent: 28.4,
    dividendYieldPercent: 6.4,
    estimatedFairValue: 31.8,
    isSiteFavorite: true,
    sitePickCategory: 'dividend',
    siteAnalyticalScore: 86,
    analyticalSignal: 'strong_accumulation',
    siteRationaleAr:
      'من أبرز أسهم التوزيعات النقدية المستدامة (عائد ~6.4%) ويتداول بالقرب من مناطق دعم تاريخية هامة (27 ريال) مع مؤشر RSI قريب من مناطق التشبع البيعي مما يجعله ملائماً للمحافظ الدفاعية الاسترشادية.',
    siteRationaleEn:
      'Premier dividend yield (~6.4%) trading near multi-month historical support (27 SAR) with defensive balance sheet strength.',
    priceHistory: [29.2, 28.9, 28.6, 28.3, 28.0, 27.9, 27.6, 27.4, 27.3, 27.5, 27.55, 27.65],
    isWatchlisted: true,
  },
  {
    id: 'sa-7010',
    symbol: '7010.SR',
    nameAr: 'الاتصالات السعودية (إس تي سي)',
    nameEn: 'STC Group',
    market: 'saudi',
    currency: 'SAR',
    sectorAr: 'الاتصالات وتقنية المعلومات',
    sectorEn: 'Telecom & IT',
    currentPrice: 41.9,
    previousClose: 41.4,
    changePercent: 1.21,
    high52W: 44.8,
    low52W: 36.5,
    rsi14: 58.0,
    ma50: 40.6,
    ma200: 39.5,
    support1: 40.5,
    support2: 39.0,
    resistance1: 43.2,
    resistance2: 44.8,
    volumeTrend: 'high',
    peRatio: 15.1,
    pbRatio: 2.6,
    roePercent: 17.2,
    dividendYieldPercent: 4.8,
    estimatedFairValue: 46.0,
    isSiteFavorite: true,
    sitePickCategory: 'value',
    siteAnalyticalScore: 83,
    analyticalSignal: 'positive_momentum',
    siteRationaleAr:
      'يجمع بين التقييم المالي المتوازن (مكرر ربحية 15.1) وتوزيعات نقدية منتظمة مع توسع قوي في البنية التحتية الرقمية والمدفوعات.',
    siteRationaleEn:
      'Balanced valuation (15.1x P/E) combined with steady dividends and strong digital infrastructure growth.',
    priceHistory: [39.4, 39.8, 40.1, 40.0, 40.4, 40.8, 40.7, 41.0, 41.2, 41.4, 41.6, 41.9],
    isWatchlisted: false,
  },
  {
    id: 'sa-7203',
    symbol: '7203.SR',
    nameAr: 'علم لأمن المعلومات',
    nameEn: 'Elm Company',
    market: 'saudi',
    currency: 'SAR',
    sectorAr: 'التقنية والبرمجيات',
    sectorEn: 'Technology',
    currentPrice: 985.0,
    previousClose: 968.0,
    changePercent: 1.76,
    high52W: 1040.0,
    low52W: 760.0,
    rsi14: 66.5,
    ma50: 935.0,
    ma200: 870.0,
    support1: 940.0,
    support2: 905.0,
    resistance1: 1015.0,
    resistance2: 1050.0,
    volumeTrend: 'high',
    peRatio: 44.5,
    pbRatio: 14.2,
    roePercent: 34.0,
    dividendYieldPercent: 0.9,
    estimatedFairValue: 1020.0,
    isSiteFavorite: true,
    sitePickCategory: 'momentum',
    siteAnalyticalScore: 81,
    analyticalSignal: 'positive_momentum',
    siteRationaleAr:
      'سهم نمو وزخم فني رائد في قطاع التحول الرقمي بعائد استثنائي على حقوق الملكية (34%)، مع ضرورة مراقبة مستويات المقاومة لأن مكرر الربحية مرتفع نسبياً.',
    siteRationaleEn:
      'Leading digital transformation momentum stock with 34% ROE; monitor resistance levels closely due to premium valuation.',
    priceHistory: [890, 905, 912, 925, 918, 935, 948, 955, 960, 968, 976, 985],
    isWatchlisted: false,
  },
  {
    id: 'sa-2010',
    symbol: '2010.SR',
    nameAr: 'سابك للصناعات الأساسية',
    nameEn: 'SABIC',
    market: 'saudi',
    currency: 'SAR',
    sectorAr: 'المواد الأساسية والبتروكيماويات',
    sectorEn: 'Basic Materials',
    currentPrice: 73.2,
    previousClose: 73.8,
    changePercent: -0.81,
    high52W: 85.4,
    low52W: 71.5,
    rsi14: 37.5,
    ma50: 75.6,
    ma200: 78.9,
    support1: 71.8,
    support2: 69.5,
    resistance1: 76.0,
    resistance2: 79.5,
    volumeTrend: 'low',
    peRatio: 26.4,
    pbRatio: 1.3,
    roePercent: 5.2,
    dividendYieldPercent: 4.5,
    estimatedFairValue: 81.0,
    isSiteFavorite: false,
    sitePickCategory: 'value',
    siteAnalyticalScore: 71,
    analyticalSignal: 'neutral_watch',
    siteRationaleAr:
      'يتداول السهم قرب قاع سنوي ومضاعف قيمة دفترية منخفض (1.3x)، لكنه ينتظر إشارات انعكاس فني واضحة وتحسن دورة أسعار البتروكيماويات العالمية.',
    siteRationaleEn:
      'Trading near 52-week lows at 1.3x P/B; awaiting clearer technical reversal and global petrochemical cycle recovery.',
    priceHistory: [77.5, 77.0, 76.2, 75.8, 75.5, 74.9, 74.5, 74.1, 73.9, 73.8, 73.5, 73.2],
    isWatchlisted: false,
  },

  // =========================================================================
  // 2. البورصة المصرية (EGX)
  // =========================================================================
  {
    id: 'eg-comi',
    symbol: 'COMI.CA',
    nameAr: 'البنك التجاري الدولي - مصر',
    nameEn: 'CIB Egypt',
    market: 'egypt',
    currency: 'EGP',
    sectorAr: 'البنوك والخدمات المالية',
    sectorEn: 'Banking & Financials',
    currentPrice: 84.5,
    previousClose: 82.8,
    changePercent: 2.05,
    high52W: 92.0,
    low52W: 70.5,
    rsi14: 59.2,
    ma50: 81.2,
    ma200: 78.4,
    support1: 81.0,
    support2: 78.0,
    resistance1: 87.5,
    resistance2: 92.0,
    volumeTrend: 'high',
    peRatio: 7.4,
    pbRatio: 2.3,
    roePercent: 32.5,
    dividendYieldPercent: 2.1,
    estimatedFairValue: 102.0,
    isSiteFavorite: true,
    sitePickCategory: 'value',
    siteAnalyticalScore: 91,
    analyticalSignal: 'strong_accumulation',
    siteRationaleAr:
      'الوزن النسبي الأكبر في مؤشر EGX30 مع مكرر ربحية منخفض جداً (7.4x) وعائد على حقوق الملكية يتجاوز 32%، مما يعكس كفاءة مالية عالية وخصماً سعرياً واضحاً عن القيمة العادلة.',
    siteRationaleEn:
      'EGX30 heavyweight trading at an attractive 7.4x P/E with 32.5% ROE and deep discount to estimated fair value.',
    priceHistory: [77.5, 78.2, 79.0, 78.8, 80.1, 80.9, 81.5, 81.2, 82.0, 82.8, 83.6, 84.5],
    isWatchlisted: true,
  },
  {
    id: 'eg-swdy',
    symbol: 'SWDY.CA',
    nameAr: 'السويدي إليكتريك',
    nameEn: 'Elsewedy Electric',
    market: 'egypt',
    currency: 'EGP',
    sectorAr: 'الصناعة والطاقة والكابلات',
    sectorEn: 'Industrials & Energy',
    currentPrice: 64.2,
    previousClose: 63.1,
    changePercent: 1.74,
    high52W: 71.5,
    low52W: 42.0,
    rsi14: 61.8,
    ma50: 60.5,
    ma200: 53.0,
    support1: 61.0,
    support2: 57.5,
    resistance1: 67.0,
    resistance2: 71.5,
    volumeTrend: 'high',
    peRatio: 8.9,
    pbRatio: 2.7,
    roePercent: 29.8,
    dividendYieldPercent: 3.4,
    estimatedFairValue: 76.0,
    isSiteFavorite: true,
    sitePickCategory: 'growth',
    siteAnalyticalScore: 87,
    analyticalSignal: 'positive_momentum',
    siteRationaleAr:
      'يتمتع السهم بإيرادات دولارية وتصديرية قوية تحميه من تقلبات العملة، مع زخم فني صاعد أعلى المتوسطات المتحركة ومكرر ربحية جذاب (8.9x).',
    siteRationaleEn:
      'Strong export and USD-linked revenue backlog providing currency hedge, backed by bullish technical trend and 8.9x P/E.',
    priceHistory: [56.0, 57.2, 58.5, 58.1, 59.6, 60.4, 61.2, 61.8, 62.5, 63.1, 63.7, 64.2],
    isWatchlisted: true,
  },
  {
    id: 'eg-fawry',
    symbol: 'FWRY.CA',
    nameAr: 'فوري لتكنولوجيا البنوك والمدفوعات',
    nameEn: 'Fawry Fintech',
    market: 'egypt',
    currency: 'EGP',
    sectorAr: 'التكنولوجيا المالية والمدفوعات',
    sectorEn: 'Fintech',
    currentPrice: 8.15,
    previousClose: 8.02,
    changePercent: 1.62,
    high52W: 9.4,
    low52W: 5.6,
    rsi14: 54.0,
    ma50: 7.85,
    ma200: 7.2,
    support1: 7.75,
    support2: 7.3,
    resistance1: 8.6,
    resistance2: 9.2,
    volumeTrend: 'normal',
    peRatio: 18.5,
    pbRatio: 4.8,
    roePercent: 24.5,
    dividendYieldPercent: 0.0,
    estimatedFairValue: 9.8,
    isSiteFavorite: false,
    sitePickCategory: 'growth',
    siteAnalyticalScore: 79,
    analyticalSignal: 'positive_momentum',
    siteRationaleAr:
      'نمو متسارع في هوامش الربحية من خدمات التمويل متناهي الصغر والمدفوعات الرقمية، ويتحرك فنياً في قناة صاعدة فوق مستوى الدعم 7.75 ج.م.',
    siteRationaleEn:
      'Accelerating margin expansion from microfinance and digital payments; holding above 7.75 EGP support channel.',
    priceHistory: [7.3, 7.45, 7.52, 7.6, 7.55, 7.7, 7.82, 7.9, 7.88, 8.02, 8.08, 8.15],
    isWatchlisted: false,
  },
  {
    id: 'eg-tmgh',
    symbol: 'TMGH.CA',
    nameAr: 'مجموعة طلعت مصطفى القابضة',
    nameEn: 'Talaat Moustafa Group',
    market: 'egypt',
    currency: 'EGP',
    sectorAr: 'العقارات والسياحة',
    sectorEn: 'Real Estate & Hospitality',
    currentPrice: 58.9,
    previousClose: 59.7,
    changePercent: -1.34,
    high52W: 74.0,
    low52W: 48.5,
    rsi14: 46.5,
    ma50: 60.2,
    ma200: 57.0,
    support1: 56.5,
    support2: 53.0,
    resistance1: 62.5,
    resistance2: 67.0,
    volumeTrend: 'normal',
    peRatio: 16.2,
    pbRatio: 2.1,
    roePercent: 14.8,
    dividendYieldPercent: 1.2,
    estimatedFairValue: 71.0,
    isSiteFavorite: false,
    sitePickCategory: 'value',
    siteAnalyticalScore: 76,
    analyticalSignal: 'neutral_watch',
    siteRationaleAr:
      'محفظة أراضٍ ومشروعات فندقية ضخمة؛ السهم يختبر حالياً منطقة دعم متوسطة الأجل بين 56.5 و57.0 ج.م بالقرب من متوسط 200 يوم.',
    siteRationaleEn:
      'Massive land bank and hospitality portfolio; currently testing medium-term support near 200 DMA (56.5-57.0 EGP).',
    priceHistory: [62.5, 61.8, 61.2, 60.9, 60.5, 60.1, 60.4, 59.9, 59.5, 59.7, 59.2, 58.9],
    isWatchlisted: false,
  },

  // =========================================================================
  // 3. السوق الأمريكي (Wall Street - US Market)
  // =========================================================================
  {
    id: 'us-msft',
    symbol: 'MSFT',
    nameAr: 'مايكروسوفت (Microsoft)',
    nameEn: 'Microsoft Corp.',
    market: 'us',
    currency: 'USD',
    sectorAr: 'التكنولوجيا والحوسبة السحابية',
    sectorEn: 'Cloud & Technology',
    currentPrice: 428.5,
    previousClose: 423.2,
    changePercent: 1.25,
    high52W: 468.3,
    low52W: 385.0,
    rsi14: 55.2,
    ma50: 419.0,
    ma200: 412.5,
    support1: 415.0,
    support2: 402.0,
    resistance1: 442.0,
    resistance2: 465.0,
    volumeTrend: 'high',
    peRatio: 31.8,
    pbRatio: 11.4,
    roePercent: 37.1,
    dividendYieldPercent: 0.75,
    estimatedFairValue: 472.0,
    isSiteFavorite: true,
    sitePickCategory: 'growth',
    siteAnalyticalScore: 90,
    analyticalSignal: 'strong_accumulation',
    siteRationaleAr:
      'قوة مالية استثنائية وتدفقات نقدية حرة ضخمة من قطاع Azure والذكاء الاصطناعي للمؤسسات، مع ارتداد فني صحي فوق متوسط 200 يوم (412 دولار).',
    siteRationaleEn:
      'Fortress balance sheet and recurring Azure/Enterprise AI cash flows, rebounding cleanly above its 200 DMA ($412).',
    priceHistory: [408, 411, 414, 412, 416, 418, 420, 419, 421, 423.2, 426, 428.5],
    isWatchlisted: true,
  },
  {
    id: 'us-nvda',
    symbol: 'NVDA',
    nameAr: 'إنفيديا (NVIDIA)',
    nameEn: 'NVIDIA Corp.',
    market: 'us',
    currency: 'USD',
    sectorAr: 'أشباه الموصلات والذكاء الاصطناعي',
    sectorEn: 'Semiconductors & AI',
    currentPrice: 138.6,
    previousClose: 135.4,
    changePercent: 2.36,
    high52W: 143.7,
    low52W: 75.6,
    rsi14: 71.4,
    ma50: 126.8,
    ma200: 108.5,
    support1: 128.0,
    support2: 118.5,
    resistance1: 143.5,
    resistance2: 150.0,
    volumeTrend: 'high',
    peRatio: 52.4,
    pbRatio: 45.0,
    roePercent: 91.5,
    dividendYieldPercent: 0.03,
    estimatedFairValue: 145.0,
    isSiteFavorite: true,
    sitePickCategory: 'momentum',
    siteAnalyticalScore: 84,
    analyticalSignal: 'take_profit_zone',
    siteRationaleAr:
      'الرائد العالمي في رقائق الذكاء الاصطناعي بزخم أرباح هائل، لكن مؤشر RSI تجاوز 71 مما يشير إلى اقتراب السهم من مناطق تشبع شرائي قصيرة الأجل تستوجب الحذر وعدم المطاردة السعرية العشوائية.',
    siteRationaleEn:
      'Dominant AI chip leader with explosive ROE, though RSI > 71 signals near-term overbought conditions near resistance ($143.5).',
    priceHistory: [118, 121, 124, 123, 127, 129, 131, 130, 133, 135.4, 137, 138.6],
    isWatchlisted: false,
  },
  {
    id: 'us-aapl',
    symbol: 'AAPL',
    nameAr: 'آبل (Apple)',
    nameEn: 'Apple Inc.',
    market: 'us',
    currency: 'USD',
    sectorAr: 'التكنولوجيا والأجهزة الذكية',
    sectorEn: 'Consumer Tech',
    currentPrice: 229.4,
    previousClose: 228.1,
    changePercent: 0.57,
    high52W: 237.2,
    low52W: 164.1,
    rsi14: 53.8,
    ma50: 225.0,
    ma200: 204.5,
    support1: 220.0,
    support2: 212.0,
    resistance1: 237.0,
    resistance2: 245.0,
    volumeTrend: 'normal',
    peRatio: 33.5,
    pbRatio: 48.0,
    roePercent: 145.0,
    dividendYieldPercent: 0.44,
    estimatedFairValue: 235.0,
    isSiteFavorite: false,
    sitePickCategory: 'growth',
    siteAnalyticalScore: 80,
    analyticalSignal: 'neutral_watch',
    siteRationaleAr:
      'استقرار عالٍ في إيرادات قطاع الخدمات وبرامج إعادة شراء الأسهم، ويتحرك السهم في نطاق عرضي تجميعي بين الدعم 220 والمقاومة 237 دولار.',
    siteRationaleEn:
      'High stability from Services revenue and share buybacks; consolidating between $220 support and $237 resistance.',
    priceHistory: [221, 223, 222, 224, 226, 225, 227, 226.5, 227.8, 228.1, 228.9, 229.4],
    isWatchlisted: false,
  },

  // =========================================================================
  // 4. سوق الإمارات المالي (دبي وأبوظبي - DFM / ADX)
  // =========================================================================
  {
    id: 'ae-emaar',
    symbol: 'EMAAR.DU',
    nameAr: 'إعمار العقارية - دبي',
    nameEn: 'Emaar Properties',
    market: 'uae',
    currency: 'AED',
    sectorAr: 'التطوير العقاري والضيافة',
    sectorEn: 'Real Estate',
    currentPrice: 8.92,
    previousClose: 8.78,
    changePercent: 1.59,
    high52W: 9.35,
    low52W: 7.1,
    rsi14: 60.4,
    ma50: 8.55,
    ma200: 8.05,
    support1: 8.5,
    support2: 8.1,
    resistance1: 9.35,
    resistance2: 9.8,
    volumeTrend: 'high',
    peRatio: 6.8,
    pbRatio: 0.98,
    roePercent: 15.9,
    dividendYieldPercent: 5.6,
    estimatedFairValue: 10.6,
    isSiteFavorite: true,
    sitePickCategory: 'value',
    siteAnalyticalScore: 92,
    analyticalSignal: 'strong_accumulation',
    siteRationaleAr:
      'يتداول السهم بمكرر ربحية منخفض للغاية (6.8x) وأقل من قيمته الدفترية تقريباً (0.98x P/B) مع عائد توزيعات مجزٍ (5.6%) ومبيعات عقارية قياسية متراكمة.',
    siteRationaleEn:
      'Trading at a compelling 6.8x P/E and ~0.98x P/B with a 5.6% dividend yield and record property sales backlog.',
    priceHistory: [8.15, 8.22, 8.3, 8.35, 8.42, 8.5, 8.48, 8.6, 8.7, 8.78, 8.85, 8.92],
    isWatchlisted: true,
  },
];

export const DEFAULT_TRANSACTIONS: StockTransaction[] = [
  {
    id: 'tx-101',
    stockId: 'sa-1120',
    symbol: '1120.SR',
    stockNameAr: 'مصرف الراجحي',
    stockNameEn: 'Al Rajhi Bank',
    market: 'saudi',
    currency: 'SAR',
    type: 'buy',
    quantity: 120,
    price: 83.5,
    commission: 15,
    totalAmount: 120 * 83.5 + 15,
    date: '2026-10-05',
    strategyTag: 'استثمار متوسط الأجل',
    notes: 'شراء عند ارتداد السهم من منطقة الدعم 82-83 ريال وتقاطع المتوسطات.',
  },
  {
    id: 'tx-102',
    stockId: 'sa-2222',
    symbol: '2222.SR',
    stockNameAr: 'أرامكو السعودية',
    stockNameEn: 'Saudi Aramco',
    market: 'saudi',
    currency: 'SAR',
    type: 'buy',
    quantity: 350,
    price: 27.3,
    commission: 12,
    totalAmount: 350 * 27.3 + 12,
    date: '2026-10-14',
    strategyTag: 'محفظة التوزيعات النقدية',
    notes: 'تجميع تدريجي للاستفادة من عائد التوزيعات النقدية المستدام (6.4%).',
  },
  {
    id: 'tx-103',
    stockId: 'eg-comi',
    symbol: 'COMI.CA',
    stockNameAr: 'البنك التجاري الدولي - مصر',
    stockNameEn: 'CIB Egypt',
    market: 'egypt',
    currency: 'EGP',
    type: 'buy',
    quantity: 200,
    price: 79.5,
    commission: 25,
    totalAmount: 200 * 79.5 + 25,
    date: '2026-10-20',
    strategyTag: 'قيمة عادلة ونمو',
    notes: 'دخول استثماري بناءً على انخفاض مكرر الربحية عن 8 مرات.',
  },
  {
    id: 'tx-104',
    stockId: 'sa-1120',
    symbol: '1120.SR',
    stockNameAr: 'مصرف الراجحي',
    stockNameEn: 'Al Rajhi Bank',
    market: 'saudi',
    currency: 'SAR',
    type: 'sell',
    quantity: 30,
    price: 88.0,
    commission: 10,
    totalAmount: 30 * 88.0 - 10,
    realizedPnL: 30 * (88.0 - 83.625) - 10,
    date: '2026-11-04',
    strategyTag: 'جني أرباح جزئي',
    notes: 'بيع ربع الكمية لتأمين ربح جزئي عند الاقتراب من المقاومة الأولى.',
  },
];

export const DEFAULT_TRADE_PLANS: StockTradePlan[] = [
  {
    id: 'plan-1',
    stockId: 'sa-7010',
    symbol: '7010.SR',
    stockNameAr: 'الاتصالات السعودية (إس تي سي)',
    stockNameEn: 'STC Group',
    currency: 'SAR',
    title: 'خطة تجميع إس تي سي فوق دعم 40.50 ريال',
    timeframe: 'swing',
    entryPrice: 41.2,
    stopLossPrice: 39.4,
    target1Price: 43.5,
    target2Price: 45.8,
    target3Price: 48.0,
    plannedCapital: 20000,
    riskPercentOfCapital: 1.5,
    recommendedShares: 166,
    riskRewardRatio: 2.56,
    bullScenario:
      'اختراق مستوى 43.20 ريال بأحجام تداول عالية يفتح الطريق نحو الهدف الثاني 45.80 ريال مع رفع وقف الخسارة لنقطة الدخول.',
    baseScenario:
      'التحرك العرضي الإيجابي بين 40.80 و43.00 ريال مع الاستفادة من التوزيعات النقدية الربعية.',
    bearScenario:
      'في حال إغلاق يومين متتاليين أسفل 39.40 ريال يتم تفعيل وقف الخسارة والانتظار عند الدعم التالي 38.00 ريال.',
    status: 'watching',
    createdAt: '2026-11-08',
  },
  {
    id: 'plan-2',
    stockId: 'ae-emaar',
    symbol: 'EMAAR.DU',
    stockNameAr: 'إعمار العقارية - دبي',
    stockNameEn: 'Emaar Properties',
    currency: 'AED',
    title: 'خطة اختراق القمة السنوية لإعمار العقارية',
    timeframe: 'long_term',
    entryPrice: 8.85,
    stopLossPrice: 8.35,
    target1Price: 9.6,
    target2Price: 10.5,
    target3Price: 11.4,
    plannedCapital: 15000,
    riskPercentOfCapital: 2.0,
    recommendedShares: 600,
    riskRewardRatio: 3.3,
    bullScenario:
      'استمرار الزخم العقاري في دبي واختراق 9.35 درهم يدفع السهم نحو القيمة العادلة عند 10.50 درهم.',
    baseScenario: 'الاحتفاظ بالسهم لتحقيق عائد التوزيعات السنوي (5.6%) مع نمو تدريجي في القيمة الدفترية.',
    bearScenario:
      'كسر مستوى الدعم 8.35 درهم يستدعي تخفيف المركز بنسبة 50% وإعادة التقييم.',
    status: 'active',
    createdAt: '2026-11-02',
  },
];

export const DEFAULT_PERSONAL_OPINIONS: PersonalStockOpinion[] = [
  {
    id: 'op-1',
    stockId: 'sa-1120',
    symbol: '1120.SR',
    stockNameAr: 'مصرف الراجحي',
    stockNameEn: 'Al Rajhi Bank',
    stance: 'very_bullish',
    personalTargetPrice: 95.0,
    personalSupportNote: '85.00 ريال دعم قوي جداً للمحفظة',
    convictionLevel: 5,
    thesisNotes:
      'رأيي الشخصي: السهم يمثل الركيزة الأساسية في محفظتي بالسوق السعودي، يستفيد بقوة من أي خفض مستقبلي لأسعار الفائدة لأن تكلفة الودائع لديه منخفضة ونمو التمويل العقاري والشركات مستمر.',
    tags: ['سهم قيادي', 'استثمار أساسي', 'نمو وتوزيعات'],
    updatedAt: '2026-11-09',
  },
  {
    id: 'op-2',
    stockId: 'eg-comi',
    symbol: 'COMI.CA',
    stockNameAr: 'البنك التجاري الدولي - مصر',
    stockNameEn: 'CIB Egypt',
    stance: 'bullish',
    personalTargetPrice: 98.0,
    personalSupportNote: '80.00 ج.م منطقة تجميع ممتازة',
    convictionLevel: 4,
    thesisNotes:
      'رأيي الشخصي: نتائج الأعمال الربعية أظهرت نمواً قياسياً في صافي الدخل من العائد، والسهم لا يزال يتداول بأقل من قيمته الحقيقية مقارنة بالبنوك الإقليمية.',
    tags: ['البورصة المصرية', 'قيمة عادلة', 'قيادي'],
    updatedAt: '2026-11-07',
  },
  {
    id: 'op-3',
    stockId: 'us-nvda',
    symbol: 'NVDA',
    stockNameAr: 'إنفيديا (NVIDIA)',
    stockNameEn: 'NVIDIA Corp.',
    stance: 'neutral',
    personalTargetPrice: 145.0,
    personalSupportNote: 'أنتظر تصحيحاً قرب 122 - 126 دولار قبل أي دخول جديد',
    convictionLevel: 3,
    thesisNotes:
      'رأيي الشخصي: شركة عظيمة مالياً ولكن السعر الحالي ارتفع بسرعة كبيرة ومؤشر RSI متشبع شرائياً؛ أفضل عدم الشراء في القمم والانتظار مع أي جني أرباح للسوق.',
    tags: ['ذكاء اصطناعي', 'انتظار تصحيح', 'مراقبة'],
    updatedAt: '2026-11-10',
  },
];

/**
 * Computes current portfolio holdings and realized/unrealized P&L from transaction history & live stock prices.
 */
export function computePortfolioSummary(
  stocks: StockItem[],
  transactions: StockTransaction[],
  cashBalance: number
): {
  holdings: PortfolioHolding[];
  totalInvestedCost: number;
  totalMarketValue: number;
  totalPortfolioEquity: number;
  totalUnrealizedPnL: number;
  totalUnrealizedPnLPercent: number;
  totalRealizedPnL: number;
  winTradesCount: number;
  lossTradesCount: number;
} {
  const stockMap = new Map<string, StockItem>();
  stocks.forEach((s) => stockMap.set(s.id, s));

  // Sort transactions chronologically
  const sortedTxs = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const positions = new Map<
    string,
    {
      stockId: string;
      symbol: string;
      nameAr: string;
      nameEn: string;
      market: MarketRegion;
      currency: string;
      sectorAr: string;
      sectorEn: string;
      quantity: number;
      totalCost: number;
      avgCostPrice: number;
    }
  >();

  let totalRealizedPnL = 0;
  let winTradesCount = 0;
  let lossTradesCount = 0;

  for (const tx of sortedTxs) {
    const stockInfo = stockMap.get(tx.stockId);
    const currentPos = positions.get(tx.stockId) || {
      stockId: tx.stockId,
      symbol: tx.symbol,
      nameAr: stockInfo?.nameAr || tx.stockNameAr,
      nameEn: stockInfo?.nameEn || tx.stockNameEn,
      market: stockInfo?.market || tx.market,
      currency: stockInfo?.currency || tx.currency,
      sectorAr: stockInfo?.sectorAr || 'قطاع عام',
      sectorEn: stockInfo?.sectorEn || 'General',
      quantity: 0,
      totalCost: 0,
      avgCostPrice: 0,
    };

    if (tx.type === 'buy') {
      const buyCost = tx.quantity * tx.price + (tx.commission || 0);
      const newQty = currentPos.quantity + tx.quantity;
      const newTotalCost = currentPos.totalCost + buyCost;
      currentPos.quantity = newQty;
      currentPos.totalCost = newTotalCost;
      currentPos.avgCostPrice = newQty > 0 ? newTotalCost / newQty : 0;
      positions.set(tx.stockId, currentPos);
    } else if (tx.type === 'sell') {
      const sellProceeds = tx.quantity * tx.price - (tx.commission || 0);
      const costBasisOfSold = currentPos.avgCostPrice * tx.quantity;
      const tradePnL =
        typeof tx.realizedPnL === 'number'
          ? tx.realizedPnL
          : sellProceeds - costBasisOfSold;

      totalRealizedPnL += tradePnL;
      if (tradePnL >= 0) winTradesCount++;
      else lossTradesCount++;

      const remainingQty = Math.max(0, currentPos.quantity - tx.quantity);
      currentPos.quantity = remainingQty;
      currentPos.totalCost = remainingQty * currentPos.avgCostPrice;
      positions.set(tx.stockId, currentPos);
    }
  }

  const rawHoldings: PortfolioHolding[] = [];
  let totalInvestedCost = 0;
  let totalMarketValue = 0;

  positions.forEach((pos) => {
    if (pos.quantity <= 0.0001) return;
    const liveStock = stockMap.get(pos.stockId);
    const currentPrice = liveStock ? liveStock.currentPrice : pos.avgCostPrice;
    const marketValue = pos.quantity * currentPrice;
    const unrealizedPnL = marketValue - pos.totalCost;
    const unrealizedPnLPercent =
      pos.totalCost > 0 ? (unrealizedPnL / pos.totalCost) * 100 : 0;

    totalInvestedCost += pos.totalCost;
    totalMarketValue += marketValue;

    rawHoldings.push({
      stockId: pos.stockId,
      symbol: pos.symbol,
      nameAr: pos.nameAr,
      nameEn: pos.nameEn,
      market: pos.market,
      currency: pos.currency,
      sectorAr: pos.sectorAr,
      sectorEn: pos.sectorEn,
      quantity: pos.quantity,
      avgCostPrice: pos.avgCostPrice,
      totalCost: pos.totalCost,
      currentPrice,
      marketValue,
      unrealizedPnL,
      unrealizedPnLPercent,
      weightPercent: 0, // computed below
      stopLossPrice: liveStock ? liveStock.support1 : undefined,
      targetPrice: liveStock ? liveStock.estimatedFairValue : undefined,
    });
  });

  // Compute weightPercent
  const holdings = rawHoldings
    .map((h) => ({
      ...h,
      weightPercent: totalMarketValue > 0 ? (h.marketValue / totalMarketValue) * 100 : 0,
    }))
    .sort((a, b) => b.marketValue - a.marketValue);

  const totalUnrealizedPnL = totalMarketValue - totalInvestedCost;
  const totalUnrealizedPnLPercent =
    totalInvestedCost > 0 ? (totalUnrealizedPnL / totalInvestedCost) * 100 : 0;
  const totalPortfolioEquity = totalMarketValue + cashBalance;

  return {
    holdings,
    totalInvestedCost,
    totalMarketValue,
    totalPortfolioEquity,
    totalUnrealizedPnL,
    totalUnrealizedPnLPercent,
    totalRealizedPnL,
    winTradesCount,
    lossTradesCount,
  };
}

/**
 * Helper to compute analytical score & signal automatically when a user adds/edits a stock
 */
export function evaluateStockAnalyticalProfile(params: {
  currentPrice: number;
  estimatedFairValue: number;
  rsi14: number;
  ma50: number;
  ma200: number;
  peRatio: number;
  roePercent: number;
  dividendYieldPercent: number;
}): {
  score: number;
  signal: AnalyticalSignal;
  pickCategory: SitePickCategory;
} {
  let score = 55;

  // Fair value upside
  const upsidePercent =
    params.currentPrice > 0
      ? ((params.estimatedFairValue - params.currentPrice) / params.currentPrice) * 100
      : 0;
  if (upsidePercent >= 18) score += 16;
  else if (upsidePercent >= 8) score += 10;
  else if (upsidePercent < -5) score -= 10;

  // Moving averages alignment
  if (params.currentPrice > params.ma50 && params.ma50 >= params.ma200) {
    score += 12;
  } else if (params.currentPrice > params.ma200) {
    score += 6;
  } else {
    score -= 6;
  }

  // RSI health
  if (params.rsi14 >= 42 && params.rsi14 <= 64) {
    score += 8;
  } else if (params.rsi14 < 35) {
    score += 5; // oversold bounce candidate
  } else if (params.rsi14 > 72) {
    score -= 8; // overbought risk
  }

  // Fundamentals
  if (params.roePercent >= 18) score += 8;
  if (params.peRatio > 0 && params.peRatio <= 16) score += 7;
  if (params.dividendYieldPercent >= 4) score += 5;

  const clampedScore = Math.max(25, Math.min(96, Math.round(score)));

  let signal: AnalyticalSignal = 'neutral_watch';
  if (params.rsi14 > 70) {
    signal = 'take_profit_zone';
  } else if (clampedScore >= 84 && upsidePercent >= 8) {
    signal = 'strong_accumulation';
  } else if (clampedScore >= 75) {
    signal = 'positive_momentum';
  } else if (clampedScore < 50) {
    signal = 'caution_risk';
  }

  let pickCategory: SitePickCategory = 'value';
  if (params.dividendYieldPercent >= 4.5) pickCategory = 'dividend';
  else if (params.roePercent >= 22 && params.currentPrice > params.ma50) pickCategory = 'growth';
  else if (upsidePercent >= 12) pickCategory = 'value';
  else pickCategory = 'momentum';

  return { score: clampedScore, signal, pickCategory };
}
