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

  return (
    <div className="w-full space-y-4">
      {/* Hidden File Input (Distinct ID per mode, plus global trigger support) */}
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

      {/* Active Workbook Status Banner (when workbook exists for current mode) */}
      {workbook && (
        <div
          className={`bg-white dark:bg-slate-800/90 rounded-2xl p-4 border shadow-sm flex flex-wrap items-center justify-between gap-4 ${
            isInventoryMode
              ? 'border-amber-300 dark:border-amber-700/70'
              : 'border-emerald-300 dark:border-emerald-700/70'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${
                isInventoryMode
                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400'
                  : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {isInventoryMode ? (
                <Package className="w-6 h-6" />
              ) : (
                <FileSpreadsheet className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                    isInventoryMode
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {isInventoryMode
                    ? isAr
                      ? 'ملف المخزون والأصناف المستقل'
                      : 'Inventory File'
                    : isAr
                    ? 'ملف المبيعات المستقل'
                    : 'Sales File'}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {workbook.fileName}
                </h3>
                <span className="text-[11px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isAr ? 'جاهز للتحليل' : 'Ready'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {workbook.sheets[workbook.activeSheet]?.rowCount.toLocaleString() || 0}{' '}
                {t.upload.totalRows} •{' '}
                {workbook.sheets[workbook.activeSheet]?.columns.length || 0}{' '}
                {t.upload.totalCols}
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
                      {name} ({workbook.sheets[name]?.rowCount || 0}{' '}
                      {isAr ? 'سجل' : 'rows'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Direct Upload Trigger Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl text-white shadow-sm transition-all hover:scale-105 ${
                isInventoryMode
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              <span>
                {isInventoryMode
                  ? isAr
                    ? 'رفع ملف مخزون وأصناف جديد'
                    : 'Upload Inventory File'
                  : isAr
                  ? 'رفع ملف مبيعات جديد'
                  : 'Upload Sales File'}
              </span>
            </button>

            {/* Toggle Dropzone view */}
            <button
              onClick={() => setShowDropzone(!showDropzone)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
              title="Toggle Dropzone"
            >
              {showDropzone ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
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
                : isInventoryMode
                ? 'border-amber-300 dark:border-amber-700/70 bg-white/80 dark:bg-slate-800/60 hover:border-amber-500 hover:bg-amber-50/30 dark:hover:bg-slate-800/90 shadow-sm'
                : 'border-emerald-300 dark:border-emerald-700/70 bg-white/80 dark:bg-slate-800/60 hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-slate-800/90 shadow-sm'
            }`}
          >
            <div className="max-w-lg mx-auto space-y-4">
              <div
                className={`w-16 h-16 rounded-2xl text-white flex items-center justify-center mx-auto shadow-lg ${
                  isInventoryMode
                    ? 'bg-gradient-to-tr from-amber-500 to-orange-500 shadow-amber-500/25'
                    : 'bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-500/25'
                }`}
              >
                {isLoading ? (
                  <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <UploadCloud className="w-8 h-8" />
                )}
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                  {isLoading
                    ? t.upload.processing
                    : isInventoryMode
                    ? isAr
                      ? 'ارفع ملف الإكسيل الخاص بـ (تحليل المخزون وحركة الأصناف)'
                      : 'Upload Excel File for Inventory & Product Velocity'
                    : isAr
                    ? 'ارفع ملف الإكسيل الخاص بـ (تحليل المبيعات والإيرادات)'
                    : 'Upload Excel File for Sales & Revenue Analysis'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {isInventoryMode
                    ? isAr
                      ? 'ملف المخزون مستقل تماماً عن ملف المبيعات — بعد الرفع ستظهر لك خطوة ربط أعمدة الأصناف والكميات والمخزون'
                      : 'Inventory file is completely separate from Sales file — includes interactive column mapping'
                    : isAr
                    ? 'ملف المبيعات مستقل تماماً عن ملف المخزون — بعد الرفع ستظهر لك خطوة ربط أعمدة المبيعات لاستخراج نقاط القوة والضعف والمقترحات'
                    : 'Sales file is completely separate from Inventory file — includes column mapping & SWOT analysis'}
                </p>
              </div>

              <button
                type="button"
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold shadow-md transition-all hover:scale-105 ${
                  isInventoryMode
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>
                  {isInventoryMode
                    ? isAr
                      ? 'اختر ملف المخزون والأصناف (.xlsx / .csv)'
                      : 'Browse Inventory Excel File'
                    : isAr
                    ? 'اختر ملف المبيعات (.xlsx / .csv)'
                    : 'Browse Sales Excel File'}
                </span>
              </button>
            </div>

            {errorMessage && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-medium max-w-md mx-auto">
                {errorMessage}
              </div>
            )}
          </div>

          {/* Quick Try Samples Section tailored to active mode */}
          <div className="bg-slate-100/70 dark:bg-slate-800/40 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-brand-500" />
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {isInventoryMode
                  ? isAr
                    ? 'أو جرب نموذج بيانات المخزون والأصناف الجاهز:'
                    : 'Or try the sample Inventory & Products dataset:'
                  : isAr
                  ? 'أو جرب أحد نماذج بيانات المبيعات الجاهزة:'
                  : 'Or try a ready-made Sales dataset:'}
              </h4>
            </div>

            {isInventoryMode ? (
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => loadSample('inventory')}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 hover:border-amber-500 hover:shadow-md transition-all text-start group"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {isAr
                          ? 'نموذج المخزون: جرد وحركة الأصناف، الكميات المباعة، والرصيد الحالي'
                          : 'Inventory Template: SKU Velocity, Sold Quantities & Current Stock'}
                      </span>
                      {dir === 'rtl' ? (
                        <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-amber-500 group-hover:-translate-x-1 transition-all" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {isAr
                        ? 'يحتوي على أكواد الأصناف، الأقسام، الكميات المسحوبة، المخزون المتبقي، التكلفة وصافي الربح لاختبار الأصناف الكينج وخطة التوريد.'
                        : 'Includes SKUs, categories, sold quantities, remaining stock, cost, and net profit for King Items & restock testing.'}
                    </p>
                  </div>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => loadSample('sales')}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:shadow-md transition-all text-start group"
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
                        <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:-translate-x-1 transition-all" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {isAr
                        ? 'مبيعات شهرية، أرباح الفروع، فئات المنتجات، العملاء، ونقاط القوة والضعف.'
                        : 'Monthly sales, branch profits, product categories, clients, and SWOT insights.'}
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => loadSample('projects')}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:shadow-md transition-all text-start group"
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
                        <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:-translate-x-1 transition-all" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {isAr
                        ? 'الميزانيات المعتمدة، المصروف الفعلي، نسب الإنجاز، وموقف المشاريع.'
                        : 'Project budgets, actual spending, completion rates, and operations status.'}
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
