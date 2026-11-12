export type SupportedCurrency = 'SAR' | 'EGP' | 'USD' | 'AED' | 'KWD' | 'QAR' | 'EUR';

export interface CurrencyOption {
  code: SupportedCurrency;
  symbolAr: string;
  symbolEn: string;
  nameAr: string;
  nameEn: string;
  flag: string;
}

export interface CashCurrencyEntry {
  id: string;
  currency: SupportedCurrency;
  amount: number;
  note?: string;
}

export interface StoredFxRates {
  base: 'USD';
  ratesPerUsd: Record<string, number>;
  lastUpdatedDate: string; // YYYY-MM-DD
  lastUpdatedTime: string; // HH:MM
  source: 'live_api' | 'fallback';
}

const FX_STORAGE_KEY = 'datasolu_fx_rates_v2';

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  {
    code: 'SAR',
    symbolAr: 'ر.س',
    symbolEn: 'SAR',
    nameAr: 'ريال سعودي (SAR)',
    nameEn: 'Saudi Riyal (SAR)',
    flag: '🇸🇦',
  },
  {
    code: 'EGP',
    symbolAr: 'ج.م',
    symbolEn: 'EGP',
    nameAr: 'جنيه مصري (EGP)',
    nameEn: 'Egyptian Pound (EGP)',
    flag: '🇪🇬',
  },
  {
    code: 'USD',
    symbolAr: '$',
    symbolEn: 'USD',
    nameAr: 'دولار أمريكي (USD)',
    nameEn: 'US Dollar (USD)',
    flag: '🇺🇸',
  },
  {
    code: 'AED',
    symbolAr: 'د.إ',
    symbolEn: 'AED',
    nameAr: 'درهم إماراتي (AED)',
    nameEn: 'UAE Dirham (AED)',
    flag: '🇦🇪',
  },
  {
    code: 'KWD',
    symbolAr: 'د.ك',
    symbolEn: 'KWD',
    nameAr: 'دينار كويتي (KWD)',
    nameEn: 'Kuwaiti Dinar (KWD)',
    flag: '🇰🇼',
  },
  {
    code: 'QAR',
    symbolAr: 'ر.ق',
    symbolEn: 'QAR',
    nameAr: 'ريال قطري (QAR)',
    nameEn: 'Qatari Riyal (QAR)',
    flag: '🇶🇦',
  },
  {
    code: 'EUR',
    symbolAr: '€',
    symbolEn: 'EUR',
    nameAr: 'يورو أوروبي (EUR)',
    nameEn: 'Euro (EUR)',
    flag: '🇪🇺',
  },
];

// Accurate baseline exchange rates per 1 USD (updated automatically from live API daily)
export const DEFAULT_FX_RATES_PER_USD: Record<string, number> = {
  USD: 1,
  SAR: 3.75,
  AED: 3.6725,
  EGP: 49.45,
  KWD: 0.3075,
  QAR: 3.64,
  EUR: 0.925,
  GBP: 0.79,
};

export function getCurrencyInfo(code: string): CurrencyOption {
  const upper = (code || 'SAR').toUpperCase();
  return (
    CURRENCY_OPTIONS.find((c) => c.code === upper) || {
      code: (upper as SupportedCurrency) || 'SAR',
      symbolAr: upper,
      symbolEn: upper,
      nameAr: upper,
      nameEn: upper,
      flag: '💱',
    }
  );
}

export function getCurrencySymbol(code: string, isAr: boolean): string {
  const info = getCurrencyInfo(code);
  return isAr ? info.symbolAr : info.symbolEn;
}

export function getStoredFxRates(): StoredFxRates {
  try {
    const raw = localStorage.getItem(FX_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.ratesPerUsd && typeof parsed.ratesPerUsd.SAR === 'number') {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  const now = new Date();
  return {
    base: 'USD',
    ratesPerUsd: { ...DEFAULT_FX_RATES_PER_USD },
    lastUpdatedDate: now.toISOString().slice(0, 10),
    lastUpdatedTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    source: 'fallback',
  };
}

/**
 * Fetches live daily exchange rates from open FX API (and Yahoo Finance FX fallback)
 * and persists them to localStorage for the current day.
 */
export async function fetchDailyExchangeRates(forceRefresh = false): Promise<StoredFxRates> {
  const today = new Date().toISOString().slice(0, 10);
  const existing = getStoredFxRates();

  if (!forceRefresh && existing.source === 'live_api' && existing.lastUpdatedDate === today) {
    return existing;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6500);
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (data && data.rates && typeof data.rates.SAR === 'number') {
        const mergedRates: Record<string, number> = {
          ...DEFAULT_FX_RATES_PER_USD,
          ...data.rates,
          USD: 1,
        };
        const updated: StoredFxRates = {
          base: 'USD',
          ratesPerUsd: mergedRates,
          lastUpdatedDate: today,
          lastUpdatedTime: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          source: 'live_api',
        };
        try {
          localStorage.setItem(FX_STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      }
    }
  } catch {
    // Fallback to secondary check or stored rates
  }

  return existing;
}

/**
 * Converts an amount from `fromCurrency` to `toCurrency` using `ratesPerUsd`.
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  ratesPerUsd: Record<string, number> = DEFAULT_FX_RATES_PER_USD
): number {
  if (!amount || isNaN(amount)) return 0;
  const from = (fromCurrency || 'SAR').toUpperCase().trim();
  const to = (toCurrency || 'SAR').toUpperCase().trim();
  if (from === to) return amount;

  const fromRate = ratesPerUsd[from] || DEFAULT_FX_RATES_PER_USD[from] || 1;
  const toRate = ratesPerUsd[to] || DEFAULT_FX_RATES_PER_USD[to] || 1;

  // Convert from -> USD -> to
  const amountInUsd = amount / fromRate;
  return amountInUsd * toRate;
}

/**
 * Returns how many units of `toCurrency` equal 1 unit of `fromCurrency`.
 */
export function getExchangeRate(
  fromCurrency: string,
  toCurrency: string,
  ratesPerUsd: Record<string, number> = DEFAULT_FX_RATES_PER_USD
): number {
  const from = (fromCurrency || 'SAR').toUpperCase().trim();
  const to = (toCurrency || 'SAR').toUpperCase().trim();
  if (from === to) return 1;
  return convertCurrency(1, from, to, ratesPerUsd);
}

/**
 * Per-section currency storage so each workspace section ('sales', 'inventory', 'stocks')
 * has its own independent currency choice.
 */
export function getSectionCurrency(
  section: 'sales' | 'inventory' | 'stocks',
  defaultCurrency: SupportedCurrency = 'SAR'
): SupportedCurrency {
  try {
    const val = localStorage.getItem(`datasolu_section_currency_${section}`);
    if (val && CURRENCY_OPTIONS.some((c) => c.code === val)) {
      return val as SupportedCurrency;
    }
  } catch {
    // ignore
  }
  return defaultCurrency;
}

export function setSectionCurrency(
  section: 'sales' | 'inventory' | 'stocks',
  currency: SupportedCurrency
): void {
  try {
    localStorage.setItem(`datasolu_section_currency_${section}`, currency);
  } catch {
    // ignore
  }
}
