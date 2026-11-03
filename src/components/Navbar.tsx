import React from 'react';
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
} from 'lucide-react';
import { useI18n } from '../locales/i18nContext';
import { AppMode } from '../types';

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

  const navItems = appMode === 'inventory' ? inventoryNavItems : salesNavItems;

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand (Clicks back to Home Mode Selector) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAppMode('home')}
              className="flex items-center gap-3 text-start group"
              title={isAr ? 'العودة للواجهة الرئيسية' : 'Back to Home'}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
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
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Load Sample / Upload when inside a workspace */}
            {appMode !== 'home' && (
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

            {appMode !== 'home' && !hasData && (
              <button
                onClick={onLoadSample}
                className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t.nav.loadSample}</span>
              </button>
            )}

            {appMode !== 'home' && hasData && (
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

        {/* Sub-navigation bar when inside Sales or Inventory mode and data is loaded */}
        {appMode !== 'home' && hasData && (
          <div className="flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 dark:border-slate-800/80">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === item.id
                    ? appMode === 'inventory'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
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
    </header>
  );
};
