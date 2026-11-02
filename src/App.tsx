import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { FileUpload } from './components/FileUpload';
import { KpiCards } from './components/KpiCards';
import { BusinessStatusOverview } from './components/BusinessStatusOverview';
import { ChartsSection } from './components/ChartsSection';
import { PeriodComparison } from './components/PeriodComparison';
import { CustomChartBuilder } from './components/CustomChartBuilder';
import { SmartInsightsCard } from './components/SmartInsightsCard';
import { DataTable } from './components/DataTable';
import { PivotTable } from './components/PivotTable';
import { ProductInventoryAnalysis } from './components/ProductInventoryAnalysis';
import { useI18n } from './locales/i18nContext';
import { WorkbookData } from './types';
import { computeKpiMetrics, computeBusinessStatus } from './utils/analyticsEngine';
import { generateBusinessInsights } from './utils/insightsGenerator';
import { getSampleSalesData } from './utils/sampleData';
import { exportDashboardToPdf } from './utils/pdfExporter';
import { Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const { language, t } = useI18n();

  // Initialize with sample sales dataset
  const [workbook, setWorkbook] = useState<WorkbookData | null>(() => getSampleSalesData('ar'));
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  // Update sample data on language toggle if using default sample
  useEffect(() => {
    if (workbook && (workbook.fileName.includes('sales_') || workbook.fileName.includes('بيانات_المبيعات'))) {
      setWorkbook(getSampleSalesData(language));
    }
  }, [language]);

  const activeSheetData = useMemo(() => {
    if (!workbook || !workbook.activeSheet) return null;
    return workbook.sheets[workbook.activeSheet] || null;
  }, [workbook]);

  // Dynamic calculations
  const kpis = useMemo(() => {
    if (!activeSheetData) return [];
    return computeKpiMetrics(activeSheetData, language);
  }, [activeSheetData, language]);

  const businessStatus = useMemo(() => {
    if (!activeSheetData) {
      return {
        overallHealthScore: 80,
        statusCounts: [],
        targetAchievedPercent: 80,
        totalVolume: 0,
        completionRate: 0,
      };
    }
    return computeBusinessStatus(activeSheetData, language);
  }, [activeSheetData, language]);

  const insights = useMemo(() => {
    if (!activeSheetData) return [];
    return generateBusinessInsights(activeSheetData, language);
  }, [activeSheetData, language]);

  const handleSheetChange = (sheetName: string) => {
    if (!workbook) return;
    setWorkbook({
      ...workbook,
      activeSheet: sheetName,
    });
  };

  const handleExportPdf = async () => {
    try {
      setIsExporting(true);
      setExportMessage(t.export.generatingPdf);
      await exportDashboardToPdf('dashboard-export-area', `${workbook?.fileName || 'business'}_analytics_report.pdf`);
      setExportMessage(t.export.success);
      setTimeout(() => setExportMessage(null), 3500);
    } catch (error) {
      console.error(error);
      setExportMessage(language === 'ar' ? 'فشل تصدير التقرير، يرجى المحاولة لاحقاً' : 'Export failed, please try again');
      setTimeout(() => setExportMessage(null), 3500);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200 flex flex-col font-cairo">
      {/* Top Navigation */}
      <Navbar
        onUploadClick={() => {
          document.getElementById('global-excel-file-input')?.click();
        }}
        onLoadSample={() => setWorkbook(getSampleSalesData(language))}
        onExportPdf={handleExportPdf}
        hasData={!!workbook}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Export status notification banner */}
      {exportMessage && (
        <div className="sticky top-16 z-40 bg-brand-600 text-white text-xs font-semibold py-2.5 px-4 text-center shadow-md flex items-center justify-center gap-2 transition-all">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>{exportMessage}</span>
        </div>
      )}

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Upload & Sheet Info Banner */}
        <section>
          <FileUpload
            onDataLoaded={(data) => {
              setWorkbook(data);
              setActiveTab('dashboard');
            }}
            workbook={workbook}
            onSheetChange={handleSheetChange}
          />
        </section>

        {activeSheetData && (
          <div id="dashboard-export-area" className="space-y-8">
            {/* 1. Executive Summary KPIs */}
            {(activeTab === 'dashboard' || activeTab === 'charts') && (
              <section className="space-y-3">
                <KpiCards metrics={kpis} />
              </section>
            )}

            {/* 2. Best-Selling Products, Movement Velocity, King Items & Restock Analysis */}
            {(activeTab === 'dashboard' || activeTab === 'products') && (
              <section>
                <ProductInventoryAnalysis sheet={activeSheetData} />
              </section>
            )}

            {/* 3. Business Status & Health Overview */}
            {(activeTab === 'dashboard' || activeTab === 'charts') && (
              <section>
                <BusinessStatusOverview statusData={businessStatus} />
              </section>
            )}

            {/* 3. Time Period Comparison (Days, Months, Quarters, Years) */}
            {(activeTab === 'dashboard' || activeTab === 'periods' || activeTab === 'charts') && (
              <section>
                <PeriodComparison sheet={activeSheetData} />
              </section>
            )}

            {/* 4. Visual Analytics & Charts Section */}
            {(activeTab === 'dashboard' || activeTab === 'charts') && (
              <section>
                <ChartsSection sheet={activeSheetData} />
              </section>
            )}

            {/* 5. Executive Automated Insights */}
            {(activeTab === 'dashboard' || activeTab === 'insights') && (
              <section>
                <SmartInsightsCard insights={insights} />
              </section>
            )}

            {/* 6. Custom Chart Builder */}
            {(activeTab === 'dashboard' || activeTab === 'builder') && (
              <section>
                <CustomChartBuilder sheet={activeSheetData} />
              </section>
            )}

            {/* 7. Pivot Table */}
            {(activeTab === 'dashboard' || activeTab === 'pivot') && (
              <section>
                <PivotTable sheet={activeSheetData} />
              </section>
            )}

            {/* 8. Detailed Data Table */}
            {(activeTab === 'dashboard' || activeTab === 'table') && (
              <section>
                <DataTable sheet={activeSheetData} />
              </section>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-6 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-200">DataSolu</span>
            <span>-</span>
            <span>{t.app.tagline}</span>
          </div>
          <div>
            <span>{language === 'ar' ? 'جميع البيانات تعالج محلياً داخل جهازك بأمان 100%' : 'All data processed locally & securely'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default App;
