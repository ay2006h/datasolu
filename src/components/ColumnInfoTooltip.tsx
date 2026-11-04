import React, { useState, useRef, useEffect } from 'react';
import { Info, X, Tag, Sparkles } from 'lucide-react';

export interface ColumnInfoTooltipProps {
  title: string;
  description: string;
  examples?: string[];
  impact?: string;
  required?: boolean;
  isAr?: boolean;
  align?: 'start' | 'end';
}

export const ColumnInfoTooltip: React.FC<ColumnInfoTooltipProps> = ({
  title,
  description,
  examples = [],
  impact,
  required = false,
  isAr = true,
  align = 'start',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const alignmentClass =
    align === 'end'
      ? 'end-0 sm:end-auto sm:-translate-x-0'
      : 'start-0 sm:start-auto sm:-translate-x-0';

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center align-middle"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        aria-label={isAr ? `شرح ${title}` : `Explain ${title}`}
        title={description}
        className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
          isOpen
            ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400'
            : 'bg-slate-200/80 hover:bg-emerald-100 text-slate-500 hover:text-emerald-700 dark:bg-slate-700/80 dark:hover:bg-emerald-950 dark:text-slate-300 dark:hover:text-emerald-300 border border-slate-300 dark:border-slate-600'
        }`}
      >
        <Info className="w-2.5 h-2.5" />
      </button>

      {/* Popover Box */}
      {isOpen && (
        <div
          role="tooltip"
          className={`absolute top-full mt-2 ${alignmentClass} z-50 w-72 sm:w-80 p-3.5 rounded-2xl bg-slate-900/95 dark:bg-slate-900 text-white shadow-2xl border border-slate-700/90 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 select-text`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 pb-2 mb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
              <h5 className="text-xs font-bold text-slate-100 truncate">
                {title}
              </h5>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {required ? (
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {isAr ? 'أساسي' : 'Required'}
                </span>
              ) : (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  {isAr ? 'اختياري' : 'Optional'}
                </span>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-slate-800 transition-colors sm:hidden"
                aria-label={isAr ? 'إغلاق' : 'Close'}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Description */}
          <p className="text-[11px] leading-relaxed text-slate-300 font-normal">
            {description}
          </p>

          {/* Common Excel Headers Examples */}
          {examples.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 mb-1.5">
                <Tag className="w-2.5 h-2.5 text-emerald-400" />
                <span>
                  {isAr ? 'أمثلة لأسماء هذا العمود في ملفك:' : 'Common Column Names:'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {examples.map((ex) => (
                  <span
                    key={ex}
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/90 text-emerald-300 border border-slate-700/60"
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Impact on analytics */}
          {impact && (
            <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-start gap-1.5 text-[10px] text-amber-300/90 leading-tight">
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-amber-200">
                  {isAr ? 'الفائدة في التحليل: ' : 'Impact: '}
                </strong>
                {impact}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
