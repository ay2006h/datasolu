import React, { useState } from 'react';
import {
  BarChart3,
  Globe,
  Sun,
  Moon,
  FileDown,
  UploadCloud,
  Sparkles,
  TrendingUp,
  Package,
  LayoutGrid,
  CandlestickChart,
  Tag,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useI18n } from '../locales/i18nContext';
import { AppMode } from '../types';
import { APP_VERSION, APP_LAST_UPDATED, VERSION_CHANGELOG } from '../constants/version';

interface NavbarProps {
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  onUploadClick: () => void;
  onLoadSample: () => void;
  onExportPdf: () => void;
  hasData: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  appMode,
  setAppMode,
  onUploadClick,
  onLoadSample,
  onExportPdf,
  hasData,
  activeTab,
  setActiveTab,
}) => {
  const { language, toggleLanguage, theme, toggleTheme, t } = useI18n();
  const isAr = language === 'ar';
  const [showVersionModal, setShowVersionModal] = useState<boolean>(false);

  const salesNavItems = [
    { id: 'dashboard', label: isAr ? 'لوحة المبيعات الشاملة' : 'Sales Dashboard' },
    { id: 'swot', label: isAr ? 'نقاط القوة والضعف والمقترحات' : 'SWOT & Proposals' },
    { id: 'charts', label: t.nav.charts },
    { id: 'periods', label: t.nav.periodComparison },
    { id: 'builder', label: t.nav.builder },
    { id: 'pivot', label: t.nav.pivot },
    { id: 'table', label: t.nav.dataViewer },
  ];

  const inventoryNavItems = [
    { id: 'inventory_main', label: isAr ? 'تحليل الأصناف والكينج والتوريد' : 'Velocity, King & Restock' },
    { id: 'pivot', label: t.nav.pivot },
    { id: 'table', label: t.nav.dataViewer },
  ];

  const stocksNavItems = [
    { id: 'stocks_overview', label: isAr ? 'استكشاف وفحص الأسهم' : 'Explorer & Screener' },
    { id: 'stocks_portfolio', label: isAr ? 'المحفظة والشراء والبيع' : 'Portfolio & Buy/Sell' },
    { id: 'stocks_purchased', label: isAr ? 'توصيات الأسهم المشتراة' : 'Purchased Stock Decisions' },
    { id: 'stocks_plans', label: isAr ? 'الخطط المحتملة والسيناريوهات' : 'Trade Plans & Scenarios' },
    { id: 'stocks_opinions', label: isAr ? 'الرأي الشخصي والرؤى' : 'Personal Opinions & Visions' },
  ];

  const navItems =
    appMode === 'inventory'
      ? inventoryNavItems
      : appMode === 'stocks'
      ? stocksNavItems
      : salesNavItems;

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand (Clicks back to Home Mode Selector) */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setAppMode('home')}
              className="flex items-center gap-3 text-start group"
              title={isAr ? 'العودة للواجهة الرئيسية' : 'Back to Home'}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white font-cairo">
                    DataSolu
                  </span>
                  <span className="text-[10px] uppercase font-bold bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-full border border-brand-200 dark:border-brand-800">
                    BI Pro
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                  {t.app.title}
                </p>
              </div>
            </button>

            {/* Site Version Badge (يتحدث مع كل تعديل وتحديث للموقع) */}
            <button
              onClick={() => setShowVersionModal(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-600/10 hover:bg-indigo-600/20 dark:bg-indigo-500/20 dark:hover:bg-indigo-500/30 text-indigo-700 dark:text-indigo-300 border border-indigo-400/40 text-[11px] font-black transition-all"
              title={
                isAr
                  ? `إصدار الموقع الحالي ${APP_VERSION} — اضغط لعرض سجل التحديثات`
                  : `Current Site Version ${APP_VERSION} — Click for changelog`
              }
            >
              <Tag className="w-3 h-3 text-indigo-500" />
              <span>{isAr ? `إصدار ${APP_VERSION}` : APP_VERSION}</span>
            </button>

            {/* Primary Workspace Switcher Pills (Home / Sales Analysis / Inventory Analysis) */}
            <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 ms-2">
              <button
                onClick={() => setAppMode('home')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  appMode === 'home'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>{isAr ? 'الرئيسية' : 'Home'}</span>
              </button>

              <button
                onClick={() => {
                  setAppMode('sales');
                  setActiveTab('dashboard');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                  appMode === 'sales'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{isAr ? 'تحليل المبيعات' : 'Sales Analysis'}</span>
              </button>

              <button
                onClick={() => {
                  setAppMode('inventory');
                  setActiveTab('inventory_main');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                  appMode === 'inventory'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-amber-500'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>{isAr ? 'تحليل المخزون والأصناف' : 'Inventory Analysis'}</span>
              </button>

              <button
                onClick={() => {
                  setAppMode('stocks');
                  setActiveTab('stocks_overview');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                  appMode === 'stocks'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-indigo-500'
                }`}
              >
                <CandlestickChart className="w-3.5 h-3.5" />
                <span>{isAr ? 'تحليل البورصة والأسهم' : 'Stock Market'}</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Load Sample / Upload when inside a workspace */}
            {appMode !== 'home' && appMode !== 'stocks' && (
              <button
                onClick={onUploadClick}
                className="hidden lg:flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                title={t.nav.uploadNew}
              >
                <UploadCloud className="w-4 h-4 text-brand-500" />
                <span>
                  {appMode === 'inventory'
                    ? isAr
                      ? 'رفع ملف مخزون'
                      : 'Upload Inventory'
                    : isAr
                    ? 'رفع ملف مبيعات'
                    : 'Upload Sales'}
                </span>
              </button>
            )}

            {/* Local-Only Storage Guarantee Pill */}
            <div
              className="hidden xl:flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              title={
                isAr
                  ? 'جميع البيانات تُحفظ داخلياً على جهازك فقط — لا علاقة لنا ببياناتك'
                  : 'All data saved locally on your device only'
              }
            >
              <span>🔒 {isAr ? 'حفظ داخلي فقط — لا علاقة لنا ببياناتك' : '100% Local Storage Only'}</span>
            </div>

            {appMode !== 'home' && (hasData || appMode === 'stocks') && (
              <button
                onClick={onExportPdf}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
                title={t.nav.exportPdf}
              >
                <FileDown className="w-4 h-4" />
                <span className="hidden sm:inline">{t.nav.exportPdf}</span>
              </button>
            )}

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all"
              title="Change Language"
            >
              <Globe className="w-4 h-4 text-brand-500" />
              <span>{language === 'ar' ? 'English' : 'عربي'}</span>
            </button>

            {/* Dark/Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title={t.nav.themeToggle}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>
          </div>
        </div>

        {/* Sub-navigation bar when inside Sales, Inventory or Stocks mode */}
        {appMode !== 'home' && (hasData || appMode === 'stocks') && (
          <div className="flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 dark:border-slate-800/80">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === item.id
                    ? appMode === 'inventory'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : appMode === 'stocks'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Site Version & Release Changelog Modal */}
      {showVersionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {isAr
                        ? `سجل إصدارات وتحديثات المنصة (${APP_VERSION})`
                        : `Platform Version & Release Log (${APP_VERSION})`}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black">
                      {isAr ? `آخر تحديث: ${APP_LAST_UPDATED}` : `Updated: ${APP_LAST_UPDATED}`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isAr
                      ? 'يتم رفع رقم الإصدار تلقائياً مع كل تطوير أو إضافة ميزة جديدة في الموقع'
                      : 'Version number increments upward with every platform update'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowVersionModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pe-1">
              {VERSION_CHANGELOG.map((rel, idx) => (
                <div
                  key={rel.version}
                  className={`p-4 rounded-2xl border ${
                    idx === 0
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-700'
                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700'
                  } space-y-2`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-indigo-600 text-white font-mono text-xs font-black">
                        {rel.version}
                      </span>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                        {isAr ? rel.titleAr : rel.titleEn}
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{rel.date}</span>
                  </div>
                  <ul className="space-y-1.5 pt-1">
                    {(isAr ? rel.highlightsAr : rel.highlightsEn).map((h, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end">
              <button
                onClick={() => setShowVersionModal(false)}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-black"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
