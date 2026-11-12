// Visual identity palettes. The whole UI uses `brand-*` (and `indigo-*` / `violet-*`, which are
// aliased to brand in tailwind.config.js), so switching a palette re-colors the entire platform.
// Semantic colors (emerald = positive, rose = negative, amber = warning) are intentionally NOT themed.

export type PaletteId = 'ocean' | 'royal' | 'teal' | 'violet';

type Shades = Record<'50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | '950', string>;

export const PALETTES: Record<PaletteId, { nameAr: string; nameEn: string; swatch: string; shades: Shades }> = {
  ocean: {
    nameAr: 'أزرق المحيط',
    nameEn: 'Ocean',
    swatch: '#0284c7',
    shades: {
      '50': '240 249 255', '100': '224 242 254', '200': '186 230 253', '300': '125 211 252',
      '400': '56 189 248', '500': '14 165 233', '600': '2 132 199', '700': '3 105 161',
      '800': '7 89 133', '900': '12 74 110', '950': '8 47 73',
    },
  },
  royal: {
    nameAr: 'أزرق ملكي',
    nameEn: 'Royal',
    swatch: '#4f46e5',
    shades: {
      '50': '238 242 255', '100': '224 231 255', '200': '199 210 254', '300': '165 180 252',
      '400': '129 140 248', '500': '99 102 241', '600': '79 70 229', '700': '67 56 202',
      '800': '55 48 163', '900': '49 46 129', '950': '30 27 75',
    },
  },
  teal: {
    nameAr: 'تركوازي',
    nameEn: 'Teal',
    swatch: '#0d9488',
    shades: {
      '50': '240 253 250', '100': '204 251 241', '200': '153 246 228', '300': '94 234 212',
      '400': '45 212 191', '500': '20 184 166', '600': '13 148 136', '700': '15 118 110',
      '800': '17 94 89', '900': '19 78 74', '950': '4 47 46',
    },
  },
  violet: {
    nameAr: 'بنفسجي',
    nameEn: 'Violet',
    swatch: '#7c3aed',
    shades: {
      '50': '245 243 255', '100': '237 233 254', '200': '221 214 254', '300': '196 181 253',
      '400': '167 139 250', '500': '139 92 246', '600': '124 58 237', '700': '109 40 217',
      '800': '91 33 182', '900': '76 29 149', '950': '46 16 101',
    },
  },
};

const STORAGE_KEY = 'datasolu_palette';

export const getPalette = (): PaletteId => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as PaletteId | null;
    if (saved && saved in PALETTES) return saved;
  } catch {
    // ignore
  }
  return 'ocean';
};

export const applyPalette = (id: PaletteId) => {
  const root = document.documentElement;
  const { shades, swatch } = PALETTES[id];
  (Object.keys(shades) as (keyof Shades)[]).forEach((k) => root.style.setProperty(`--brand-${k}`, shades[k]));
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', swatch);
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // ignore
  }
};
