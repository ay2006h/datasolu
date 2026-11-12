import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '../../locales/i18nContext';
import { PAGE_SIZE_OPTIONS } from '../../hooks/usePagination';

interface PaginationProps {
  page: number;
  totalPages: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

/** Builds a compact page list like: 1 … 4 5 6 … 20 */
const buildPages = (page: number, totalPages: number): (number | '…')[] => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages: (number | '…')[] = [1];
  const from = Math.max(2, page - 1);
  const to = Math.min(totalPages - 1, page + 1);
  if (from > 2) pages.push('…');
  for (let p = from; p <= to; p++) pages.push(p);
  if (to < totalPages - 1) pages.push('…');
  pages.push(totalPages);
  return pages;
};

/**
 * Unified pagination footer used by every large list/table in the platform.
 * Hidden automatically when the list fits in the smallest page size.
 */
export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  className = '',
}) => {
  const { language, dir } = useI18n();
  const isAr = language === 'ar';

  if (total <= Math.min(...pageSizeOptions)) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const PrevIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;
  const NextIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;

  const btn =
    'min-w-[34px] h-[34px] px-2 inline-flex items-center justify-center rounded-lg text-xs font-bold border transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
  const idle =
    'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700';

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 pt-3 ${className}`}>
      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        <span>
          {from.toLocaleString()}–{to.toLocaleString()} {isAr ? 'من' : 'of'} {total.toLocaleString()}
        </span>
        {onPageSizeChange && (
          <label className="flex items-center gap-1.5">
            <span>{isAr ? 'لكل صفحة' : 'Per page'}</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {pageSizeOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {totalPages > 1 && (
        <nav className="flex items-center gap-1" aria-label={isAr ? 'التنقل بين الصفحات' : 'Pagination'}>
          <button
            className={`${btn} ${idle}`}
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            aria-label={isAr ? 'السابق' : 'Previous'}
          >
            <PrevIcon className="w-4 h-4" />
          </button>
          {buildPages(page, totalPages).map((p, i) =>
            p === '…' ? (
              <span key={`gap-${i}`} className="px-1 text-slate-400 text-xs">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`${btn} ${
                  p === page ? 'bg-brand-600 border-brand-600 text-white' : idle
                } ${Math.abs(p - page) > 1 && p !== 1 && p !== totalPages ? 'hidden sm:inline-flex' : ''}`}
                aria-current={p === page ? 'page' : undefined}
              >
                {p}
              </button>
            )
          )}
          <button
            className={`${btn} ${idle}`}
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label={isAr ? 'التالي' : 'Next'}
          >
            <NextIcon className="w-4 h-4" />
          </button>
        </nav>
      )}
    </div>
  );
};
