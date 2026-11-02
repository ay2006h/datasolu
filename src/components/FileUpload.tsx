import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Briefcase,
  Layers,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  FolderOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useI18n } from '../locales/i18nContext';
import { parseExcelFile } from '../utils/excelParser';
import { getSampleProjectsData, getSampleSalesData } from '../utils/sampleData';
import { WorkbookData } from '../types';

interface FileUploadProps {
  onDataLoaded: (data: WorkbookData) => void;
  workbook: WorkbookData | null;
  onSheetChange: (sheetName: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onDataLoaded,
  workbook,
  onSheetChange,
}) => {
  const { t, language, dir } = useI18n();
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDropzone, setShowDropzone] = useState(!workbook);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setErrorMessage(
        language === 'ar'
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
        language === 'ar'
          ? `حدث خطأ أثناء قراءة ملف الإكسيل: ${err.message || 'تأكد من سلامة تنسيق الملف'}`
          : `Error parsing Excel file: ${err.message || 'Please check file format'}`
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const loadSample = (type: 'sales' | 'projects') => {
    if (type === 'sales') {
      onDataLoaded(getSampleSalesData(language));
    } else {
      onDataLoaded(getSampleProjectsData(language));
    }
    setShowDropzone(false);
  };

  return (
    <div className="w-full space-y-4">
      {/* Hidden File Input (Always in DOM and accessible globally) */}
      <input
        type="file"
        id="global-excel-file-input"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
            e.target.value = ''; // Reset so same file can be selected again
          }
        }}
        accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv"
        className="hidden"
      />

      {/* Active Workbook Status Banner (when workbook exists) */}
      {workbook && (
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {workbook.fileName}
                </h3>
                <span className="text-[11px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {language === 'ar' ? 'تم التحليل بنجاح' : 'Analyzed'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {workbook.sheets[workbook.activeSheet]?.rowCount.toLocaleString() || 0} {t.upload.totalRows} •{' '}
                {workbook.sheets[workbook.activeSheet]?.columns.length || 0} {t.upload.totalCols}
              </p>
            </div>
          </div>

          {/* Sheet Selector & Action buttons */}
          <div className="flex items-center gap-2">
            {workbook.sheetNames.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {t.upload.sheetSelector}
                </span>
                <select
                  value={workbook.activeSheet}
                  onChange={(e) => onSheetChange(e.target.value)}
                  className="text-xs font-semibold bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {workbook.sheetNames.map((name) => (
                    <option key={name} value={name}>
                      {name} ({workbook.sheets[name]?.rowCount || 0} {language === 'ar' ? 'سجل' : 'rows'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Direct Upload Trigger Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all hover:scale-105"
            >
              <FolderOpen className="w-4 h-4" />
              <span>{t.nav.uploadNew}</span>
            </button>

            {/* Toggle Dropzone view */}
            <button
              onClick={() => setShowDropzone(!showDropzone)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
              title="Toggle Dropzone"
            >
              {showDropzone ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Main Drag & Drop Zone */}
      {(!workbook || showDropzone) && (
        <div className="space-y-6">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer relative overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 p-8 sm:p-10 text-center ${
              isDragging
                ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/40 scale-[1.01]'
                : 'border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/60 hover:border-brand-400 hover:bg-slate-50/90 dark:hover:bg-slate-800/90 shadow-sm'
            }`}
          >
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-500 to-indigo-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-brand-500/25">
                {isLoading ? (
                  <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <UploadCloud className="w-8 h-8" />
                )}
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {isLoading ? t.upload.processing : t.upload.dropzoneTitle}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {t.upload.dropzoneSubtitle}
                </p>
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-md shadow-brand-500/20 transition-all hover:scale-105"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>{t.upload.browseFiles}</span>
              </button>
            </div>

            {errorMessage && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-medium max-w-md mx-auto">
                {errorMessage}
              </div>
            )}
          </div>

          {/* Quick Try Samples Section */}
          <div className="bg-slate-100/70 dark:bg-slate-800/40 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-brand-500" />
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {t.upload.quickTry}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => loadSample('sales')}
                className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:shadow-md transition-all text-start group"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {t.upload.sampleSales}
                    </span>
                    {dir === 'rtl' ? (
                      <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-brand-500 group-hover:-translate-x-1 transition-all" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {language === 'ar'
                      ? 'مبيعات شهرية، أرباح الفروع، فئات المنتجات، وحالات العمليات.'
                      : 'Monthly sales, branch profits, product categories, and transaction statuses.'}
                  </p>
                </div>
              </button>

              <button
                onClick={() => loadSample('projects')}
                className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:shadow-md transition-all text-start group"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {t.upload.sampleProjects}
                    </span>
                    {dir === 'rtl' ? (
                      <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-brand-500 group-hover:-translate-x-1 transition-all" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {language === 'ar'
                      ? 'الميزانيات المعتمدة، المصروف الفعلي، نسب الإنجاز، وموقف المشاريع.'
                      : 'Project budgets, actual spending, completion rates, and operations status.'}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
