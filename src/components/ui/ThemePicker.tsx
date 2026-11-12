import React, { useEffect, useRef, useState } from 'react';
import { Palette, Check } from 'lucide-react';
import { useI18n } from '../../locales/i18nContext';
import { PALETTES, PaletteId, applyPalette, getPalette } from '../../theme/palette';

/** Lets the user pick the platform's visual identity (brand palette). */
export const ThemePicker: React.FC = () => {
  const { language } = useI18n();
  const isAr = language === 'ar';
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<PaletteId>(getPalette);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const choose = (id: PaletteId) => {
    applyPalette(id);
    setCurrent(id);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
        title={isAr ? 'الهوية البصرية' : 'Visual identity'}
        aria-label={isAr ? 'الهوية البصرية' : 'Visual identity'}
      >
        <Palette className="w-4 h-4 text-brand-600 dark:text-brand-400" />
      </button>
      {open && (
        <div className="absolute end-0 mt-2 w-48 p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl z-50">
          {(Object.keys(PALETTES) as PaletteId[]).map((id) => (
            <button
              key={id}
              onClick={() => choose(id)}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <span className="w-4 h-4 rounded-full" style={{ background: PALETTES[id].swatch }} />
              <span className="flex-1 text-start">{isAr ? PALETTES[id].nameAr : PALETTES[id].nameEn}</span>
              {current === id && <Check className="w-4 h-4 text-brand-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
