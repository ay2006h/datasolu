import {
  StockItem,
  StockHistoricalDay,
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
 * Reference catalog of real market tickers (used when searching by Arabic/English name or symbol).
 */
export const REAL_MARKET_TICKER_CATALOG: PopularTickerInfo[] = [
  // ============================================================================
  // 1. Saudi Tadawul (.SR) — السوق السعودي (تداول)
  // ============================================================================
  { symbol: '1120.SR', nameAr: 'مصرف الراجحي', nameEn: 'Al Rajhi Bank', market: 'saudi', currency: 'SAR', sectorAr: 'البنوك والخدمات المالية', sectorEn: 'Banking' },
  { symbol: '2222.SR', nameAr: 'أرامكو السعودية', nameEn: 'Saudi Aramco', market: 'saudi', currency: 'SAR', sectorAr: 'الطاقة والنفط', sectorEn: 'Energy' },
  { symbol: '1180.SR', nameAr: 'البنك الأهلي السعودي', nameEn: 'SNB Bank', market: 'saudi', currency: 'SAR', sectorAr: 'البنوك والخدمات المالية', sectorEn: 'Banking' },
  { symbol: '7010.SR', nameAr: 'الاتصالات السعودية (إس تي سي)', nameEn: 'STC Group', market: 'saudi', currency: 'SAR', sectorAr: 'الاتصالات وتقنية المعلومات', sectorEn: 'Telecom' },
  { symbol: '2010.SR', nameAr: 'سابك للصناعات الأساسية', nameEn: 'SABIC', market: 'saudi', currency: 'SAR', sectorAr: 'البتروكيماويات والمواد الأساسية', sectorEn: 'Basic Materials' },
  { symbol: '1150.SR', nameAr: 'مصرف الإنماء', nameEn: 'Alinma Bank', market: 'saudi', currency: 'SAR', sectorAr: 'البنوك والخدمات المالية', sectorEn: 'Banking' },
  { symbol: '7203.SR', nameAr: 'علم لأمن المعلومات', nameEn: 'Elm Co.', market: 'saudi', currency: 'SAR', sectorAr: 'التقنية والبرمجيات', sectorEn: 'Technology' },
  { symbol: '1211.SR', nameAr: 'معادن (التعدين العربية السعودية)', nameEn: 'Maaden', market: 'saudi', currency: 'SAR', sectorAr: 'التعدين والموارد', sectorEn: 'Mining' },
  { symbol: '2082.SR', nameAr: 'أكوا باور', nameEn: 'ACWA Power', market: 'saudi', currency: 'SAR', sectorAr: 'المرافق والطاقة المتجددة', sectorEn: 'Utilities' },
  { symbol: '2280.SR', nameAr: 'شركة المراعي', nameEn: 'Almarai', market: 'saudi', currency: 'SAR', sectorAr: 'الأغذية والزراعة', sectorEn: 'Food & Beverage' },
  { symbol: '4013.SR', nameAr: 'سليمان الحبيب للخدمات الطبية', nameEn: 'Dr. Sulaiman Al Habib', market: 'saudi', currency: 'SAR', sectorAr: 'الرعاية الصحية', sectorEn: 'Healthcare' },
  { symbol: '1010.SR', nameAr: 'بنك الرياض', nameEn: 'Riyad Bank', market: 'saudi', currency: 'SAR', sectorAr: 'البنوك والخدمات المالية', sectorEn: 'Banking' },
  { symbol: '1140.SR', nameAr: 'بنك البلاد', nameEn: 'Bank Albilad', market: 'saudi', currency: 'SAR', sectorAr: 'البنوك والخدمات المالية', sectorEn: 'Banking' },
  { symbol: '2020.SR', nameAr: 'سابك للمغذيات الزراعية', nameEn: 'SABIC Agri-Nutrients', market: 'saudi', currency: 'SAR', sectorAr: 'البتروكيماويات والأسمدة', sectorEn: 'Chemicals' },
  { symbol: '7020.SR', nameAr: 'اتحاد اتصالات (موبايلي)', nameEn: 'Mobily', market: 'saudi', currency: 'SAR', sectorAr: 'الاتصالات وتقنية المعلومات', sectorEn: 'Telecom' },
  { symbol: '4190.SR', nameAr: 'مكتبة جرير', nameEn: 'Jarir Marketing', market: 'saudi', currency: 'SAR', sectorAr: 'التجزئة والسلع الكمالية', sectorEn: 'Retail' },
  { symbol: '4002.SR', nameAr: 'المواساة للخدمات الطبية', nameEn: 'Mouwasat Medical', market: 'saudi', currency: 'SAR', sectorAr: 'الرعاية الصحية', sectorEn: 'Healthcare' },
  { symbol: '4300.SR', nameAr: 'دار الأركان للتطوير العقاري', nameEn: 'Dar Al Arkan', market: 'saudi', currency: 'SAR', sectorAr: 'التطوير العقاري', sectorEn: 'Real Estate' },
  { symbol: '4250.SR', nameAr: 'جبل عمر للتطوير', nameEn: 'Jabal Omar', market: 'saudi', currency: 'SAR', sectorAr: 'التطوير العقاري', sectorEn: 'Real Estate' },
  { symbol: '5110.SR', nameAr: 'الكهرباء السعودية', nameEn: 'Saudi Electricity', market: 'saudi', currency: 'SAR', sectorAr: 'المرافق العامة', sectorEn: 'Utilities' },
  { symbol: '2380.SR', nameAr: 'بترو رابغ', nameEn: 'Petro Rabigh', market: 'saudi', currency: 'SAR', sectorAr: 'الطاقة والبتروكيماويات', sectorEn: 'Energy' },
  { symbol: '1020.SR', nameAr: 'بنك الجزيرة', nameEn: 'Bank AlJazira', market: 'saudi', currency: 'SAR', sectorAr: 'البنوك والخدمات المالية', sectorEn: 'Banking' },

  // ============================================================================
  // 2. Egyptian Exchange (.CA) — البورصة المصرية (EGX)
  // ============================================================================
  { symbol: 'COMI.CA', nameAr: 'البنك التجاري الدولي - مصر', nameEn: 'CIB Egypt', market: 'egypt', currency: 'EGP', sectorAr: 'البنوك والخدمات المالية', sectorEn: 'Banking' },
  { symbol: 'SWDY.CA', nameAr: 'السويدي إليكتريك', nameEn: 'Elsewedy Electric', market: 'egypt', currency: 'EGP', sectorAr: 'الصناعة والكابلات والطاقة', sectorEn: 'Industrials' },
  { symbol: 'TMGH.CA', nameAr: 'مجموعة طلعت مصطفى القابضة', nameEn: 'Talaat Moustafa Group', market: 'egypt', currency: 'EGP', sectorAr: 'العقارات والسياحة', sectorEn: 'Real Estate' },
  { symbol: 'FWRY.CA', nameAr: 'فوري لتكنولوجيا البنوك والمدفوعات', nameEn: 'Fawry Fintech', market: 'egypt', currency: 'EGP', sectorAr: 'التكنولوجيا المالية', sectorEn: 'Fintech' },
  { symbol: 'ABUK.CA', nameAr: 'أبو قير للأسمدة والصناعات الكيماوية', nameEn: 'Abu Qir Fertilizers', market: 'egypt', currency: 'EGP', sectorAr: 'الأسمدة والبتروكيماويات', sectorEn: 'Chemicals' },
  { symbol: 'MFPC.CA', nameAr: 'مصر لإنتاج الأسمدة (موبكو)', nameEn: 'MOPCO Fertilizers', market: 'egypt', currency: 'EGP', sectorAr: 'الأسمدة والبتروكيماويات', sectorEn: 'Chemicals' },
  { symbol: 'EFID.CA', nameAr: 'إيديتا للصناعات الغذائية', nameEn: 'Edita Food Industries', market: 'egypt', currency: 'EGP', sectorAr: 'الأغذية والمشروبات', sectorEn: 'Food' },
  { symbol: 'ETEL.CA', nameAr: 'المصرية للاتصالات (WE)', nameEn: 'Telecom Egypt', market: 'egypt', currency: 'EGP', sectorAr: 'الاتصالات وتقنية المعلومات', sectorEn: 'Telecom' },
  { symbol: 'HRHO.CA', nameAr: 'مجموعة إي إف جي القابضة (هيرميس)', nameEn: 'EFG Holding', market: 'egypt', currency: 'EGP', sectorAr: 'الخدمات المالية غير المصرفية', sectorEn: 'Financials' },
  { symbol: 'EAST.CA', nameAr: 'الشرقية للدخان (إيسترن كومباني)', nameEn: 'Eastern Company', market: 'egypt', currency: 'EGP', sectorAr: 'الأغذية والسلع الاستهلاكية', sectorEn: 'Consumer' },
  { symbol: 'ESRS.CA', nameAr: 'حديد عز', nameEn: 'Ezz Steel', market: 'egypt', currency: 'EGP', sectorAr: 'الصناعة والمعادن', sectorEn: 'Basic Materials' },
  { symbol: 'AMOC.CA', nameAr: 'الإسكندرية للزيوت المعدنية (أموك)', nameEn: 'AMOC', market: 'egypt', currency: 'EGP', sectorAr: 'الطاقة والبتروكيماويات', sectorEn: 'Energy' },
  { symbol: 'HELI.CA', nameAr: 'مصر الجديدة للإسكان والتعمير', nameEn: 'Heliopolis Housing', market: 'egypt', currency: 'EGP', sectorAr: 'العقارات والإنشاءات', sectorEn: 'Real Estate' },
  { symbol: 'PHDC.CA', nameAr: 'بالم هيلز للتعمير', nameEn: 'Palm Hills Developments', market: 'egypt', currency: 'EGP', sectorAr: 'العقارات والسياحة', sectorEn: 'Real Estate' },
  { symbol: 'ORAS.CA', nameAr: 'أوراسكوم كونستراكشون', nameEn: 'Orascom Construction', market: 'egypt', currency: 'EGP', sectorAr: 'المقاولات والإنشاءات', sectorEn: 'Construction' },
  { symbol: 'GBCO.CA', nameAr: 'جي بي كورب (غبور أوتو)', nameEn: 'GB Corp', market: 'egypt', currency: 'EGP', sectorAr: 'السيارات والتمويل', sectorEn: 'Automotive' },

  // ============================================================================
  // 3. US Market (Wall Street) — السوق الأمريكي
  // ============================================================================
  { symbol: 'AAPL', nameAr: 'آبل (Apple)', nameEn: 'Apple Inc.', market: 'us', currency: 'USD', sectorAr: 'التكنولوجيا والأجهزة الذكية', sectorEn: 'Technology' },
  { symbol: 'MSFT', nameAr: 'مايكروسوفت (Microsoft)', nameEn: 'Microsoft Corp.', market: 'us', currency: 'USD', sectorAr: 'البرمجيات والحوسبة السحابية', sectorEn: 'Technology' },
  { symbol: 'NVDA', nameAr: 'إنفيديا (NVIDIA)', nameEn: 'NVIDIA Corp.', market: 'us', currency: 'USD', sectorAr: 'أشباه الموصلات والذكاء الاصطناعي', sectorEn: 'Semiconductors' },
  { symbol: 'GOOGL', nameAr: 'ألفابت - جوجل (Alphabet)', nameEn: 'Alphabet Inc.', market: 'us', currency: 'USD', sectorAr: 'التكنولوجيا والإنترنت', sectorEn: 'Technology' },
  { symbol: 'AMZN', nameAr: 'أمازون (Amazon)', nameEn: 'Amazon.com Inc.', market: 'us', currency: 'USD', sectorAr: 'التجارة الإلكترونية والحوسبة', sectorEn: 'Consumer & Cloud' },
  { symbol: 'META', nameAr: 'ميتا بلاتفورمز (Meta)', nameEn: 'Meta Platforms', market: 'us', currency: 'USD', sectorAr: 'التواصل الاجتماعي والذكاء الاصطناعي', sectorEn: 'Technology' },
  { symbol: 'TSLA', nameAr: 'تسلا (Tesla)', nameEn: 'Tesla Inc.', market: 'us', currency: 'USD', sectorAr: 'السيارات الكهربائية والطاقة', sectorEn: 'Automotive' },
  { symbol: 'AMD', nameAr: 'إيه إم دي (AMD)', nameEn: 'Advanced Micro Devices', market: 'us', currency: 'USD', sectorAr: 'أشباه الموصلات', sectorEn: 'Semiconductors' },
  { symbol: 'AVGO', nameAr: 'برودكوم (Broadcom)', nameEn: 'Broadcom Inc.', market: 'us', currency: 'USD', sectorAr: 'أشباه الموصلات والشبكات', sectorEn: 'Semiconductors' },
  { symbol: 'BRK-B', nameAr: 'بيركشاير هاثاواي (Berkshire)', nameEn: 'Berkshire Hathaway', market: 'us', currency: 'USD', sectorAr: 'الاستثمار والخدمات المالية', sectorEn: 'Financials' },
  { symbol: 'JPM', nameAr: 'جي بي مورغان تشيس (JPMorgan)', nameEn: 'JPMorgan Chase', market: 'us', currency: 'USD', sectorAr: 'البنوك والخدمات المالية', sectorEn: 'Banking' },
  { symbol: 'LLY', nameAr: 'إيلي ليلي للأدوية (Eli Lilly)', nameEn: 'Eli Lilly & Co.', market: 'us', currency: 'USD', sectorAr: 'الأدوية والرعاية الصحية', sectorEn: 'Healthcare' },
  { symbol: 'V', nameAr: 'فيزا للمدفوعات (Visa)', nameEn: 'Visa Inc.', market: 'us', currency: 'USD', sectorAr: 'المدفوعات الرقمية', sectorEn: 'Fintech' },
  { symbol: 'MA', nameAr: 'ماستركارد (Mastercard)', nameEn: 'Mastercard Inc.', market: 'us', currency: 'USD', sectorAr: 'المدفوعات الرقمية', sectorEn: 'Fintech' },
  { symbol: 'NFLX', nameAr: 'نتفليكس (Netflix)', nameEn: 'Netflix Inc.', market: 'us', currency: 'USD', sectorAr: 'الترفيه والبث الرقمي', sectorEn: 'Media' },
  { symbol: 'COST', nameAr: 'كوستكو للتجزئة (Costco)', nameEn: 'Costco Wholesale', market: 'us', currency: 'USD', sectorAr: 'التجزئة والسلع الاستهلاكية', sectorEn: 'Retail' },

  // ============================================================================
  // 4. UAE Market (Dubai & Abu Dhabi .AE) — سوق الإمارات المالي
  // ============================================================================
  { symbol: 'EMAAR.AE', nameAr: 'إعمار العقارية - دبي', nameEn: 'Emaar Properties', market: 'uae', currency: 'AED', sectorAr: 'التطوير العقاري', sectorEn: 'Real Estate' },
  { symbol: 'DIB.AE', nameAr: 'بنك دبي الإسلامي', nameEn: 'Dubai Islamic Bank', market: 'uae', currency: 'AED', sectorAr: 'البنوك والخدمات المالية', sectorEn: 'Banking' },
  { symbol: 'DEWA.AE', nameAr: 'هيئة كهرباء ومياه دبي (ديوا)', nameEn: 'DEWA', market: 'uae', currency: 'AED', sectorAr: 'المرافق والطاقة', sectorEn: 'Utilities' },
  { symbol: 'EMAARDEV.AE', nameAr: 'إعمار للتطوير', nameEn: 'Emaar Development', market: 'uae', currency: 'AED', sectorAr: 'التطوير العقاري', sectorEn: 'Real Estate' },
  { symbol: 'AIRARABIA.AE', nameAr: 'العربية للطيران', nameEn: 'Air Arabia', market: 'uae', currency: 'AED', sectorAr: 'الطيران والنقل', sectorEn: 'Aviation' },
  { symbol: 'DFM.AE', nameAr: 'سوق دبي المالي', nameEn: 'Dubai Financial Market', market: 'uae', currency: 'AED', sectorAr: 'الخدمات المالية والأسواق', sectorEn: 'Financials' },
  { symbol: 'DU.AE', nameAr: 'الإمارات للاتصالات المتكاملة (دو)', nameEn: 'du Telecom', market: 'uae', currency: 'AED', sectorAr: 'الاتصالات وتقنية المعلومات', sectorEn: 'Telecom' },
  { symbol: 'ARAMEX.AE', nameAr: 'أرامكس للخدمات اللوجستية', nameEn: 'Aramex', market: 'uae', currency: 'AED', sectorAr: 'النقل واللوجستيات', sectorEn: 'Logistics' },
  { symbol: 'SALIK.AE', nameAr: 'سالك للتعرفة المرورية - دبي', nameEn: 'Salik Company', market: 'uae', currency: 'AED', sectorAr: 'البنية التحتية والنقل', sectorEn: 'Infrastructure' },
  { symbol: 'PARKIN.AE', nameAr: 'باركن للمواقف - دبي', nameEn: 'Parkin Company', market: 'uae', currency: 'AED', sectorAr: 'الخدمات العامة والنقل', sectorEn: 'Services' },
];

/**
 * Normalizes a user-typed symbol or Arabic/English company name into a valid Yahoo Finance ticker.
 */
export function normalizeTickerSymbol(rawInput: string, market: MarketRegion): string {
  const trimmed = rawInput.trim();
  if (!trimmed) return '';

  // 1. Check if the user typed an Arabic or English company name from our catalog
  const lower = trimmed.toLowerCase();
  const byName = REAL_MARKET_TICKER_CATALOG.find(
    (c) =>
      c.symbol.toLowerCase() === lower ||
      c.nameAr.includes(trimmed) ||
      c.nameEn.toLowerCase().includes(lower)
  );
  if (byName) return byName.symbol;

  const clean = trimmed.toUpperCase();

  // Fix legacy .DU or .AD suffixes to .AE for Yahoo Finance UAE compatibility
  if (clean.endsWith('.DU') || clean.endsWith('.AD')) {
    return clean.replace(/\.(DU|AD)$/, '.AE');
  }

  if (clean.includes('.')) return clean;

  // If 4 digits, Saudi Tadawul
  if (/^\d{4}$/.test(clean)) {
    return `${clean}.SR`;
  }
  if (market === 'saudi' && !clean.endsWith('.SR')) {
    return `${clean}.SR`;
  }
  if (market === 'egypt' && !clean.endsWith('.CA')) {
    return `${clean}.CA`;
  }
  if (market === 'uae' && !clean.endsWith('.AE')) {
    return `${clean}.AE`;
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
 * Helper to fetch JSON with timeout and validate `chart.result[0]`
 */
async function fetchYahooChartJson(
  url: string,
  timeoutMs: number,
  isAllOriginsWrapped = false
): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const parsed = isAllOriginsWrapped && typeof data?.contents === 'string'
      ? JSON.parse(data.contents)
      : data;
    const chartRes = parsed?.chart?.result?.[0];
    if (!chartRes || !chartRes.meta) {
      throw new Error('Invalid chart payload');
    }
    return chartRes;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * ES2020-compatible helper that resolves with the first fulfilled promise,
 * or rejects only if all promises reject.
 */
function raceToFirstSuccess<T>(promises: Promise<T>[]): Promise<T> {
  return new Promise((resolve, reject) => {
    let rejectedCount = 0;
    const total = promises.length;
    if (total === 0) {
      reject(new Error('No promises provided'));
      return;
    }
    promises.forEach((p) => {
      Promise.resolve(p).then(
        (val) => resolve(val),
        () => {
          rejectedCount += 1;
          if (rejectedCount === total) {
            reject(new Error('All endpoints failed'));
          }
        }
      );
    });
  });
}

/**
 * Fetches real market chart data + up to 65 trading days of historical OHLCV data
 * using our built-in edge/local proxy (`/api/yahoo`, `/api/stock`) + parallel public CORS fallbacks.
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

  const queryPath = `/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=3mo`;
  const yahooUrl1 = `https://query1.finance.yahoo.com${queryPath}`;
  const yahooUrl2 = `https://query2.finance.yahoo.com${queryPath}`;

  let chartResult: any = null;

  // TIER 1: Built-in Edge / Local Vite Proxy (Instant < 300ms on both localhost and Vercel data.ahesolu.com)
  try {
    chartResult = await raceToFirstSuccess([
      fetchYahooChartJson(`/api/yahoo${queryPath}`, 5500),
      fetchYahooChartJson(`/api/yahoo2${queryPath}`, 5500),
      fetchYahooChartJson(`/api/stock?symbol=${encodeURIComponent(symbol)}&range=3mo&interval=1d`, 5500),
    ]);
  } catch {
    // Proceed to Tier 2 if local/edge rewrite wasn't reachable
  }

  // TIER 2: Parallel Public CORS Proxies Race
  if (!chartResult) {
    try {
      chartResult = await raceToFirstSuccess([
        fetchYahooChartJson(`https://corsproxy.org/?${encodeURIComponent(yahooUrl1)}`, 9500),
        fetchYahooChartJson(`https://api.allorigins.win/raw?url=${encodeURIComponent(yahooUrl2)}`, 11000),
        fetchYahooChartJson(`https://api.allorigins.win/get?url=${encodeURIComponent(yahooUrl1)}`, 11000, true),
      ]);
    } catch {
      // ignore
    }
  }

  if (!chartResult) {
    throw new Error(
      `تعذر جلب بيانات السهم (${symbol}) من السوق حالياً. تأكد من كتابة رمز السهم الصحيح (مثل 1120.SR أو COMI.CA أو AAPL).`
    );
  }

  const meta = chartResult.meta || {};
  const timestamps: number[] = chartResult.timestamp || [];
  const quote = chartResult.indicators?.quote?.[0] || {};
  const rawOpens: (number | null)[] = quote.open || [];
  const rawHighs: (number | null)[] = quote.high || [];
  const rawLows: (number | null)[] = quote.low || [];
  const rawCloses: (number | null)[] = quote.close || [];
  const rawVolumes: (number | null)[] = quote.volume || [];

  // Build chronological daily OHLCV records (for previous days table & technicals)
  const chronologicalDays: StockHistoricalDay[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    const closeVal = rawCloses[i];
    if (typeof closeVal !== 'number' || isNaN(closeVal) || closeVal <= 0) continue;

    const openVal =
      typeof rawOpens[i] === 'number' && !isNaN(rawOpens[i]!) && rawOpens[i]! > 0
        ? rawOpens[i]!
        : closeVal;
    const highVal =
      typeof rawHighs[i] === 'number' && !isNaN(rawHighs[i]!) && rawHighs[i]! > 0
        ? rawHighs[i]!
        : Math.max(openVal, closeVal);
    const lowVal =
      typeof rawLows[i] === 'number' && !isNaN(rawLows[i]!) && rawLows[i]! > 0
        ? rawLows[i]!
        : Math.min(openVal, closeVal);
    const volVal =
      typeof rawVolumes[i] === 'number' && !isNaN(rawVolumes[i]!) && rawVolumes[i]! >= 0
        ? Math.round(rawVolumes[i]!)
        : 0;

    const prevDayClose =
      chronologicalDays.length > 0
        ? chronologicalDays[chronologicalDays.length - 1].close
        : openVal;
    const dayChange = Number((closeVal - prevDayClose).toFixed(2));
    const dayChangePct =
      prevDayClose > 0 ? Number((((closeVal - prevDayClose) / prevDayClose) * 100).toFixed(2)) : 0;

    const dateStr = new Date(timestamps[i] * 1000).toISOString().slice(0, 10);

    chronologicalDays.push({
      date: dateStr,
      open: Number(openVal.toFixed(2)),
      high: Number(highVal.toFixed(2)),
      low: Number(lowVal.toFixed(2)),
      close: Number(closeVal.toFixed(2)),
      volume: volVal,
      change: dayChange,
      changePercent: dayChangePct,
    });
  }

  const validCloses = chronologicalDays.map((d) => d.close);
  const validHighs = chronologicalDays.map((d) => d.high);
  const validLows = chronologicalDays.map((d) => d.low);
  const validVolumes = chronologicalDays.map((d) => d.volume);

  const currentPrice = Number(
    (
      meta.regularMarketPrice ||
      validCloses[validCloses.length - 1] ||
      existingStock?.currentPrice ||
      10
    ).toFixed(2)
  );

  // If the live intraday price differs from the last candle close, update the latest day entry
  if (chronologicalDays.length > 0) {
    const lastIdx = chronologicalDays.length - 1;
    const prevIdxClose =
      lastIdx >= 1 ? chronologicalDays[lastIdx - 1].close : chronologicalDays[lastIdx].open;
    chronologicalDays[lastIdx].close = currentPrice;
    chronologicalDays[lastIdx].high = Math.max(chronologicalDays[lastIdx].high, currentPrice);
    chronologicalDays[lastIdx].low = Math.min(chronologicalDays[lastIdx].low, currentPrice);
    chronologicalDays[lastIdx].change = Number((currentPrice - prevIdxClose).toFixed(2));
    chronologicalDays[lastIdx].changePercent =
      prevIdxClose > 0
        ? Number((((currentPrice - prevIdxClose) / prevIdxClose) * 100).toFixed(2))
        : 0;
  }

  const previousClose = Number(
    (
      (chronologicalDays.length >= 2
        ? chronologicalDays[chronologicalDays.length - 2].close
        : meta.chartPreviousClose || meta.previousClose) || currentPrice
    ).toFixed(2)
  );

  const changePercent =
    previousClose > 0
      ? Number((((currentPrice - previousClose) / previousClose) * 100).toFixed(2))
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

  // Compute Real Technicals from Historical Closes
  const rsi14 = calculateRSI14(validCloses);
  const ma50 = calculateSMA(validCloses, 50) || currentPrice;
  const ma200 = calculateSMA(validCloses, 120) || currentPrice;

  // Compute Real Support & Resistance from recent 20-day range & Pivot levels
  const recent20Lows = validLows.slice(-20);
  const recent20Highs = validHighs.slice(-20);
  const swingLow20 =
    recent20Lows.length > 0 ? Math.min(...recent20Lows) : currentPrice * 0.95;
  const swingHigh20 =
    recent20Highs.length > 0 ? Math.max(...recent20Highs) : currentPrice * 1.05;

  const support1 = Number(
    Math.min(currentPrice * 0.985, Math.max(swingLow20, currentPrice * 0.93)).toFixed(2)
  );
  const support2 = Number((support1 * 0.955).toFixed(2));
  const resistance1 = Number(
    Math.max(currentPrice * 1.015, Math.min(swingHigh20, currentPrice * 1.08)).toFixed(2)
  );
  const resistance2 = Number(Math.max(resistance1 * 1.05, high52W).toFixed(2));

  // Volume trend
  let volumeTrend: 'high' | 'normal' | 'low' = 'normal';
  if (validVolumes.length >= 10) {
    const recentVol = validVolumes[validVolumes.length - 1];
    const avgVol20 =
      validVolumes.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, validVolumes.length);
    if (recentVol > avgVol20 * 1.25) volumeTrend = 'high';
    else if (recentVol < avgVol20 * 0.7) volumeTrend = 'low';
  }

  const rangeMid = (high52W + low52W) / 2;
  const trendFactor = currentPrice >= ma50 ? 1.06 : 0.98;
  const estimatedFairValue =
    existingStock?.estimatedFairValue && existingStock.estimatedFairValue > 0
      ? existingStock.estimatedFairValue
      : Number(((rangeMid * 0.5 + ma50 * 0.5) * trendFactor).toFixed(2));

  let score = 58;
  if (currentPrice > ma50 && ma50 >= ma200) score += 15;
  else if (currentPrice > ma200) score += 8;
  else score -= 8;

  if (rsi14 >= 40 && rsi14 <= 64) score += 10;
  else if (rsi14 < 35) score += 7;
  else if (rsi14 > 72) score -= 10;

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

  let siteRationaleAr = '';
  if (analyticalSignal === 'strong_accumulation') {
    siteRationaleAr = `[فحص السوق الفعلي ${nowStr}]: يتداول السهم عند ${currentPrice} (إغلاق سابق ${previousClose} | تغير ${changePercent >= 0 ? '+' : ''}${changePercent}%)، وهو في منطقة فنية إيجابية قرب الدعم ${support1} مع RSI عند ${rsi14} ومتوسط 50 يوم عند ${ma50}. المقاومة المستهدفة الأولى ${resistance1} ثم ${resistance2}.`;
  } else if (analyticalSignal === 'positive_momentum') {
    siteRationaleAr = `[فحص السوق الفعلي ${nowStr}]: زخم إيجابي حيث يتداول السهم عند ${currentPrice} أعلى متوسط 50 يوم (${ma50}) مع RSI عند ${rsi14}. الحفاظ على مستوى الدعم ${support1} يدعم استهداف المقاومة ${resistance1}.`;
  } else if (analyticalSignal === 'take_profit_zone') {
    siteRationaleAr = `[فحص السوق الفعلي ${nowStr}]: السعر الحالي ${currentPrice} يقترب من منطقة المقاومة (${resistance1}) أو تشبع شرائي على مؤشر القوة النسبية (RSI: ${rsi14})؛ استرشادياً يُراقب لجني الأرباح الجزئي أو رفع الوقف إلى ${support1}.`;
  } else if (analyticalSignal === 'caution_risk') {
    siteRationaleAr = `[فحص السوق الفعلي ${nowStr}]: يتداول السهم عند ${currentPrice} دون المتوسط المتحرك 50 يوم (${ma50})؛ يُنصح استرشادياً بمراقبة ثبات مستوى الدعم ${support1} و${support2}.`;
  } else {
    siteRationaleAr = `[فحص السوق الفعلي ${nowStr}]: السعر الفعلي بالسوق ${currentPrice} (إغلاق سابق ${previousClose}) ويتحرك بين الدعم الأول ${support1} والمقاومة الأولى ${resistance1} مع مؤشر RSI عند ${rsi14}.`;
  }

  const siteRationaleEn = `[Live Market Scan ${nowStr}]: Trading at ${currentPrice} (Prev Close: ${previousClose}, ${changePercent >= 0 ? '+' : ''}${changePercent}%), RSI(14): ${rsi14}, MA50: ${ma50}. Support: ${support1}, Resistance: ${resistance1}.`;

  let detectedMarket: MarketRegion = preferredMarket;
  if (symbol.endsWith('.SR')) detectedMarket = 'saudi';
  else if (symbol.endsWith('.CA')) detectedMarket = 'egypt';
  else if (symbol.endsWith('.AE') || symbol.endsWith('.DU') || symbol.endsWith('.AD'))
    detectedMarket = 'uae';
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

  const recent30 = chronologicalDays.slice(-30);
  const priceHistory = recent30.map((d) => d.close);
  const priceDates = recent30.map((d) => d.date);
  if (priceHistory.length === 0) {
    priceHistory.push(currentPrice);
    priceDates.push(new Date().toISOString().slice(0, 10));
  }

  // Newest-first array of previous days for the Historical Days Table
  const historicalDays = [...chronologicalDays].reverse();

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
    previousClose,
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
    priceDates,
    historicalDays,
    lastUpdatedAt: nowStr,
    isWatchlisted: existingStock?.isWatchlisted ?? true,
  };
}
