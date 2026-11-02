import React, { useState, useMemo } from 'react';
import { SheetData } from '../types';
import { useI18n } from '../locales/i18nContext';
import { Table, Split, Calculator } from 'lucide-react';
import { formatCurrency } from '../utils/analyticsEngine';

interface PivotTableProps {
  sheet: SheetData;
}

export const PivotTable: React.FC<PivotTableProps> = ({ sheet }) => {
  const { t, language } = useI18n();
  const isAr = language === 'ar';
  const { rows, columns } = sheet;

  const stringCols = columns.filter((c) => c.type === 'string' || c.type === 'status');
  const numericCols = columns.filter((c) => c.type === 'number');

  const [rowDim, setRowDim] = useState<string>(stringCols[0]?.name || columns[0]?.name || '');
  const [colDim, setColDim] = useState<string>(
    stringCols[1]?.name || stringCols[0]?.name || columns[1]?.name || ''
  );
  const [valDim, setValDim] = useState<string>(numericCols[0]?.name || '');
  const [aggMode, setAggMode] = useState<'sum' | 'count' | 'avg'>('sum');

  // Compute Pivot matrix
  const { rowKeys, colKeys, matrix, colTotals, rowTotals, grandTotal } = useMemo(() => {
    if (!rowDim || !colDim || !valDim) {
      return { rowKeys: [], colKeys: [], matrix: {}, colTotals: {}, rowTotals: {}, grandTotal: 0 };
    }

    const rowSet = new Set<string>();
    const colSet = new Set<string>();
    const cellValues: Record<string, Record<string, number[]>> = {};

    rows.forEach((r) => {
      const rKey = String(r[rowDim] ?? 'N/A').trim();
      const cKey = String(r[colDim] ?? 'N/A').trim();
      const rawVal = r[valDim];
      const val = typeof rawVal === 'number' ? rawVal : parseFloat(String(rawVal).replace(/[^0-9.-]+/g, '')) || 0;

      rowSet.add(rKey);
      colSet.add(cKey);

      if (!cellValues[rKey]) cellValues[rKey] = {};
      if (!cellValues[rKey][cKey]) cellValues[rKey][cKey] = [];

      cellValues[rKey][cKey].push(val);
    });

    const rowKeys = Array.from(rowSet).slice(0, 20);
    const colKeys = Array.from(colSet).slice(0, 10);

    const matrix: Record<string, Record<string, number>> = {};
    const colTotals: Record<string, number> = {};
    const rowTotals: Record<string, number> = {};
    let grandTotal = 0;

    rowKeys.forEach((rK) => {
      matrix[rK] = {};
      let rSum = 0;

      colKeys.forEach((cK) => {
        const nums = cellValues[rK]?.[cK] || [];
        let calculated = 0;

        if (nums.length > 0) {
          if (aggMode === 'sum') {
            calculated = nums.reduce((a, b) => a + b, 0);
          } else if (aggMode === 'count') {
            calculated = nums.length;
          } else if (aggMode === 'avg') {
            calculated = nums.reduce((a, b) => a + b, 0) / nums.length;
          }
        }

        matrix[rK][cK] = Math.round(calculated * 10) / 10;
        rSum += calculated;
        colTotals[cK] = (colTotals[cK] || 0) + calculated;
      });

      rowTotals[rK] = Math.round(rSum * 10) / 10;
      grandTotal += rSum;
    });

    return {
      rowKeys,
      colKeys,
      matrix,
      colTotals,
      rowTotals,
      grandTotal: Math.round(grandTotal * 10) / 10,
    };
  }, [rows, rowDim, colDim, valDim, aggMode]);

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-700/60">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
          <Split className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {t.pivot.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.pivot.subtitle}
          </p>
        </div>
      </div>

      {/* Control Pickers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800">
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
            {t.pivot.rowDimension}
          </label>
          <select
            value={rowDim}
            onChange={(e) => setRowDim(e.target.value)}
            className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
          >
            {columns.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
            {t.pivot.colDimension}
          </label>
          <select
            value={colDim}
            onChange={(e) => setColDim(e.target.value)}
            className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
          >
            {columns.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
            {t.pivot.valDimension}
          </label>
          <select
            value={valDim}
            onChange={(e) => setValDim(e.target.value)}
            className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
          >
            {numericCols.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
            {t.charts.aggregation}
          </label>
          <select
            value={aggMode}
            onChange={(e) => setAggMode(e.target.value as any)}
            className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200"
          >
            <option value="sum">{t.charts.sum}</option>
            <option value="avg">{t.charts.avg}</option>
            <option value="count">{t.charts.count}</option>
          </select>
        </div>
      </div>

      {/* Pivot Matrix Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-700">
        <table className="w-full text-xs text-start">
          <thead className="bg-slate-100/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-3.5 text-start bg-slate-200/60 dark:bg-slate-950">
                {rowDim} \ {colDim}
              </th>
              {colKeys.map((cK) => (
                <th key={cK} className="p-3.5 text-center whitespace-nowrap">
                  {cK}
                </th>
              ))}
              <th className="p-3.5 text-center bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 whitespace-nowrap">
                {t.pivot.grandTotal}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {rowKeys.map((rK) => (
              <tr key={rK} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30">
                <td className="p-3.5 font-bold text-slate-900 dark:text-white bg-slate-50/60 dark:bg-slate-900/40">
                  {rK}
                </td>
                {colKeys.map((cK) => {
                  const val = matrix[rK]?.[cK] || 0;
                  return (
                    <td key={cK} className="p-3.5 text-center font-mono font-medium">
                      {val !== 0 ? val.toLocaleString() : '-'}
                    </td>
                  );
                })}
                <td className="p-3.5 text-center font-mono font-bold bg-brand-50/30 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400">
                  {rowTotals[rK]?.toLocaleString() || 0}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-100/90 dark:bg-slate-900/90 font-bold border-t-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
            <tr>
              <td className="p-3.5 text-start bg-slate-200/60 dark:bg-slate-950">
                {t.pivot.grandTotal}
              </td>
              {colKeys.map((cK) => (
                <td key={cK} className="p-3.5 text-center font-mono">
                  {(colTotals[cK] || 0).toLocaleString()}
                </td>
              ))}
              <td className="p-3.5 text-center font-mono font-black text-brand-600 dark:text-brand-400 bg-brand-100/50 dark:bg-brand-950/80">
                {grandTotal.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
