import React, { useState, useMemo } from 'react';
import { SheetData } from '../types';
import { useI18n } from '../locales/i18nContext';
import { exportTableToCsv } from '../utils/pdfExporter';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from './ui/Pagination';
import {
  Search,
  Download,
  Database,
  ArrowUpDown,
} from 'lucide-react';

interface DataTableProps {
  sheet: SheetData;
}

export const DataTable: React.FC<DataTableProps> = ({ sheet }) => {
  const { t, language } = useI18n();
  const { headers, rows, columns } = sheet;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColumnFilter, setSelectedColumnFilter] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter and Search logic
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesAny = Object.values(row).some((val) =>
          String(val ?? '').toLowerCase().includes(query)
        );
        if (!matchesAny) return false;
      }

      if (selectedColumnFilter && filterValue) {
        const val = String(row[selectedColumnFilter] ?? '').toLowerCase();
        if (!val.includes(filterValue.toLowerCase())) return false;
      }

      return true;
    });
  }, [rows, searchQuery, selectedColumnFilter, filterValue]);

  // Sort logic
  const sortedRows = useMemo(() => {
    if (!sortCol) return filteredRows;

    return [...filteredRows].sort((a, b) => {
      const aVal = a[sortCol];
      const bVal = b[sortCol];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return sortOrder === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filteredRows, sortCol, sortOrder]);

  const pg = usePagination(sortedRows, 10);

  const handleSort = (header: string) => {
    if (sortCol === header) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(header);
      setSortOrder('asc');
    }
  };

  const handleExport = () => {
    exportTableToCsv(headers, sortedRows, `${sheet.name}_export.csv`);
  };

  const renderCellContent = (header: string, val: any) => {
    const colInfo = columns.find((c) => c.name === header);

    if (val === null || val === undefined || val === '') {
      return <span className="text-slate-300 dark:text-slate-600">-</span>;
    }

    if (colInfo?.type === 'status' || typeof val === 'string') {
      const strVal = String(val).toLowerCase();
      if (strVal.includes('مكتمل') || strVal.includes('complete') || strVal.includes('done')) {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            {val}
          </span>
        );
      }
      if (strVal.includes('قيد') || strVal.includes('progress') || strVal.includes('active')) {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
            {val}
          </span>
        );
      }
      if (strVal.includes('متأخر') || strVal.includes('delay') || strVal.includes('ملغي')) {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            {val}
          </span>
        );
      }
      if (strVal.includes('معلق') || strVal.includes('pending')) {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            {val}
          </span>
        );
      }
    }

    if (typeof val === 'number') {
      return (
        <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono">
          {val.toLocaleString()}
        </span>
      );
    }

    return <span>{String(val)}</span>;
  };

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {t.table.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {sortedRows.length.toLocaleString()} / {rows.length.toLocaleString()} {t.table.records}
            </p>
          </div>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
        >
          <Download className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span>{t.table.exportCsv}</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.table.searchPlaceholder}
            className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-xl ps-9 pe-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedColumnFilter}
            onChange={(e) => {
              setSelectedColumnFilter(e.target.value);
              setFilterValue('');
            }}
            className="text-xs font-semibold bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300"
          >
            <option value="">{t.table.filterBy}...</option>
            {columns
              .filter((c) => c.type === 'string' || c.type === 'status')
              .map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
          </select>

          {selectedColumnFilter && (
            <input
              type="text"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              placeholder={language === 'ar' ? 'القيمة...' : 'Value...'}
              className="text-xs font-medium bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 w-32"
            />
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-700">
        <table className="w-full text-xs text-start">
          <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-3 text-start w-12 sticky start-0 bg-slate-100 dark:bg-slate-900 z-10">#</th>
              {headers.map((header) => (
                <th
                  key={header}
                  onClick={() => handleSort(header)}
                  className="p-3 text-start cursor-pointer hover:text-brand-600 dark:hover:text-brand-400 whitespace-nowrap select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{header}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {pg.pageItems.length > 0 ? (
              pg.pageItems.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <td className="p-3 font-mono text-slate-400 sticky start-0 bg-white dark:bg-slate-800 z-10">
                    {pg.startIndex + idx + 1}
                  </td>
                  {headers.map((header) => (
                    <td key={header} className="p-3 whitespace-nowrap">
                      {renderCellContent(header, row[header])}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={headers.length + 1}
                  className="text-center py-10 text-slate-400 font-medium"
                >
                  {t.table.noData}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Unified Pagination Footer with Page Size Selector */}
      <Pagination
        page={pg.page}
        totalPages={pg.totalPages}
        pageSize={pg.pageSize}
        total={pg.total}
        onPageChange={pg.setPage}
        onPageSizeChange={pg.setPageSize}
      />
    </div>
  );
};
