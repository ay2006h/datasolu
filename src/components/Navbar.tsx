import React, { useState } from 'react';
import {
  BarChart3,
  Sun,
  Moon,
  FileDown,
  UploadCloud,
  TrendingUp,
  Package,
  LayoutGrid,
  CandlestickChart,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useI18n } from '../locales/i18nContext';
import { AppMode } from '../types';
import { APP_VERSION, APP_LAST_UPDATED, VERSION_CHANGELOG } from '../constants/version';
import { ThemePicker } from './ui/ThemePicker';

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

/** Workspaces registry — add a new analytics type here and it appears in desktop + mobile nav. */
const useWorkspaces = (isAr: boolean) => [
  { mode: 'home' as AppMode, tab: '', label: isAr ? 'الرئيسية' : 'Home', short: isAr ? 'الرئيسية' : 'Home', Icon: LayoutGrid },
  { mode: 'sales' as AppMode, tab: 'dashboard', label: isAr ? 'المبيعات' : 'Sales', short: isAr ? 'المبيعات' : 'Sales', Icon: TrendingUp },
  { mode: 'inventory' as AppMode, tab: 'inventory_main', label: isAr ? 'المخزون' : 'Inventory', short: isAr ? 'المخزون' : 'Inventory', Icon: Package },
  { mode: 'stocks' as AppMode, tab: 'stocks_overview', label: isAr ? 'الأسهم' : 'Stocks', short: isAr ? 'الأسهم' : 'Stocks', Icon: CandlestickChart },
];

export const Navbar: React.FC<NavbarProps> = ({
  appMode,
  setAppMode,
  onUploadClick,
  onExportPdf,
  hasData,
  activeTab,
  setActiveTab,
}) => {
  const { language, toggleLanguage, theme, toggleTheme, t } = useI18n();
  const isAr = language === 'ar';
  const [showVersionModal, setShowVersionModal] = useState<boolean>(false);
  const workspaces = useWorkspaces(isAr);

  const goTo = (mode: AppMode, tab: string) => {
    setAppMode(mode);
    if (tab) setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const salesNavItems = [
    { id: 'dashboard', label: isAr ? 'لوحة المبيعات' : 'Dashboard' },
    { id: 'swot', label: isAr ? 'القوة والضعف' : 'SWOT' },
    { id: 'charts', label: t.nav.charts },
    { id: 'periods', label: t.nav.periodComparison },
    { id: 'builder', label: t.nav.builder },
    { id: 'pivot', label: t.nav.pivot },
    { id: 'table', label: t.nav.dataViewer },
  ];

  const inventoryNavItems = [
    { id: 'inventory_main', label: isAr ? 'تحليل الأصناف والتوريد' : 'Items & Restock' },
    { id: 'pivot', label: t.nav.pivot },
    { id: 'table', label: t.nav.dataViewer },
  ];

  const stocksNavItems = [
    { id: 'stocks_overview', label: isAr ? 'استكشاف الأسهم' : 'Explorer' },
    { id: 'stocks_portfolio', label: isAr ? 'المحفظة' : 'Portfolio' },
    { id: 'stocks_purchased', label: isAr ? 'قرارات الأسهم المشتراة' : 'Holdings Decisions' },
    { id: 'stocks_plans', label: isAr ? 'الخطط والسيناريوهات' : 'Trade Plans' },
    { id: 'stocks_opinions', label: isAr ? 'الرأي الشخصي' : 'Opinions' },
  ];

  const navItems =
    appMode === 'inventory' ? inventoryNavItems : appMode === 'stocks' ? stocksNavItems : salesNavItems;

  const showSubNav = appMode !== 'home' && (hasData || appMode === 'stocks');

  const iconBtn =
    'p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors';

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Logo (back to home) */}
            <div className="flex items-center gap-4 min-w-0">
              <button
                onClick={() => goTo('home', '')}
                className="flex items-center gap-2.5 text-start group flex-shrink-0"
                title={isAr ? 'الرئيسية' : 'Home'}
              >
                <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white font-cairo">
                  DataSolu
                </span>
              </button>

              {/* Desktop workspace switcher */}
              <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                {workspaces.map(({ mode, tab, label, Icon }) => (
                  <button
                    key={mode}
                    onClick={() => goTo(mode, tab)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      appMode === mode
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {appMode !== 'home' && appMode !== 'stocks' && hasData && (
                <button
                  onClick={onUploadClick}
                  className="hidden lg:flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                  title={t.nav.uploadNew}
                >
                  <UploadCloud className="w-4 h-4 text-brand-500" />
                  <span>{isAr ? 'ملف جديد' : 'New file'}</span>
                </button>
              )}

              {appMode !== 'home' && (hasData || appMode === 'stocks') && (
                <button
                  onClick={onExportPdf}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all"
                  title={t.nav.exportPdf}
                >
                  <FileDown className="w-4 h-4" />
                  <span className="hidden sm:inline">PDF</span>
                </button>
              )}

              <ThemePicker />

              <button onClick={toggleLanguage} className={`${iconBtn} text-xs font-bold px-2.5`} title="Language">
                {language === 'ar' ? 'EN' : 'ع'}
              </button>

              <button onClick={toggleTheme} className={iconBtn} title={t.nav.themeToggle}>
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
              </button>
            </div>
          </div>

          {/* Section sub-tabs (scrollable on mobile, fade hints on edges) */}
          {showSubNav && (
            <div className="relative -mx-4 sm:mx-0">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2 px-4 sm:px-0 border-t border-slate-100 dark:border-slate-800/80">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      activeTab === item.id
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="pointer-events-none absolute inset-y-0 start-0 w-6 bg-gradient-to-r rtl:bg-gradient-to-l from-white dark:from-slate-900 to-transparent sm:hidden" />
              <div className="pointer-events-none absolute inset-y-0 end-0 w-6 bg-gradient-to-l rtl:bg-gradient-to-r from-white dark:from-slate-900 to-transparent sm:hidden" />
            </div>
          )}
        </div>
      </header>

      {/* Mobile bottom navigation — switch workspace from anywhere */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-4">
          {workspaces.map(({ mode, tab, short, Icon }) => (
            <button
              key={mode}
              onClick={() => goTo(mode, tab)}
              className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-bold transition-colors ${
                appMode === mode ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{short}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Release changelog (opened from footer version badge) */}
      <VersionModalBridge open={showVersionModal} onClose={() => setShowVersionModal(false)} isAr={isAr} />
      <VersionModalTrigger onOpen={() => setShowVersionModal(true)} />
    </>
  );
};

/** Allows the footer version badge to open the changelog via a window event. */
const VersionModalTrigger: React.FC<{ onOpen: () => void }> = ({ onOpen }) => {
  React.useEffect(() => {
    const h = () => onOpen();
    window.addEventListener('datasolu:open-changelog', h);
    return () => window.removeEventListener('datasolu:open-changelog', h);
  }, [onOpen]);
  return null;
};

const VersionModalBridge: React.FC<{ open: boolean; onClose: () => void; isAr: boolean }> = ({
  open,
  onClose,
  isAr,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isAr ? `سجل التحديثات (${APP_VERSION})` : `Release notes (${APP_VERSION})`}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isAr ? `آخر تحديث: ${APP_LAST_UPDATED}` : `Updated: ${APP_LAST_UPDATED}`}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-3 pe-1">
          {VERSION_CHANGELOG.map((rel, idx) => (
            <div
              key={rel.version}
              className={`p-4 rounded-xl border space-y-2 ${
                idx === 0
                  ? 'bg-brand-50/70 dark:bg-brand-950/30 border-brand-200 dark:border-brand-800'
                  : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-brand-600 text-white font-mono text-xs font-bold">{rel.version}</span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{isAr ? rel.titleAr : rel.titleEn}</h4>
                </div>
                <span className="text-[11px] font-mono text-slate-400">{rel.date}</span>
              </div>
              <ul className="space-y-1">
                {(isAr ? rel.highlightsAr : rel.highlightsEn).map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
