import {
  StockItem,
  MarketRegion,
  AnalyticalSignal,
  SitePickCategory,
} from '../types';

export interface PopularTickerInfo {
  symbol: string;
  nameAr: string;
  nameEn: string;
  market: MarketRegion;
  currency: string;
  sectorAr: string;
  sectorEn: string;
}

/**
 * Reference catalog of real market tickers (NOT loaded by default; used only when the user searches or clicks to fetch live market data).
 */
export const REAL_MARKET_TICKER_CATALOG: PopularTickerInfo[] = [
  // Saudi Tadawul (.SR)
  { symbol: '1120.SR', nameAr: 'مصرف الراجحي', nameEn: 'Al Rajhi Bank', market: 'saudi', currency: 'SAR', sectorAr: 'البنوك والخدمات المالية', sectorEn: 'Banking' },
  { symbol: '2222.SR', nameAr: 'أرامكو السعودية', nameEn: 'Saudi Aramco', market: 'saudi', currency: 'SAR', sectorAr: 'الطاقة والنفط', sectorEn: 'Energy' },
  { symbol: '1180.SR', nameAr: 'البنك الأهلي السعودي', nameEn: 'SNB Bank', market: 'saudi', currency: 'SAR', sectorAr: 'البنوك والخدمات المالية', sectorEn: 'Banking' },
  { symbol: '7010.SR', nameAr: 'الاتصالات السعودية (STC)', nameEn: 'STC Group', market: 'saudi', currency: 'SAR', sectorAr: 'الاتصالات وتقنية المعلومات', sectorEn: 'Telecom' },
  { symbol: '2010.SR', nameAr: 'سابك للصناعات الأساسية', nameEn: 'SABIC', market: 'saudi', currency: 'SAR', sectorAr: 'البتروكيماويات والمواد الأساسية', sectorEn: 'Basic Materials' },
  { symbol: '1150.SR', nameAr: 'مصرف الإنماء', nameEn: 'Alinma Bank', market: 'saudi', currency: 'SAR', sectorAr: 'البنوك والخدمات المالية', sectorEn: 'Banking' },
  { symbol: '7203.SR', nameAr: 'علم لأمن المعلومات', nameEn: 'Elm Co.', market: 'saudi', currency: 'SAR', sectorAr: 'التقنية والبرمجيات', sectorEn: 'Technology' },
  { symbol: '1211.SR', nameAr: 'معادن (التعدين العربية السعودية)', nameEn: 'Maaden', market: 'saudi', currency: 'SAR', sectorAr: 'التعدين والموارد', sectorEn: 'Mining' },
  { symbol: '2280.SR', nameAr: 'شركة المراعي', nameEn: 'Almarai', market: 'saudi', currency: 'SAR', sectorAr: 'الأغذية والزراعة', sectorEn: 'Food & Beverage' },
  { symbol: '4013.SR', nameAr: 'سليمان الحبيب للخدمات الطبية', nameEn: 'Dr. Sulaiman Al Habib', market: 'saudi', currency: 'SAR', sectorAr: 'الرعاية الصحية', sectorEn: 'Healthcare' },

  // Egyptian Exchange (.CA)
  { symbol: 'COMI.CA', nameAr: 'البنك التجاري الدولي - مصر', nameEn: 'CIB Egypt', market: 'egypt', currency: 'EGP', sectorAr: 'البنوك والخدمات المالية', sectorEn: 'Banking' },
  { symbol: 'SWDY.CA', nameAr: 'السويدي إليكتريك', nameEn: 'Elsewedy Electric', market: 'egypt', currency: 'EGP', sectorAr: 'الصناعة والكابلات والطاقة', sectorEn: 'Industrials' },
  { symbol: 'TMGH.CA', nameAr: 'مجموعة طلعت مصطفى القابضة', nameEn: 'Talaat Moustafa Group', market: 'egypt', currency: 'EGP', sectorAr: 'العقارات والسياحة', sectorEn: 'Real Estate' },
  { symbol: 'FWRY.CA', nameAr: 'فوري لتكنولوجيا البنوك والمدفوعات', nameEn: 'Fawry Fintech', market: 'egypt', currency: 'EGP', sectorAr: 'التكنولوجيا المالية', sectorEn: 'Fintech' },
  { symbol: 'ABUK.CA', nameAr: 'أبو قير للأسمدة والصناعات الكيماوية', nameEn: 'Abu Qir Fertilizers', market: 'egypt', currency: 'EGP', sectorAr: 'الأسمدة والبتروكيماويات', sectorEn: 'Chemicals' },
  { symbol: 'MFPC.CA', nameAr: 'مصر لإنتاج الأسمدة (موبكو)', nameEn: 'MOPCO Fertilizers', market: 'egypt', currency: 'EGP', sectorAr: 'الأسمدة والبتروكيماويات', sectorEn: 'Chemicals' },
  { symbol: 'EFID.CA', nameAr: 'إيديتا للصناعات الغذائية', nameEn: 'Edita Food Industries', market: 'egypt', currency: 'EGP', sectorAr: 'الأغذية والمشروبات', sectorEn: 'Food' },
  { symbol: 'ETEL.CA', nameAr: 'المصرية للاتصالات (WE)', nameEn: 'Telecom Egypt', market: 'egypt', currency: 'EGP', sectorAr: 'الاتصالات وتقنية المعلومات', sectorEn: 'Telecom' },
  { symbol: 'HRHO.CA', nameAr: 'مجموعة إي إف جي القابضة (هيرميس)', nameEn: 'EFG Holding', market: 'egypt', currency: 'EGP', sectorAr: 'الخدمات المالية غير المصرفية', sectorEn: 'Financials' },

  // US Market (Wall Street)
  { symbol: 'AAPL', nameAr: 'آبل (Apple)', nameEn: 'Apple Inc.', market: 'us', currency: 'USD', sectorAr: 'التكنولوجيا والأجهزة الذكية', sectorEn: 'Technology' },
  { symbol: 'MSFT', nameAr: 'مايكروسوفت (Microsoft)', nameEn: 'Microsoft Corp.', market: 'us', currency: 'USD', sectorAr: 'البرمجيات والحوسبة السحابية', sectorEn: 'Technology' },
  { symbol: 'NVDA', nameAr: 'إنفيديا (NVIDIA)', nameEn: 'NVIDIA Corp.', market: 'us', currency: 'USD', sectorAr: 'أشباه الموصلات والذكاء الاصطناعي', sectorEn: 'Semiconductors' },
  { symbol: 'GOOGL', nameAr: 'ألفابت - جوجل (Alphabet)', nameEn: 'Alphabet Inc.', market: 'us', currency: 'USD', sectorAr: 'التكنولوجيا والإنترنت', sectorEn: 'Technology' },
  { symbol: 'AMZN', nameAr: 'أمازون (Amazon)', nameEn: 'Amazon.com Inc.', market: 'us', currency: 'USD', sectorAr: 'التجارة الإلكترونية والحوسبة', sectorEn: 'Consumer & Cloud' },
  { symbol: 'META', nameAr: 'ميتا بلاتفورمز (Meta)', nameEn: 'Meta Platforms', market: 'us', currency: 'USD', sectorAr: 'التواصل الاجتماعي والذكاء الاصطناعي', sectorEn: 'Technology' },
  { symbol: 'TSLA', nameAr: 'تسلا (Tesla)', nameEn: 'Tesla Inc.', market: 'us', currency: 'USD', sectorAr: 'السيارات الكهربائية والطاقة', sectorEn: 'Automotive' },
  { symbol: 'BRK-B', nameAr: 'بيركشاير هاثاواي (Berkshire)', nameEn: 'Berkshire Hathaway', market: 'us', currency: 'USD', sectorAr: 'الاستثمار والتأمين', sectorEn: 'Financials' },

  // UAE Market (Dubai .DU / Abu Dhabi .AD)
  { symbol: 'EMAAR.DU', nameAr: 'إعمار العقارية - دبي', nameEn: 'Emaar Properties', market: 'uae', currency: 'AED', sectorAr: 'التطوير العقاري', sectorEn: 'Real Estate' },
  { symbol: 'DIB.DU', nameAr: 'بنك دبي الإسلامي', nameEn: 'Dubai Islamic Bank', market: 'uae', currency: 'AED', sectorAr: 'البنوك والخدمات المالية', sectorEn: 'Banking' },
  { symbol: 'EMIRATESNBD.DU', nameAr: 'بنك الإمارات دبي الوطني', nameEn: 'Emirates NBD', market: 'uae', currency: 'AED', sectorAr: 'البنوك والخدمات المالية', sectorEn: 'Banking' },
  { symbol: 'DEWA.DU', nameAr: 'هيئة كهرباء ومياه دبي (ديوا)', nameEn: 'DEWA', market: 'uae', currency: 'AED', sectorAr: 'المرافق والطاقة', sectorEn: 'Utilities' },
];

/**
 * Normalizes a user-typed symbol based on selected market region.
 * Example: '1120' in 'saudi' -> '1120.SR'; 'COMI' in 'egypt' -> 'COMI.CA'
 */
export function normalizeTickerSymbol(rawSymbol: string, market: MarketRegion): string {
  const clean = rawSymbol.trim().toUpperCase();
  if (!clean) return '';
  if (clean.includes('.')) return clean;

  // If 4 digits, likely Saudi Tadawul
  if (/^\d{4}$/.test(clean)) {
    return `${clean}.SR`;
  }
  if (market === 'saudi' && !clean.endsWith('.SR')) {
    return `${clean}.SR`;
  }
  if (market === 'egypt' && !clean.endsWith('.CA')) {
    return `${clean}.CA`;
  }
  if (market === 'uae' && !clean.endsWith('.DU') && !clean.endsWith('.AD')) {
    return `${clean}.DU`;
  }
  return clean;
}

/**
 * Computes 14-period RSI from an array of closing prices
 */
function calculateRSI14(closes: number[]): number {
  if (closes.length < 5) return 50;
  const period = Math.min(14, closes.length - 1);
  let gains = 0;
  let losses = 0;

  const startIdx = closes.length - 1 - period;
  for (let i = startIdx + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 75;
  const rs = avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);
  return Number(Math.max(10, Math.min(92, rsi)).toFixed(1));
}

/**
 * Computes Simple Moving Average for the last N closes
 */
function calculateSMA(closes: number[], period: number): number {
  if (closes.length === 0) return 0;
  const slice = closes.slice(-Math.min(period, closes.length));
  const sum = slice.reduce((acc, v) => acc + v, 0);
  return Number((sum / slice.length).toFixed(2));
}

/**
 * Fetches real market chart data (price, history, high/low, volume) from Yahoo Finance v8 API
 * using resilient CORS proxies so it works directly inside the user's browser.
 */
export async function fetchLiveStockMarketData(
  rawSymbol: string,
  preferredMarket: MarketRegion = 'saudi',
  existingStock?: Partial<StockItem>
): Promise<StockItem> {
  const symbol = normalizeTickerSymbol(rawSymbol, preferredMarket);
  const catalogMatch = REAL_MARKET_TICKER_CATALOG.find(
    (c) => c.symbol.toUpperCase() === symbol.toUpperCase()
  );

  const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    symbol
  )}?interval=1d&range=6mo`;

  const proxyUrls = [
    `https://corsproxy.io/?${encodeURIComponent(yahooUrl)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(yahooUrl)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(yahooUrl)}`,
  ];

  let chartResult: any = null;

  for (const url of proxyUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7500);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) continue;
      const json = await res.json();
      const result = json?.chart?.result?.[0];
      if (result && result.meta) {
        chartResult = result;
        break;
      }
    } catch {
      // Try next proxy
    }
  }

  if (!chartResult) {
    throw new Error(`تعذر جلب بيانات السهم (${symbol}) من السوق حالياً. تأكد من صحة رمز السهم واتصال الإنترنت.`);
  }

  const meta = chartResult.meta || {};
  const quote = chartResult.indicators?.quote?.[0] || {};
  const rawCloses: (number | null)[] = quote.close || [];
  const rawHighs: (number | null)[] = quote.high || [];
  const rawLows: (number | null)[] = quote.low || [];
  const rawVolumes: (number | null)[] = quote.volume || [];

  const validCloses = rawCloses.filter(
    (v): v is number => typeof v === 'number' && !isNaN(v) && v > 0
  );
  const validHighs = rawHighs.filter(
    (v): v is number => typeof v === 'number' && !isNaN(v) && v > 0
  );
  const validLows = rawLows.filter(
    (v): v is number => typeof v === 'number' && !isNaN(v) && v > 0
  );
  const validVolumes = rawVolumes.filter(
    (v): v is number => typeof v === 'number' && !isNaN(v) && v >= 0
  );

  const currentPrice = Number(
    (
      meta.regularMarketPrice ||
      validCloses[validCloses.length - 1] ||
      existingStock?.currentPrice ||
      10
    ).toFixed(2)
  );

  const previousClose = Number(
    (
      meta.chartPreviousClose ||
      meta.previousClose ||
      (validCloses.length >= 2 ? validCloses[validCloses.length - 2] : currentPrice)
    ).toFixed(2)
  );

  // Daily change compared to immediately preceding session close
  const lastSessionClose =
    validCloses.length >= 2 ? validCloses[validCloses.length - 2] : previousClose;
  const changePercent =
    lastSessionClose > 0
      ? Number((((currentPrice - lastSessionClose) / lastSessionClose) * 100).toFixed(2))
      : 0;

  const high52W = Number(
    (
      meta.fiftyTwoWeekHigh ||
      (validHighs.length > 0 ? Math.max(...validHighs) : currentPrice * 1.15)
    ).toFixed(2)
  );
  const low52W = Number(
    (
      meta.fiftyTwoWeekLow ||
      (validLows.length > 0 ? Math.min(...validLows) : currentPrice * 0.85)
    ).toFixed(2)
  );

  // Compute Real Technicals from Market History
  const rsi14 = calculateRSI14(validCloses);
  const ma50 = calculateSMA(validCloses, 50) || currentPrice;
  const ma200 = calculateSMA(validCloses, 120) || currentPrice; // 6-month long average

  // Compute Real Support & Resistance from recent 20-day range & Pivot levels
  const recent20Lows = validLows.slice(-20);
  const recent20Highs = validHighs.slice(-20);
  const swingLow20 =
    recent20Lows.length > 0 ? Math.min(...recent20Lows) : currentPrice * 0.95;
  const swingHigh20 =
    recent20Highs.length > 0 ? Math.max(...recent20Highs) : currentPrice * 1.05;

  const support1 = Number(Math.min(currentPrice * 0.985, Math.max(swingLow20, currentPrice * 0.93)).toFixed(2));
  const support2 = Number((support1 * 0.955).toFixed(2));
  const resistance1 = Number(Math.max(currentPrice * 1.015, Math.min(swingHigh20, currentPrice * 1.08)).toFixed(2));
  const resistance2 = Number(Math.max(resistance1 * 1.05, high52W).toFixed(2));

  // Volume trend
  let volumeTrend: 'high' | 'normal' | 'low' = 'normal';
  if (validVolumes.length >= 10) {
    const recentVol = validVolumes[validVolumes.length - 1];
    const avgVol20 =
      validVolumes.slice(-20).reduce((a, b) => a + b, 0) /
      Math.min(20, validVolumes.length);
    if (recentVol > avgVol20 * 1.25) volumeTrend = 'high';
    else if (recentVol < avgVol20 * 0.7) volumeTrend = 'low';
  }

  // Estimate Technical/Statistical Fair Value Target based on 6-month median, 52W range, and MA trend
  const rangeMid = (high52W + low52W) / 2;
  const trendFactor = currentPrice >= ma50 ? 1.06 : 0.98;
  const estimatedFairValue =
    existingStock?.estimatedFairValue && existingStock.estimatedFairValue > 0
      ? existingStock.estimatedFairValue
      : Number(((rangeMid * 0.5 + ma50 * 0.5) * trendFactor).toFixed(2));

  // Dynamic Recommendation & Signal Evaluation based on live market metrics
  let score = 58;
  if (currentPrice > ma50 && ma50 >= ma200) score += 15;
  else if (currentPrice > ma200) score += 8;
  else score -= 8;

  if (rsi14 >= 40 && rsi14 <= 64) score += 10;
  else if (rsi14 < 35) score += 7; // Oversold near support bounce
  else if (rsi14 > 72) score -= 10; // Overbought risk

  const upsideToResistance =
    currentPrice > 0 ? ((resistance2 - currentPrice) / currentPrice) * 100 : 0;
  if (upsideToResistance >= 10) score += 8;
  if (volumeTrend === 'high' && changePercent > 0) score += 6;

  const siteAnalyticalScore = Math.max(25, Math.min(96, Math.round(score)));

  let analyticalSignal: AnalyticalSignal = 'neutral_watch';
  if (rsi14 >= 70 || currentPrice >= resistance1 * 0.995) {
    analyticalSignal = 'take_profit_zone';
  } else if (
    (currentPrice <= support1 * 1.03 && rsi14 <= 48) ||
    (currentPrice > ma50 && rsi14 >= 48 && rsi14 <= 65 && siteAnalyticalScore >= 80)
  ) {
    analyticalSignal = 'strong_accumulation';
  } else if (currentPrice >= ma50 && changePercent >= 0) {
    analyticalSignal = 'positive_momentum';
  } else if (currentPrice < ma50 && currentPrice < ma200 && rsi14 < 42) {
    analyticalSignal = 'caution_risk';
  }

  let sitePickCategory: SitePickCategory = existingStock?.sitePickCategory || 'momentum';
  if (currentPrice > ma50 && changePercent > 0) sitePickCategory = 'momentum';
  else if (currentPrice < rangeMid) sitePickCategory = 'value';
  else sitePickCategory = 'growth';

  const nowStr = new Date().toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Dynamic Arabic & English Rationale generated from live market numbers
  let siteRationaleAr = '';
  if (analyticalSignal === 'strong_accumulation') {
    siteRationaleAr = `[تحديث السوق الفعلي ${nowStr}]: يتداول السهم عند ${currentPrice} بتغير يومي (${changePercent >= 0 ? '+' : ''}${changePercent}%)، وهو في منطقة فنية إيجابية أعلى/قرب الدعم ${support1} مع مؤشر قوة نسبية متوازن (RSI: ${rsi14}) ومتوسط 50 يوم عند ${ma50}. المقاومة المستهدفة الأولى ${resistance1} ثم ${resistance2}.`;
  } else if (analyticalSignal === 'positive_momentum') {
    siteRationaleAr = `[تحديث السوق الفعلي ${nowStr}]: زخم إيجابي حيث يتداول السهم عند ${currentPrice} أعلى متوسط 50 يوم (${ma50}) مع RSI عند ${rsi14}. الحفاظ على مستوى الدعم ${support1} يدعم استهداف المقاومة ${resistance1}.`;
  } else if (analyticalSignal === 'take_profit_zone') {
    siteRationaleAr = `[تحديث السوق الفعلي ${nowStr}]: السعر الحالي ${currentPrice} يقترب من منطقة المقاومة (${resistance1}) أو تشبع شرائي على مؤشر القوة النسبية (RSI: ${rsi14})؛ استرشادياً يُفضل مراقبة جني الأرباح الجزئي أو رفع مستوى الوقف إلى ${support1}.`;
  } else if (analyticalSignal === 'caution_risk') {
    siteRationaleAr = `[تحديث السوق الفعلي ${nowStr}]: يتداول السهم عند ${currentPrice} دون المتوسط المتحرك 50 يوم (${ma50})؛ يُنصح استرشادياً بمراقبة ثبات مستوى الدعم ${support1} و${support2} قبل بناء مراكز جديدة.`;
  } else {
    siteRationaleAr = `[تحديث السوق الفعلي ${nowStr}]: السعر الفعلي بالسوق ${currentPrice} ويتحرك في نطاق عرضي بين الدعم الأول ${support1} والمقاومة الأولى ${resistance1} مع مؤشر RSI عند ${rsi14}.`;
  }

  const siteRationaleEn = `[Live Market Scan ${nowStr}]: Trading at ${currentPrice} (${changePercent >= 0 ? '+' : ''}${changePercent}%), RSI(14): ${rsi14}, MA50: ${ma50}. Key Support: ${support1}, Resistance: ${resistance1}.`;

  // Detect market region from suffix if not provided
  let detectedMarket: MarketRegion = preferredMarket;
  if (symbol.endsWith('.SR')) detectedMarket = 'saudi';
  else if (symbol.endsWith('.CA')) detectedMarket = 'egypt';
  else if (symbol.endsWith('.DU') || symbol.endsWith('.AD')) detectedMarket = 'uae';
  else if (!symbol.includes('.')) detectedMarket = 'us';

  const currency =
    meta.currency ||
    catalogMatch?.currency ||
    existingStock?.currency ||
    (detectedMarket === 'saudi'
      ? 'SAR'
      : detectedMarket === 'egypt'
      ? 'EGP'
      : detectedMarket === 'uae'
      ? 'AED'
      : 'USD');

  const priceHistory = validCloses.slice(-12).map((c) => Number(c.toFixed(2)));
  if (priceHistory.length === 0) {
    priceHistory.push(currentPrice);
  }

  return {
    id: existingStock?.id || `live-${symbol.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    symbol,
    nameAr:
      existingStock?.nameAr ||
      catalogMatch?.nameAr ||
      meta.shortName ||
      meta.longName ||
      symbol,
    nameEn:
      existingStock?.nameEn ||
      catalogMatch?.nameEn ||
      meta.shortName ||
      meta.longName ||
      symbol,
    market: detectedMarket,
    currency,
    sectorAr: existingStock?.sectorAr || catalogMatch?.sectorAr || 'أسهم السوق المالي',
    sectorEn: existingStock?.sectorEn || catalogMatch?.sectorEn || 'Equities',
    currentPrice,
    previousClose: lastSessionClose,
    changePercent,
    high52W,
    low52W,
    rsi14,
    ma50,
    ma200,
    support1,
    support2,
    resistance1,
    resistance2,
    volumeTrend,
    peRatio: existingStock?.peRatio || 15.0,
    pbRatio: existingStock?.pbRatio || 2.2,
    roePercent: existingStock?.roePercent || 18.0,
    dividendYieldPercent: existingStock?.dividendYieldPercent || 2.5,
    estimatedFairValue,
    isSiteFavorite:
      typeof existingStock?.isSiteFavorite === 'boolean'
        ? existingStock.isSiteFavorite
        : siteAnalyticalScore >= 78,
    sitePickCategory,
    siteAnalyticalScore,
    analyticalSignal,
    siteRationaleAr,
    siteRationaleEn,
    priceHistory,
    isWatchlisted: existingStock?.isWatchlisted ?? true,
  };
}
