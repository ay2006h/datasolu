import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Briefcase,
  Package,
  ArrowRight,
  ArrowLeft,
  FolderOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useI18n } from '../locales/i18nContext';
import { parseExcelFile } from '../utils/excelParser';
import {
  getSampleProjectsData,
  getSampleSalesData,
  getSampleInventoryData,
} from '../utils/sampleData';
import { WorkbookData } from '../types';

interface FileUploadProps {
  mode: 'sales' | 'inventory';
  onDataLoaded: (data: WorkbookData) => void;
  workbook: WorkbookData | null;
  onSheetChange: (sheetName: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  mode,
  onDataLoaded,
  workbook,
  onSheetChange,
}) => {
  const { t, language, dir } = useI18n();
  const isAr = language === 'ar';
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDropzone, setShowDropzone] = useState(!workbook);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setErrorMessage(
        isAr
          ? 'يرجى اختيار ملف بصيغة .xlsx أو .xls أو .csv'
          : 'Please select a .xlsx, .xls, or .csv file'
      );
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const parsedData = await parseExcelFile(file);
      onDataLoaded(parsedData);
      setShowDropzone(false);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        isAr
          ? `خطأ أثناء قراءة الملف: ${err.message || 'تأكد من التنسيق'}`
          : `Error parsing file: ${err.message || 'Check file format'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const loadSample = (type: 'sales' | 'projects' | 'inventory') => {
    if (type === 'inventory') {
      onDataLoaded(getSampleInventoryData(language));
    } else if (type === 'sales') {
      onDataLoaded(getSampleSalesData(language));
    } else {
      onDataLoaded(getSampleProjectsData(language));
    }
    setShowDropzone(false);
  };

  const isInventoryMode = mode === 'inventory';
  const NextIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <div className="w-full space-y-4">
      <input
        type="file"
        id="global-excel-file-input"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
            e.target.value = '';
          }
        }}
        accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv"
        className="hidden"
      />

      {/* Active Workbook Compact Bar */}
      {workbook && (
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center flex-shrink-0">
              {isInventoryMode ? <Package className="w-5 h-5" /> : <FileSpreadsheet className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {workbook.fileName}
                </h3>
                <span className="text-[11px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {isAr ? 'نشط' : 'Active'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {workbook.sheets[workbook.activeSheet]?.rowCount.toLocaleString() || 0}{' '}
                {t.upload.totalRows} •{' '}
                {workbook.sheets[workbook.activeSheet]?.columns.length || 0}{' '}
                {t.upload.totalCols}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {workbook.sheetNames.length > 1 && (
              <select
                value={workbook.activeSheet}
                onChange={(e) => onSheetChange(e.target.value)}
                className="text-xs font-semibold bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {workbook.sheetNames.map((name) => (
                  <option key={name} value={name}>
                    {name} ({workbook.sheets[name]?.rowCount || 0})
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all"
            >
              <FolderOpen className="w-4 h-4" />
              <span>{isAr ? 'تغيير الملف' : 'Change File'}</span>
            </button>

            <button
              onClick={() => setShowDropzone(!showDropzone)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
              title={isAr ? 'إظهار/إخفاء منطقة الرفع' : 'Toggle upload area'}
            >
              {showDropzone ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Upload & Quick Sample Zone */}
      {(!workbook || showDropzone) && (
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6 shadow-sm space-y-5">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed transition-all p-6 sm:p-8 text-center ${
              isDragging
                ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/40'
                : 'border-slate-300 dark:border-slate-700 hover:border-brand-500 bg-slate-50/60 dark:bg-slate-900/40'
            }`}
          >
            <div className="max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-md shadow-brand-500/20">
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <UploadCloud className="w-6 h-6" />
                )}
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {isLoading
                    ? t.upload.processing
                    : isInventoryMode
                    ? isAr
                      ? 'ارفع ملف المخزون والأصناف'
                      : 'Upload Inventory Excel File'
                    : isAr
                    ? 'ارفع ملف المبيعات'
                    : 'Upload Sales Excel File'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {isAr ? 'يدعم ملفات .xlsx و .xls و .csv' : 'Supports .xlsx, .xls, and .csv files'}
                </p>
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>{isAr ? 'اختيار ملف من جهازك' : 'Choose File'}</span>
              </button>
            </div>

            {errorMessage && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-medium max-w-md mx-auto">
                {errorMessage}
              </div>
            )}
          </div>

          {/* Quick Demo Datasets */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-brand-500" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                {isAr ? 'أو استعرض لوحة التحكم ببيانات تجريبية جاهزة:' : 'Or preview with a sample dataset:'}
              </span>
            </div>

            {isInventoryMode ? (
              <button
                onClick={() => loadSample('inventory')}
                className="w-full flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 hover:border-brand-500 transition-all text-start group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                      {isAr ? 'نموذج المخزون وحركة الأصناف' : 'Inventory & SKU Velocity Sample'}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isAr ? 'الأصناف الكينج، تصنيف ABC، وخطة التوريد' : 'King items, ABC velocity & restock plan'}
                    </span>
                  </div>
                </div>
                <NextIcon className="w-4 h-4 text-slate-400 group-hover:text-brand-500 transition-colors" />
              </button>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => loadSample('sales')}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 hover:border-brand-500 transition-all text-start group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                        {t.upload.sampleSales}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {isAr ? 'إيرادات، أرباح، فروع، وتشخيص SWOT' : 'Revenue, profit, branches & SWOT'}
                      </span>
                    </div>
                  </div>
                  <NextIcon className="w-4 h-4 text-slate-400 group-hover:text-brand-500 transition-colors" />
                </button>

                <button
                  onClick={() => loadSample('projects')}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 hover:border-brand-500 transition-all text-start group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                        {t.upload.sampleProjects}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {isAr ? 'ميزانيات، مصروفات، ونسب إنجاز' : 'Budgets, spending & completion'}
                      </span>
                    </div>
                  </div>
                  <NextIcon className="w-4 h-4 text-slate-400 group-hover:text-brand-500 transition-colors" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
