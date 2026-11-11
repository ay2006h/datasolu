import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import { useI18n } from '../locales/i18nContext';
import {
  StockItem,
  StockTransaction,
  StockTradePlan,
  PersonalStockOpinion,
  MarketRegion,
  SitePickCategory,
  PersonalStance,
  AnalyticalSignal,
} from '../types';
import {
  computePortfolioSummary,
  evaluateStockAnalyticalProfile,
} from '../utils/stockMarketData';
import {
  fetchLiveStockMarketData,
  REAL_MARKET_TICKER_CATALOG,
  PopularTickerInfo,
} from '../utils/liveStockFetcher';
import {
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Star,
  Wallet,
  Compass,
  BookOpen,
  Lightbulb,
  Save,
  Download,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  Target,
  Activity,
  Search,
  RefreshCw,
  FileSpreadsheet,
  Award,
  MessageSquare,
  Scale,
  Lock,
  Radio,
  Sparkles,
  History,
  X,
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const STORAGE_KEY = 'datasolu_stock_internal_v2';
const LEGACY_STORAGE_KEY = 'datasolu_stock_platform_v1';

export interface InternalScanLogEntry {
  id: string;
  timestamp: string;
  symbol: string;
  stockNameAr: string;
  oldPrice?: number;
  newPrice: number;
  changePercent: number;
  oldSignal?: AnalyticalSignal;
  newSignal: AnalyticalSignal;
  newScore: number;
  source: 'live_market' | 'manual_update';
}

interface StockMarketAnalysisProps {
  activeSubTab?: string;
  setActiveSubTab?: (tab: string) => void;
}

export const StockMarketAnalysis: React.FC<StockMarketAnalysisProps> = ({
  activeSubTab = 'stocks_overview',
  setActiveSubTab,
}) => {
  const { language, theme } = useI18n();
  const isAr = language === 'ar';
  const isDark = theme === 'dark';

  // Remove legacy v1 mock storage if present so the platform starts 100% clean
  useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  // Internal tab state synced with prop
  const [currentTab, setCurrentTab] = useState<string>(activeSubTab || 'stocks_overview');
  useEffect(() => {
    if (activeSubTab && activeSubTab.startsWith('stocks_')) {
      setCurrentTab(activeSubTab);
    }
  }, [activeSubTab]);

  const handleTabSwitch = (tabId: string) => {
    setCurrentTab(tabId);
    if (setActiveSubTab) setActiveSubTab(tabId);
  };

  // =========================================================================
  // PERSISTENT INTERNAL STATE (Starts 100% EMPTY — Only user-added/scanned data)
  // =========================================================================
  const [stocks, setStocks] = useState<StockItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.stocks)) return parsed.stocks;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [cashBalance, setCashBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.cashBalance === 'number') return parsed.cashBalance;
      }
    } catch (e) {
      console.error(e);
    }
    return 0;
  });

  const [transactions, setTransactions] = useState<StockTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.transactions)) return parsed.transactions;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [tradePlans, setTradePlans] = useState<StockTradePlan[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.tradePlans)) return parsed.tradePlans;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [personalOpinions, setPersonalOpinions] = useState<PersonalStockOpinion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.personalOpinions)) return parsed.personalOpinions;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [generalJournal, setGeneralJournal] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.generalJournal === 'string') return parsed.generalJournal;
      }
    } catch (e) {
      console.error(e);
    }
    return '';
  });

  const [scanLogs, setScanLogs] = useState<InternalScanLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.scanLogs)) return parsed.scanLogs;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [lastSavedAt, setLastSavedAt] = useState<string>('');
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [showFullDisclaimerModal, setShowFullDisclaimerModal] = useState<boolean>(false);
  const [confirmClearModalOpen, setConfirmClearModalOpen] = useState<boolean>(false);

  // Live Market Scanner & Auto-Monitor states
  const [liveTickerInput, setLiveTickerInput] = useState<string>('');
  const [liveMarketSelect, setLiveMarketSelect] = useState<MarketRegion>('saudi');
  const [isScanningMarket, setIsScanningMarket] = useState<boolean>(false);
  const [scanningProgressText, setScanningProgressText] = useState<string>('');
  const [autoMonitorEnabled, setAutoMonitorEnabled] = useState<boolean>(false);
  const [showCatalogModal, setShowCatalogModal] = useState<boolean>(false);

  // Auto-save to internal localStorage whenever any state changes
  useEffect(() => {
    try {
      const payload = {
        stocks,
        cashBalance,
        transactions,
        tradePlans,
        personalOpinions,
        generalJournal,
        scanLogs,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setLastSavedAt(
        new Date().toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    } catch (e) {
      console.error('Failed to save stock data locally:', e);
    }
  }, [stocks, cashBalance, transactions, tradePlans, personalOpinions, generalJournal, scanLogs, isAr]);

  const showToast = useCallback((msg: string) => {
    setStatusBanner(msg);
    setTimeout(() => setStatusBanner(null), 4000);
  }, []);

  // =========================================================================
  // CLEAR ALL CURRENT DATA (زر مسح جميع البيانات الحالية)
  // =========================================================================
  const handleClearAllData = () => {
    setStocks([]);
    setCashBalance(0);
    setTransactions([]);
    setTradePlans([]);
    setPersonalOpinions([]);
    setGeneralJournal('');
    setScanLogs([]);
    setAutoMonitorEnabled(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
    setConfirmClearModalOpen(false);
    showToast(
      isAr
        ? 'تم مسح جميع البيانات الحالية وتفريغ السجل الداخلي بالكامل'
        : 'All internal data cleared successfully'
    );
  };

  // Delete a single stock
  const handleDeleteSingleStock = (stockId: string, name: string) => {
    setStocks((prev) => prev.filter((s) => s.id !== stockId));
    showToast(isAr ? `تم حذف السهم (${name}) من قائمتك الداخلية` : `Removed ${name}`);
  };

  // =========================================================================
  // LIVE MARKET FETCH, SCAN & AUTO-MONITOR ENGINE
  // =========================================================================
  const handleFetchSingleLiveStock = async (
    rawSymbol: string,
    market: MarketRegion,
    catalogInfo?: PopularTickerInfo
  ) => {
    if (!rawSymbol.trim()) return;
    setIsScanningMarket(true);
    setScanningProgressText(
      isAr ? `جاري فحص السعر الفعلي والمؤشرات لسهم (${rawSymbol})...` : `Scanning ${rawSymbol}...`
    );

    try {
      const existing = stocks.find(
        (s) => s.symbol.toUpperCase() === rawSymbol.trim().toUpperCase()
      );
      const liveStock = await fetchLiveStockMarketData(rawSymbol, market, {
        ...catalogInfo,
        ...existing,
      });

      setStocks((prev) => {
        const idx = prev.findIndex(
          (item) => item.symbol.toUpperCase() === liveStock.symbol.toUpperCase()
        );
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = liveStock;
          return updated;
        }
        return [liveStock, ...prev];
      });

      setSelectedStockId(liveStock.id);

      // Record in internal scan log
      const logEntry: InternalScanLogEntry = {
        id: `scan-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        symbol: liveStock.symbol,
        stockNameAr: liveStock.nameAr,
        oldPrice: existing?.currentPrice,
        newPrice: liveStock.currentPrice,
        changePercent: liveStock.changePercent,
        oldSignal: existing?.analyticalSignal,
        newSignal: liveStock.analyticalSignal,
        newScore: liveStock.siteAnalyticalScore,
        source: 'live_market',
      };
      setScanLogs((prev) => [logEntry, ...prev.slice(0, 49)]);

      setLiveTickerInput('');
      showToast(
        isAr
          ? `تم فحص وتحديث السعر الفعلي لسهم (${liveStock.nameAr}: ${liveStock.currentPrice} ${liveStock.currency}) وتحديث توصيته الاسترشادية وحفظه داخلياً`
          : `Live scan complete for ${liveStock.symbol}: ${liveStock.currentPrice} ${liveStock.currency}`
      );
    } catch (err: any) {
      showToast(
        err?.message ||
          (isAr
            ? 'تعذر الاتصال بمزود أسعار السوق حالياً، يمكنك المحاولة مجدداً أو إدخال السهم يدوياً'
            : 'Could not fetch live market data right now.')
      );
    } finally {
      setIsScanningMarket(false);
      setScanningProgressText('');
    }
  };

  // Scan & Update ALL stocks currently in the user's list from live markets
  const handleScanAllStocksLive = useCallback(async () => {
    if (stocks.length === 0 || isScanningMarket) return;
    setIsScanningMarket(true);

    const updatedStocks = [...stocks];
    const newLogs: InternalScanLogEntry[] = [];
    let successCount = 0;

    for (let i = 0; i < updatedStocks.length; i++) {
      const st = updatedStocks[i];
      setScanningProgressText(
        isAr
          ? `جاري فحص الأسعار الفعلية وتحديث التوصيات (${i + 1}/${updatedStocks.length}): ${st.nameAr}...`
          : `Scanning live prices (${i + 1}/${updatedStocks.length}): ${st.symbol}...`
      );
      try {
        const refreshed = await fetchLiveStockMarketData(st.symbol, st.market, st);
        updatedStocks[i] = refreshed;
        successCount++;

        newLogs.push({
          id: `scan-${Date.now()}-${i}`,
          timestamp: new Date().toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          symbol: refreshed.symbol,
          stockNameAr: refreshed.nameAr,
          oldPrice: st.currentPrice,
          newPrice: refreshed.currentPrice,
          changePercent: refreshed.changePercent,
          oldSignal: st.analyticalSignal,
          newSignal: refreshed.analyticalSignal,
          newScore: refreshed.siteAnalyticalScore,
          source: 'live_market',
        });
      } catch {
        // Keep existing stock data if individual ticker scan fails
      }
    }

    setStocks(updatedStocks);
    if (newLogs.length > 0) {
      setScanLogs((prev) => [...newLogs, ...prev].slice(0, 50));
    }
    setIsScanningMarket(false);
    setScanningProgressText('');

    if (successCount > 0) {
      showToast(
        isAr
          ? `تم فحص وتحديث الأسعار الفعلية والتوصيات الاسترشادية لـ (${successCount}) أسهم وتسجيلها داخلياً`
          : `Updated live prices & analytical signals for ${successCount} stocks`
      );
    } else {
      showToast(
        isAr
          ? 'تعذر تحديث الأسعار تلقائياً لبعض الرموز، تأكد من كتابة رمز السهم الصحيح بالسوق'
          : 'Could not refresh live prices for the current symbols'
      );
    }
  }, [stocks, isScanningMarket, isAr, showToast]);

  // Auto-Monitor interval (runs every 60 seconds when enabled)
  useEffect(() => {
    if (!autoMonitorEnabled || stocks.length === 0) return;
    const timer = setInterval(() => {
      handleScanAllStocksLive();
    }, 60000);
    return () => clearInterval(timer);
  }, [autoMonitorEnabled, stocks.length, handleScanAllStocksLive]);

  // =========================================================================
  // FILTERS & SELECTION STATES
  // =========================================================================
  const [selectedMarket, setSelectedMarket] = useState<MarketRegion | 'all'>('all');
  const [selectedPickCategory, setSelectedPickCategory] = useState<
    SitePickCategory | 'all' | 'watchlist'
  >('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStockId, setSelectedStockId] = useState<string>('');

  const selectedStock = useMemo(
    () => stocks.find((s) => s.id === selectedStockId) || stocks[0] || null,
    [stocks, selectedStockId]
  );

  // Portfolio Summary Calculation
  const portfolio = useMemo(
    () => computePortfolioSummary(stocks, transactions, cashBalance),
    [stocks, transactions, cashBalance]
  );

  // Filtered stocks for screener
  const filteredStocks = useMemo(() => {
    return stocks.filter((s) => {
      if (selectedMarket !== 'all' && s.market !== selectedMarket) return false;
      if (selectedPickCategory === 'watchlist' && !s.isWatchlisted) return false;
      if (
        selectedPickCategory !== 'all' &&
        selectedPickCategory !== 'watchlist' &&
        s.sitePickCategory !== selectedPickCategory
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSymbol = s.symbol.toLowerCase().includes(q);
        const matchAr = s.nameAr.toLowerCase().includes(q);
        const matchEn = s.nameEn.toLowerCase().includes(q);
        const matchSector =
          s.sectorAr.toLowerCase().includes(q) || s.sectorEn.toLowerCase().includes(q);
        if (!matchSymbol && !matchAr && !matchEn && !matchSector) return false;
      }
      return true;
    });
  }, [stocks, selectedMarket, selectedPickCategory, searchQuery]);

  // Site Favorite Picks
  const siteFavoriteStocks = useMemo(() => {
    return stocks.filter((s) => {
      if (!s.isSiteFavorite) return false;
      if (selectedMarket !== 'all' && s.market !== selectedMarket) return false;
      return true;
    });
  }, [stocks, selectedMarket]);

  // =========================================================================
  // BUY / SELL MODAL & TRADE EXECUTION STATE
  // =========================================================================
  const [tradeModalOpen, setTradeModalOpen] = useState<boolean>(false);
  const [tradeForm, setTradeForm] = useState<{
    stockId: string;
    type: 'buy' | 'sell';
    quantity: number;
    price: number;
    commission: number;
    strategyTag: string;
    notes: string;
    disclaimerAccepted: boolean;
  }>({
    stockId: '',
    type: 'buy',
    quantity: 50,
    price: 50,
    commission: 10,
    strategyTag: 'استثمار متوسط الأجل',
    notes: '',
    disclaimerAccepted: true,
  });

  const openTradeModal = (stock: StockItem, type: 'buy' | 'sell') => {
    const existingHolding = portfolio.holdings.find((h) => h.stockId === stock.id);
    setTradeForm({
      stockId: stock.id,
      type,
      quantity: type === 'sell' && existingHolding ? existingHolding.quantity : 50,
      price: stock.currentPrice,
      commission: 10,
      strategyTag: type === 'buy' ? 'شراء وتجميع' : 'جني أرباح / تخفيف',
      notes: '',
      disclaimerAccepted: true,
    });
    setTradeModalOpen(true);
  };

  const handleExecuteTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeForm.disclaimerAccepted) {
      showToast(
        isAr
          ? 'يرجى الموافقة على إقرار إخلاء المسؤولية قبل تسجيل العملية'
          : 'Please acknowledge the disclaimer before recording the transaction'
      );
      return;
    }
    const targetStock = stocks.find((s) => s.id === tradeForm.stockId) || stocks[0];
    if (!targetStock || tradeForm.quantity <= 0 || tradeForm.price <= 0) return;

    const existingHolding = portfolio.holdings.find((h) => h.stockId === targetStock.id);

    if (tradeForm.type === 'sell') {
      if (!existingHolding || existingHolding.quantity < tradeForm.quantity) {
        showToast(
          isAr
            ? `الكمية المتاحة للبيع في محفظتك من (${targetStock.nameAr}) هي ${existingHolding?.quantity || 0} سهم فقط`
            : `Insufficient shares to sell. Available: ${existingHolding?.quantity || 0}`
        );
        return;
      }
    }

    const gross = tradeForm.quantity * tradeForm.price;
    const totalAmount =
      tradeForm.type === 'buy' ? gross + tradeForm.commission : gross - tradeForm.commission;

    const realizedPnL =
      tradeForm.type === 'sell' && existingHolding
        ? totalAmount - existingHolding.avgCostPrice * tradeForm.quantity
        : undefined;

    const newTx: StockTransaction = {
      id: `tx-${Date.now()}`,
      stockId: targetStock.id,
      symbol: targetStock.symbol,
      stockNameAr: targetStock.nameAr,
      stockNameEn: targetStock.nameEn,
      market: targetStock.market,
      currency: targetStock.currency,
      type: tradeForm.type,
      quantity: Number(tradeForm.quantity),
      price: Number(tradeForm.price),
      commission: Number(tradeForm.commission),
      totalAmount,
      realizedPnL,
      date: new Date().toISOString().slice(0, 10),
      strategyTag: tradeForm.strategyTag,
      notes: tradeForm.notes,
    };

    setTransactions((prev) => [newTx, ...prev]);

    if (tradeForm.type === 'buy') {
      setCashBalance((prev) => Math.max(0, Number((prev - totalAmount).toFixed(2))));
    } else {
      setCashBalance((prev) => Number((prev + totalAmount).toFixed(2)));
    }

    setTradeModalOpen(false);
    showToast(
      isAr
        ? `تم تسجيل عملية ${tradeForm.type === 'buy' ? 'شراء' : 'بيع'} (${tradeForm.quantity} سهم - ${targetStock.nameAr}) وحفظها داخلياً بنجاح`
        : `Recorded ${tradeForm.type.toUpperCase()} of ${tradeForm.quantity} shares (${targetStock.symbol})`
    );
  };

  // =========================================================================
  // ADD CUSTOM STOCK MODAL STATE
  // =========================================================================
  const [addStockModalOpen, setAddStockModalOpen] = useState<boolean>(false);
  const [newStockForm, setNewStockForm] = useState({
    symbol: '',
    nameAr: '',
    nameEn: '',
    market: 'saudi' as MarketRegion,
    currency: 'SAR',
    sectorAr: 'قطاع عام',
    currentPrice: 50,
    estimatedFairValue: 58,
    support1: 47,
    resistance1: 55,
    peRatio: 15,
    roePercent: 18,
    dividendYieldPercent: 3.5,
    rsi14: 52,
    isSiteFavorite: true,
    siteRationaleAr: '',
  });

  const handleAddCustomStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStockForm.symbol.trim() || !newStockForm.nameAr.trim()) return;

    const evalProfile = evaluateStockAnalyticalProfile({
      currentPrice: Number(newStockForm.currentPrice),
      estimatedFairValue: Number(newStockForm.estimatedFairValue),
      rsi14: Number(newStockForm.rsi14),
      ma50: Number(newStockForm.currentPrice) * 0.97,
      ma200: Number(newStockForm.currentPrice) * 0.94,
      peRatio: Number(newStockForm.peRatio),
      roePercent: Number(newStockForm.roePercent),
      dividendYieldPercent: Number(newStockForm.dividendYieldPercent),
    });

    const p = Number(newStockForm.currentPrice);
    const created: StockItem = {
      id: `custom-${Date.now()}`,
      symbol: newStockForm.symbol.toUpperCase().trim(),
      nameAr: newStockForm.nameAr.trim(),
      nameEn: newStockForm.nameEn.trim() || newStockForm.nameAr.trim(),
      market: newStockForm.market,
      currency: newStockForm.currency,
      sectorAr: newStockForm.sectorAr,
      sectorEn: newStockForm.sectorAr,
      currentPrice: p,
      previousClose: Number((p * 0.99).toFixed(2)),
      changePercent: 1.0,
      high52W: Number((p * 1.18).toFixed(2)),
      low52W: Number((p * 0.82).toFixed(2)),
      rsi14: Number(newStockForm.rsi14),
      ma50: Number((p * 0.97).toFixed(2)),
      ma200: Number((p * 0.93).toFixed(2)),
      support1: Number(newStockForm.support1),
      support2: Number((Number(newStockForm.support1) * 0.95).toFixed(2)),
      resistance1: Number(newStockForm.resistance1),
      resistance2: Number((Number(newStockForm.resistance1) * 1.06).toFixed(2)),
      volumeTrend: 'normal',
      peRatio: Number(newStockForm.peRatio),
      pbRatio: 2.2,
      roePercent: Number(newStockForm.roePercent),
      dividendYieldPercent: Number(newStockForm.dividendYieldPercent),
      estimatedFairValue: Number(newStockForm.estimatedFairValue),
      isSiteFavorite: newStockForm.isSiteFavorite,
      sitePickCategory: evalProfile.pickCategory,
      siteAnalyticalScore: evalProfile.score,
      analyticalSignal: evalProfile.signal,
      siteRationaleAr:
        newStockForm.siteRationaleAr.trim() ||
        'سهم مضاف ومخصص للمتابعة الفنية والمالية الاسترشادية بناءً على مستويات الدعم والقيمة العادلة المحددة.',
      siteRationaleEn:
        newStockForm.siteRationaleAr.trim() ||
        'Custom added stock tracked with user-defined support, resistance, and fair value metrics.',
      priceHistory: [
        Number((p * 0.96).toFixed(2)),
        Number((p * 0.97).toFixed(2)),
        Number((p * 0.98).toFixed(2)),
        Number((p * 0.99).toFixed(2)),
        p,
      ],
      isWatchlisted: true,
    };

    setStocks((prev) => [created, ...prev]);
    setSelectedStockId(created.id);
    setAddStockModalOpen(false);
    showToast(
      isAr
        ? `تمت إضافة السهم (${created.nameAr}) وحفظه في السجل الداخلي بنجاح`
        : `Added stock ${created.symbol}`
    );
  };

  // =========================================================================
  // TRADE PLAN BUILDER STATE
  // =========================================================================
  const [planForm, setPlanForm] = useState<{
    stockId: string;
    title: string;
    timeframe: 'intraday' | 'short_term' | 'swing' | 'long_term';
    entryPrice: number;
    stopLossPrice: number;
    target1Price: number;
    target2Price: number;
    target3Price: number;
    plannedCapital: number;
    riskPercentOfCapital: number;
    bullScenario: string;
    baseScenario: string;
    bearScenario: string;
  }>({
    stockId: '',
    title: 'خطة تداول استرشادية',
    timeframe: 'swing',
    entryPrice: 50,
    stopLossPrice: 47,
    target1Price: 54,
    target2Price: 58,
    target3Price: 62,
    plannedCapital: 20000,
    riskPercentOfCapital: 1.5,
    bullScenario:
      'اختراق المقاومة الأولى بأحجام تداول مرتفعة يدعم الوصول للهدف الثاني مع رفع الوقف لنقطة الدخول.',
    baseScenario: 'التحرك في القناة الصاعدة وتحقيق الهدف الأول وجني 50% من الكمية.',
    bearScenario:
      'الإغلاق اليومي أسفل وقف الخسارة يلغي السيناريو الصاعد مؤقتاً ويتم الخروج لحماية رأس المال.',
  });

  const handlePlanStockSelect = (stockId: string) => {
    const st = stocks.find((s) => s.id === stockId);
    if (!st) return;
    setPlanForm((prev) => ({
      ...prev,
      stockId: st.id,
      title: isAr ? `خطة تداول استرشادية لسهم ${st.nameAr}` : `Trade Plan for ${st.symbol}`,
      entryPrice: st.currentPrice,
      stopLossPrice: st.support1 || Number((st.currentPrice * 0.95).toFixed(2)),
      target1Price: st.resistance1 || Number((st.currentPrice * 1.06).toFixed(2)),
      target2Price: st.estimatedFairValue || Number((st.currentPrice * 1.12).toFixed(2)),
      target3Price: st.resistance2 || Number((st.currentPrice * 1.18).toFixed(2)),
    }));
  };

  useEffect(() => {
    if (stocks.length > 0 && !planForm.stockId) {
      handlePlanStockSelect(stocks[0].id);
    }
  }, [stocks.length]);

  const planMetrics = useMemo(() => {
    const riskPerShare = Math.max(0.01, planForm.entryPrice - planForm.stopLossPrice);
    const rewardPerShareT2 = Math.max(0, planForm.target2Price - planForm.entryPrice);
    const rrRatio = riskPerShare > 0 ? Number((rewardPerShareT2 / riskPerShare).toFixed(2)) : 0;
    const maxRiskCash = (planForm.plannedCapital * planForm.riskPercentOfCapital) / 100;
    const sharesByRisk = riskPerShare > 0 ? Math.floor(maxRiskCash / riskPerShare) : 0;
    const sharesByCapital =
      planForm.entryPrice > 0 ? Math.floor(planForm.plannedCapital / planForm.entryPrice) : 0;
    const recommendedShares = Math.max(1, Math.min(sharesByRisk, sharesByCapital));
    return {
      riskPerShare,
      rewardPerShareT2,
      rrRatio,
      maxRiskCash,
      recommendedShares,
      positionValue: recommendedShares * planForm.entryPrice,
      expectedProfitT2: recommendedShares * rewardPerShareT2,
    };
  }, [planForm]);

  const handleSaveTradePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const st = stocks.find((s) => s.id === planForm.stockId) || stocks[0];
    if (!st) {
      showToast(isAr ? 'يرجى إضافة أو فحص سهم أولاً قبل إنشاء خطة' : 'Please add a stock first');
      return;
    }

    const newPlan: StockTradePlan = {
      id: `plan-${Date.now()}`,
      stockId: st.id,
      symbol: st.symbol,
      stockNameAr: st.nameAr,
      stockNameEn: st.nameEn,
      currency: st.currency,
      title: planForm.title,
      timeframe: planForm.timeframe,
      entryPrice: Number(planForm.entryPrice),
      stopLossPrice: Number(planForm.stopLossPrice),
      target1Price: Number(planForm.target1Price),
      target2Price: Number(planForm.target2Price),
      target3Price: Number(planForm.target3Price),
      plannedCapital: Number(planForm.plannedCapital),
      riskPercentOfCapital: Number(planForm.riskPercentOfCapital),
      recommendedShares: planMetrics.recommendedShares,
      riskRewardRatio: planMetrics.rrRatio,
      bullScenario: planForm.bullScenario,
      baseScenario: planForm.baseScenario,
      bearScenario: planForm.bearScenario,
      status: 'watching',
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setTradePlans((prev) => [newPlan, ...prev]);
    showToast(
      isAr ? 'تم حفظ الخطة المحتملة والسيناريوهات داخلياً بنجاح' : 'Trade plan saved locally'
    );
  };

  // =========================================================================
  // PERSONAL OPINION FORM STATE
  // =========================================================================
  const [opinionForm, setOpinionForm] = useState<{
    stockId: string;
    stance: PersonalStance;
    personalTargetPrice: number;
    personalSupportNote: string;
    convictionLevel: number;
    thesisNotes: string;
    tagsInput: string;
  }>({
    stockId: '',
    stance: 'very_bullish',
    personalTargetPrice: 55,
    personalSupportNote: '',
    convictionLevel: 5,
    thesisNotes: '',
    tagsInput: 'متابعة شخصية, استثمار',
  });

  useEffect(() => {
    if (stocks.length > 0 && !opinionForm.stockId) {
      setOpinionForm((prev) => ({
        ...prev,
        stockId: stocks[0].id,
        personalTargetPrice: stocks[0].estimatedFairValue,
      }));
    }
  }, [stocks.length]);

  const handleSaveOpinion = (e: React.FormEvent) => {
    e.preventDefault();
    const st = stocks.find((s) => s.id === opinionForm.stockId) || stocks[0];
    if (!st || !opinionForm.thesisNotes.trim()) return;

    const tags = opinionForm.tagsInput
      .split(/[,،]/)
      .map((t) => t.trim())
      .filter(Boolean);

    const existingIdx = personalOpinions.findIndex((o) => o.stockId === st.id);
    const record: PersonalStockOpinion = {
      id: existingIdx >= 0 ? personalOpinions[existingIdx].id : `op-${Date.now()}`,
      stockId: st.id,
      symbol: st.symbol,
      stockNameAr: st.nameAr,
      stockNameEn: st.nameEn,
      stance: opinionForm.stance,
      personalTargetPrice: Number(opinionForm.personalTargetPrice),
      personalSupportNote: opinionForm.personalSupportNote,
      convictionLevel: opinionForm.convictionLevel,
      thesisNotes: opinionForm.thesisNotes.trim(),
      tags: tags.length > 0 ? tags : ['متابعة شخصية'],
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    if (existingIdx >= 0) {
      setPersonalOpinions((prev) =>
        prev.map((item, idx) => (idx === existingIdx ? record : item))
      );
    } else {
      setPersonalOpinions((prev) => [record, ...prev]);
    }

    showToast(
      isAr
        ? `تم حفظ رأيك الشخصي حول (${st.nameAr}) داخلياً بنجاح`
        : `Saved personal opinion for ${st.symbol}`
    );
  };

  // =========================================================================
  // BACKUP (JSON), EXCEL EXPORT & EXCEL IMPORT HANDLERS
  // =========================================================================
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  const handleExportJsonBackup = () => {
    const payload = {
      stocks,
      cashBalance,
      transactions,
      tradePlans,
      personalOpinions,
      generalJournal,
      scanLogs,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `نسخة_احتياطية_البورصة_والمحفظة_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(isAr ? 'تم تحميل ملف النسخة الاحتياطية الكاملة بنجاح' : 'Backup JSON downloaded');
  };

  const handleImportJsonBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(String(evt.target?.result || '{}'));
        if (Array.isArray(parsed.stocks)) setStocks(parsed.stocks);
        if (typeof parsed.cashBalance === 'number') setCashBalance(parsed.cashBalance);
        if (Array.isArray(parsed.transactions)) setTransactions(parsed.transactions);
        if (Array.isArray(parsed.tradePlans)) setTradePlans(parsed.tradePlans);
        if (Array.isArray(parsed.personalOpinions)) setPersonalOpinions(parsed.personalOpinions);
        if (typeof parsed.generalJournal === 'string') setGeneralJournal(parsed.generalJournal);
        if (Array.isArray(parsed.scanLogs)) setScanLogs(parsed.scanLogs);
        showToast(
          isAr ? 'تم استرجاع جميع بيانات المحفظة والخطط والآراء بنجاح' : 'Backup restored'
        );
      } catch (err) {
        console.error(err);
        showToast(isAr ? 'ملف غير صالح للاسترجاع' : 'Invalid backup file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportAllToExcel = () => {
    const wb = XLSX.utils.book_new();

    const holdingsRows = portfolio.holdings.map((h) => ({
      'رمز السهم': h.symbol,
      'اسم السهم': h.nameAr,
      'القطاع': h.sectorAr,
      'العملة': h.currency,
      'الكمية المملوكة': h.quantity,
      'متوسط سعر الشراء': Number(h.avgCostPrice.toFixed(2)),
      'إجمالي التكلفة': Number(h.totalCost.toFixed(2)),
      'السعر الحالي': h.currentPrice,
      'القيمة السوقية الحالية': Number(h.marketValue.toFixed(2)),
      'صافي الربح / الخسارة': Number(h.unrealizedPnL.toFixed(2)),
      'نسبة العائد %': `${h.unrealizedPnLPercent.toFixed(2)}%`,
      'الوزن بالمحفظة %': `${h.weightPercent.toFixed(1)}%`,
    }));
    const wsHoldings = XLSX.utils.json_to_sheet(
      holdingsRows.length > 0 ? holdingsRows : [{ 'ملاحظة': 'لا توجد أسهم مملوكة حالياً' }]
    );
    XLSX.utils.book_append_sheet(wb, wsHoldings, isAr ? 'المحفظة الحالية' : 'Holdings');

    const txRows = transactions.map((tx) => ({
      'التاريخ': tx.date,
      'نوع العملية': tx.type === 'buy' ? 'شراء' : 'بيع',
      'رمز السهم': tx.symbol,
      'اسم السهم': tx.stockNameAr,
      'الكمية': tx.quantity,
      'السعر': tx.price,
      'العمولة': tx.commission,
      'الإجمالي الصافي': Number(tx.totalAmount.toFixed(2)),
      'الربح المحقق (عند البيع)':
        typeof tx.realizedPnL === 'number' ? Number(tx.realizedPnL.toFixed(2)) : '-',
      'الاستراتيجية': tx.strategyTag,
      'ملاحظات': tx.notes,
    }));
    const wsTxs = XLSX.utils.json_to_sheet(
      txRows.length > 0 ? txRows : [{ 'ملاحظة': 'لا توجد عمليات مسجلة' }]
    );
    XLSX.utils.book_append_sheet(wb, wsTxs, isAr ? 'سجل البيع والشراء' : 'Transactions');

    const planRows = tradePlans.map((p) => ({
      'عنوان الخطة': p.title,
      'السهم': p.stockNameAr,
      'الرمز': p.symbol,
      'سعر الدخول المستهدف': p.entryPrice,
      'وقف الخسارة': p.stopLossPrice,
      'الهدف الأول': p.target1Price,
      'الهدف الثاني': p.target2Price,
      'الكمية المقترحة': p.recommendedShares,
      'نسبة العائد للمخاطرة': `1 : ${p.riskRewardRatio}`,
      'السيناريو الإيجابي': p.bullScenario,
      'السيناريو الأساسي': p.baseScenario,
      'السيناريو السلبي': p.bearScenario,
      'الحالة': p.status,
    }));
    const wsPlans = XLSX.utils.json_to_sheet(
      planRows.length > 0 ? planRows : [{ 'ملاحظة': 'لا توجد خطط مسجلة' }]
    );
    XLSX.utils.book_append_sheet(wb, wsPlans, isAr ? 'الخطط المحتملة' : 'Trade_Plans');

    const opinionRows = stocks.map((s) => {
      const op = personalOpinions.find((o) => o.stockId === s.id);
      return {
        'رمز السهم': s.symbol,
        'اسم السهم': s.nameAr,
        'السعر الحالي': s.currentPrice,
        'القيمة العادلة الاسترشادية': s.estimatedFairValue,
        'الدعم الأول': s.support1,
        'المقاومة الأولى': s.resistance1,
        'التقييم التحليلي (من 100)': s.siteAnalyticalScore,
        'من مفضلة الموقع؟': s.isSiteFavorite ? 'نعم ⭐' : 'لا',
        'الرأي الشخصي': op ? op.stance : '-',
        'الهدف الشخصي': op ? op.personalTargetPrice : '-',
        'ملاحظات الرأي الشخصي': op ? op.thesisNotes : s.siteRationaleAr,
      };
    });
    const wsOpinions = XLSX.utils.json_to_sheet(
      opinionRows.length > 0 ? opinionRows : [{ 'ملاحظة': 'لا توجد أسهم مسجلة' }]
    );
    XLSX.utils.book_append_sheet(wb, wsOpinions, isAr ? 'الأسهم والرأي الشخصي' : 'Stocks_Opinions');

    XLSX.writeFile(
      wb,
      `تقرير_البورصة_والمحفظة_والخطط_DataSolu_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    showToast(isAr ? 'تم تصدير ملف الإكسيل المتكامل بنجاح' : 'Excel exported successfully');
  };

  // Import Stocks from Excel Sheet
  const handleImportStocksExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(firstSheet);
        if (!rows || rows.length === 0) return;

        const imported: StockItem[] = [];
        rows.forEach((r, idx) => {
          const symbol = String(
            r['الرمز'] || r['رمز السهم'] || r['Symbol'] || r['Ticker'] || `STK-${idx + 1}`
          ).trim();
          const nameAr = String(
            r['اسم السهم'] || r['السهم'] || r['الشركة'] || r['Name'] || symbol
          ).trim();
          const price =
            Number(r['السعر'] || r['السعر الحالي'] || r['Price'] || r['Close'] || 25) || 25;
          const fairVal =
            Number(r['القيمة العادلة'] || r['Fair Value'] || r['الهدف'] || price * 1.12) ||
            Number((price * 1.12).toFixed(2));
          const support =
            Number(r['الدعم'] || r['Support'] || price * 0.94) ||
            Number((price * 0.94).toFixed(2));
          const resistance =
            Number(r['المقاومة'] || r['Resistance'] || price * 1.08) ||
            Number((price * 1.08).toFixed(2));
          const pe = Number(r['مكرر الربحية'] || r['P/E'] || r['PE'] || 15) || 15;
          const roe = Number(r['العائد على حقوق الملكية'] || r['ROE'] || 16) || 16;
          const div = Number(r['التوزيعات'] || r['Dividend'] || 3) || 3;
          const rsi = Number(r['RSI'] || 52) || 52;

          const evalProf = evaluateStockAnalyticalProfile({
            currentPrice: price,
            estimatedFairValue: fairVal,
            rsi14: rsi,
            ma50: price * 0.98,
            ma200: price * 0.94,
            peRatio: pe,
            roePercent: roe,
            dividendYieldPercent: div,
          });

          imported.push({
            id: `imp-${Date.now()}-${idx}`,
            symbol,
            nameAr,
            nameEn: nameAr,
            market: 'custom',
            currency: String(r['العملة'] || r['Currency'] || 'SAR'),
            sectorAr: String(r['القطاع'] || r['Sector'] || 'قطاع عام'),
            sectorEn: String(r['Sector'] || r['القطاع'] || 'General'),
            currentPrice: price,
            previousClose: Number((price * 0.99).toFixed(2)),
            changePercent: Number(r['التغير %'] || r['Change'] || 0.8),
            high52W: Number((price * 1.2).toFixed(2)),
            low52W: Number((price * 0.8).toFixed(2)),
            rsi14: rsi,
            ma50: Number((price * 0.98).toFixed(2)),
            ma200: Number((price * 0.94).toFixed(2)),
            support1: support,
            support2: Number((support * 0.95).toFixed(2)),
            resistance1: resistance,
            resistance2: Number((resistance * 1.06).toFixed(2)),
            volumeTrend: 'normal',
            peRatio: pe,
            pbRatio: 2.0,
            roePercent: roe,
            dividendYieldPercent: div,
            estimatedFairValue: fairVal,
            isSiteFavorite: evalProf.score >= 80,
            sitePickCategory: evalProf.pickCategory,
            siteAnalyticalScore: evalProf.score,
            analyticalSignal: evalProf.signal,
            siteRationaleAr: String(
              r['ملاحظات'] ||
                r['التحليل'] ||
                'تم استيراد السهم من ملف الإكسيل وتقييمه آلياً وحفظه في السجل الداخلي.'
            ),
            siteRationaleEn: 'Imported from Excel and evaluated automatically.',
            priceHistory: [
              Number((price * 0.96).toFixed(2)),
              Number((price * 0.97).toFixed(2)),
              Number((price * 0.98).toFixed(2)),
              Number((price * 0.99).toFixed(2)),
              price,
            ],
            isWatchlisted: true,
          });
        });

        setStocks((prev) => [...imported, ...prev]);
        showToast(
          isAr
            ? `تم استيراد ${imported.length} سهم من ملف الإكسيل وحفظها داخلياً بنجاح`
            : `Imported ${imported.length} stocks from Excel`
        );
      } catch (err) {
        console.error(err);
        showToast(isAr ? 'تعذر قراءة ملف الإكسيل، تأكد من صحة الأعمدة' : 'Failed to parse Excel');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  // Toggle Watchlist Star
  const toggleWatchlist = (stockId: string) => {
    setStocks((prev) =>
      prev.map((s) => (s.id === stockId ? { ...s, isWatchlisted: !s.isWatchlisted } : s))
    );
  };

  // Toggle Site Favorite
  const toggleSiteFavorite = (stockId: string) => {
    setStocks((prev) =>
      prev.map((s) => (s.id === stockId ? { ...s, isSiteFavorite: !s.isSiteFavorite } : s))
    );
  };

  // Inline Price Update -> Dynamically recalculates Analytical Signal & logs to Internal Log!
  const handleInlinePriceUpdate = (stockId: string, newPrice: number) => {
    if (isNaN(newPrice) || newPrice <= 0) return;

    setStocks((prev) =>
      prev.map((s) => {
        if (s.id !== stockId) return s;
        const changePct =
          s.previousClose > 0
            ? Number((((newPrice - s.previousClose) / s.previousClose) * 100).toFixed(2))
            : 0;
        const newHist = [...s.priceHistory.slice(-11), newPrice];

        // Dynamically recalculate RSI & Analytical Signal based on the new price
        const evalRes = evaluateStockAnalyticalProfile({
          currentPrice: newPrice,
          estimatedFairValue: s.estimatedFairValue,
          rsi14: newPrice > s.currentPrice ? Math.min(85, s.rsi14 + 2) : Math.max(20, s.rsi14 - 2),
          ma50: s.ma50,
          ma200: s.ma200,
          peRatio: s.peRatio,
          roePercent: s.roePercent,
          dividendYieldPercent: s.dividendYieldPercent,
        });

        let updatedSignal = evalRes.signal;
        if (newPrice >= s.resistance1) updatedSignal = 'take_profit_zone';
        else if (newPrice <= s.support1 * 1.02) updatedSignal = 'strong_accumulation';

        const nowTime = new Date().toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });

        const updatedRationaleAr = `[تحديث السعر إلى ${newPrice} عند ${nowTime}]: ${
          updatedSignal === 'take_profit_zone'
            ? `السعر وصل/تجاوز منطقة المقاومة (${s.resistance1})؛ استرشادياً يُراقب لجني الأرباح الجزئي أو رفع الوقف.`
            : updatedSignal === 'strong_accumulation'
            ? `السعر يتداول في منطقة دعم استرشادية (${s.support1}) مع هامش أمان إيجابي نحو القيمة العادلة (${s.estimatedFairValue}).`
            : `يتحرك السهم بين الدعم ${s.support1} والمقاومة ${s.resistance1} والقيمة العادلة التقديرية ${s.estimatedFairValue}.`
        }`;

        // Log internal price & signal update
        setScanLogs((oldLogs) => [
          {
            id: `manual-${Date.now()}`,
            timestamp: nowTime,
            symbol: s.symbol,
            stockNameAr: s.nameAr,
            oldPrice: s.currentPrice,
            newPrice,
            changePercent: changePct,
            oldSignal: s.analyticalSignal,
            newSignal: updatedSignal,
            newScore: evalRes.score,
            source: 'manual_update',
          },
          ...oldLogs.slice(0, 49),
        ]);

        return {
          ...s,
          currentPrice: newPrice,
          changePercent: changePct,
          priceHistory: newHist,
          siteAnalyticalScore: evalRes.score,
          analyticalSignal: updatedSignal,
          sitePickCategory: evalRes.pickCategory,
          siteRationaleAr: updatedRationaleAr,
        };
      })
    );
  };

  // =========================================================================
  // STRATEGIC INSIGHTS & VISIONS GENERATOR
  // =========================================================================
  const strategicVisions = useMemo(() => {
    const visions: {
      id: string;
      type: 'positive' | 'warning' | 'opportunity' | 'info';
      title: string;
      detail: string;
      badge: string;
    }[] = [];

    if (stocks.length === 0 && portfolio.holdings.length === 0) {
      visions.push({
        id: 'v-empty',
        type: 'info',
        title: isAr
          ? 'المنصة جاهزة — ابدأ بفحص أو إضافة أسهمك ليتم توليد الرؤى الاستراتيجية'
          : 'Platform Ready — Scan or add stocks to generate strategic visions',
        detail: isAr
          ? 'بمجرد فحص أسهمك من السوق الفعلي أو تسجيل صفقاتك في المحفظة، سيقوم المحرك تلقائياً بتحليل تركز المحفظة، السيولة، ومناطق التشبع أو الفرص الاسترشادية.'
          : 'Once you scan live stocks or record portfolio trades, the engine automatically analyzes concentration, liquidity, and technical signals.',
        badge: isAr ? 'حفظ داخلي 100%' : '100% Local',
      });
      return visions;
    }

    const cashRatio =
      portfolio.totalPortfolioEquity > 0
        ? (cashBalance / portfolio.totalPortfolioEquity) * 100
        : 100;

    if (cashRatio > 45 && portfolio.totalPortfolioEquity > 0) {
      visions.push({
        id: 'v-cash-high',
        type: 'opportunity',
        title: isAr ? 'وفرة سيولة نقدية عالية بالمحفظة' : 'High Cash Liquidity Buffer',
        detail: isAr
          ? `تمثل السيولة النقدية حالياً ${cashRatio.toFixed(1)}% من إجمالي المحفظة. تمنحك هذه السيولة مرونة ممتازة لاقتناص الفرص عند مناطق الدعم.`
          : `Cash represents ${cashRatio.toFixed(1)}% of total equity, offering flexibility for support bounces.`,
        badge: `${cashRatio.toFixed(0)}% سيولة`,
      });
    } else if (cashRatio < 10 && portfolio.holdings.length > 0) {
      visions.push({
        id: 'v-cash-low',
        type: 'warning',
        title: isAr ? 'انخفاض نسبة السيولة النقدية الاحتياطية' : 'Low Cash Reserve Warning',
        detail: isAr
          ? `نسبة السيولة النقدية المتاحة (${cashRatio.toFixed(1)}%) أقل من الحد الاسترشادي الآمن (15% - 20%).`
          : `Available cash is only ${cashRatio.toFixed(1)}%. Consider keeping a 15-20% cash reserve.`,
        badge: 'تنبيه سيولة',
      });
    }

    const topHolding = portfolio.holdings[0];
    if (topHolding && topHolding.weightPercent > 40) {
      visions.push({
        id: 'v-conc',
        type: 'warning',
        title: isAr
          ? `تركز مرتفع في سهم (${topHolding.nameAr})`
          : `High Concentration in ${topHolding.symbol}`,
        detail: isAr
          ? `يستحوذ سهم ${topHolding.nameAr} وحده على ${topHolding.weightPercent.toFixed(1)}% من القيمة السوقية للأسهم المملوكة.`
          : `${topHolding.symbol} accounts for ${topHolding.weightPercent.toFixed(1)}% of invested assets.`,
        badge: `${topHolding.weightPercent.toFixed(0)}% تركز`,
      });
    }

    const goldenOpportunities = stocks.filter(
      (s) =>
        s.estimatedFairValue > s.currentPrice * 1.08 &&
        s.rsi14 < 65 &&
        s.siteAnalyticalScore >= 78
    );
    if (goldenOpportunities.length > 0) {
      const names = goldenOpportunities.map((g) => g.nameAr).join('، ');
      visions.push({
        id: 'v-golden',
        type: 'opportunity',
        title: isAr
          ? 'أسهم في مناطق تجميع استرشادية حسب آخر فحص للسعر'
          : 'Accumulation Candidates Based on Latest Scan',
        detail: isAr
          ? `تُظهر المؤشرات المحدثة أن الأسهم (${names}) تتداول دون قيمتها العادلة التقديرية مع مؤشر RSI متوازن.`
          : `${goldenOpportunities.map((g) => g.symbol).join(', ')} trade below estimated fair value with balanced RSI.`,
        badge: `${goldenOpportunities.length} فرص استرشادية`,
      });
    }

    return visions;
  }, [portfolio, cashBalance, stocks, isAr]);

  const getSignalBadge = (signal: AnalyticalSignal) => {
    switch (signal) {
      case 'strong_accumulation':
        return {
          label: isAr ? 'منطقة تجميع استرشادية قوية' : 'Strong Accumulation Zone',
          classes:
            'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
        };
      case 'positive_momentum':
        return {
          label: isAr ? 'زخم إيجابي / أعلى الدعم' : 'Positive Momentum',
          classes:
            'bg-teal-100 text-teal-800 dark:bg-teal-950/90 dark:text-teal-300 border-teal-300 dark:border-teal-800',
        };
      case 'neutral_watch':
        return {
          label: isAr ? 'منطقة محايدة / مراقبة' : 'Neutral / Watch',
          classes:
            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
        };
      case 'take_profit_zone':
        return {
          label: isAr ? 'تشبع شرائي / منطقة جني أرباح محتملة' : 'Overbought / Take-Profit Zone',
          classes:
            'bg-amber-100 text-amber-800 dark:bg-amber-950/90 dark:text-amber-300 border-amber-300 dark:border-amber-800',
        };
      case 'caution_risk':
        return {
          label: isAr ? 'منطقة حذر ومخاطرة مرتفعة' : 'High Risk / Caution',
          classes:
            'bg-rose-100 text-rose-800 dark:bg-rose-950/90 dark:text-rose-300 border-rose-300 dark:border-rose-800',
        };
    }
  };

  const getStanceBadge = (stance: PersonalStance) => {
    switch (stance) {
      case 'very_bullish':
        return {
          label: isAr ? 'إيجابي جداً (قناعة عالية)' : 'Very Bullish',
          classes: 'bg-emerald-600 text-white',
        };
      case 'bullish':
        return {
          label: isAr ? 'متفائل بحذر' : 'Moderately Bullish',
          classes: 'bg-teal-600 text-white',
        };
      case 'neutral':
        return {
          label: isAr ? 'محايد / تحت المراقبة' : 'Neutral / Watching',
          classes: 'bg-amber-500 text-slate-950',
        };
      case 'bearish':
        return {
          label: isAr ? 'سلبي / انتظار تصحيح' : 'Bearish / Waiting Pullback',
          classes: 'bg-rose-600 text-white',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Inputs for JSON Backup & Excel Stocks Import */}
      <input
        ref={jsonInputRef}
        type="file"
        accept=".json"
        onChange={handleImportJsonBackup}
        className="hidden"
      />
      <input
        ref={excelInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleImportStocksExcel}
        className="hidden"
      />

      {/* Toast Notification */}
      {statusBanner && (
        <div className="fixed bottom-6 end-6 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl border border-indigo-400 flex items-center gap-2.5 text-xs sm:text-sm font-extrabold">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0" />
          <span>{statusBanner}</span>
        </div>
      )}

      {/* =====================================================================
          1. PRIVACY & 100% INTERNAL STORAGE GUARANTEE + LEGAL DISCLAIMER
         ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Privacy & Local-Only Storage Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/90 to-cyan-50/80 dark:from-emerald-950/60 dark:via-slate-900 dark:to-teal-950/50 border-2 border-emerald-500/60 p-4 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md mt-0.5">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-700 text-white uppercase">
                {isAr ? 'خصوصية مطلقة 100%' : '100% Local Privacy'}
              </span>
              <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                {isAr
                  ? 'بياناتك تُحفظ داخلياً على جهازك فقط — لا علاقة لنا ببياناتك إطلاقاً'
                  : 'Your Data is Saved Internally on Your Device Only — Zero Server Access'}
              </h2>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {isAr
                ? 'المنصة تبدأ فارغة تماماً بدون أي بيانات محاكاة. كل ما تدخله أو تفحصه من أسهم، أسعار، صفقات بيع وشراء، خطط، وآراء شخصية يتم حفظه في التسجيل الداخلي لمتصفحك وجهازك فقط (Local Storage). لا يتم إرسال أو تخزين أي من بياناتك على خوادمنا ولا علاقة لنا ببياناتك.'
                : 'The platform starts completely empty with zero mock data. Everything you enter or scan is saved strictly inside your browser’s internal storage. We have no access or relation to your data.'}
            </p>
          </div>
        </div>

        {/* Legal Disclaimer Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50/90 to-rose-50/80 dark:from-amber-950/60 dark:via-slate-900 dark:to-rose-950/50 border-2 border-amber-400/70 dark:border-amber-600/60 p-4 shadow-sm flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-md mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white uppercase">
                  {isAr ? 'إخلاء مسؤولية قانوني' : 'Legal Disclaimer'}
                </span>
                <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                  {isAr
                    ? 'الموقع للاسترشاد فقط بدون توصيات بيع أو شراء'
                    : 'For Guidance Only — No Buy/Sell Recommendations'}
                </h2>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {isAr
                  ? 'جميع الأسعار المجلوبة، المؤشرات الفنية، والإشارات التحليلية المتغيرة هي لأغراض الاسترشاد وتنظيم محفظتك الشخصية فقط، ولا تُعد توصية مباشرة بالبيع أو الشراء.'
                  : 'All fetched market prices, technical indicators, and dynamic analytical signals are strictly for personal guidance and organization.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowFullDisclaimerModal(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-900 dark:text-amber-300 text-[11px] font-extrabold whitespace-nowrap transition-all flex items-center gap-1"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{isAr ? 'النص الكامل' : 'Details'}</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          2. LIVE MARKET SCANNER, PRICE MONITOR & DATA PERSISTENCE HUB
         ===================================================================== */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 shadow-xl border border-indigo-500/30 relative overflow-hidden space-y-6">
        <div className="absolute -top-24 -end-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-extrabold">
              <Activity className="w-3.5 h-3.5" />
              <span>
                {isAr
                  ? 'التسجيل الداخلي المباشر — فحص الأسعار الفعلية بالأسواق وتحديث التوصيات آلياً'
                  : 'Internal Storage Hub — Live Market Price Scanner & Dynamic Signals'}
              </span>
              {lastSavedAt && (
                <span className="text-emerald-300 ms-1">
                  ({isAr ? `محفوظ داخلياً ${lastSavedAt}` : `Saved locally ${lastSavedAt}`})
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              {isAr
                ? 'مركز فحص الأسهم الفعلي، مراقبة الأسعار، وإدارة المحفظة والخطط'
                : 'Live Stock Market Scanner, Price Monitor & Portfolio Hub'}
            </h1>
          </div>

          {/* Action Toolbar: Scan All Live Prices, Auto-Monitor Toggle, Clear All Data, Export/Import */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 1. Scan & Update Actual Market Prices Button */}
            <button
              onClick={handleScanAllStocksLive}
              disabled={isScanningMarket || stocks.length === 0}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black shadow-lg transition-all ${
                stocks.length === 0
                  ? 'bg-slate-700/60 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-emerald-500/20'
              }`}
              title={
                isAr
                  ? 'فحص وجلب الأسعار الفعلية من البورصة لجميع الأسهم المضافة وتحديث المؤشرات والتوصيات الاسترشادية'
                  : 'Fetch actual market prices for all added stocks and recalculate signals'
              }
            >
              <RefreshCw className={`w-4 h-4 ${isScanningMarket ? 'animate-spin' : ''}`} />
              <span>
                {isScanningMarket
                  ? isAr
                    ? 'جاري فحص السوق الفعلي...'
                    : 'Scanning Market...'
                  : isAr
                  ? `فحص وتحديث أسعار السوق الفعلية (${stocks.length})`
                  : `Scan Live Prices (${stocks.length})`}
              </span>
            </button>

            {/* 2. Live Price Auto-Monitor Toggle */}
            <button
              onClick={() => {
                if (stocks.length === 0) {
                  showToast(
                    isAr
                      ? 'أضف أو افحص سهماً واحداً على الأقل لتفعيل المراقبة التلقائية للأسعار'
                      : 'Add at least one stock to enable live monitoring'
                  );
                  return;
                }
                setAutoMonitorEnabled((prev) => !prev);
                showToast(
                  !autoMonitorEnabled
                    ? isAr
                      ? 'تم تفعيل مراقبة الأسعار التلقائية (تحديث آلي كل 60 ثانية مع تعديل الإشارات الاسترشادية)'
                      : 'Live price auto-monitoring enabled (every 60s)'
                    : isAr
                    ? 'تم إيقاف المراقبة التلقائية للأسعار'
                    : 'Live price monitoring paused'
                );
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-extrabold border transition-all ${
                autoMonitorEnabled
                  ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200 animate-pulse'
                  : 'bg-white/10 hover:bg-white/20 border-white/15 text-slate-200'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>
                {autoMonitorEnabled
                  ? isAr
                    ? 'مراقبة الأسعار الحية: نشطة ●'
                    : 'Live Monitor: ON ●'
                  : isAr
                  ? 'تفعيل مراقبة الأسعار'
                  : 'Auto-Monitor'}
              </span>
            </button>

            {/* 3. Catalog Quick Picker */}
            <button
              onClick={() => setShowCatalogModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold border border-indigo-400/40 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isAr ? 'دليل أسهم الأسواق للفحص الفوري' : 'Market Ticker Directory'}</span>
            </button>

            {/* 4. Manual Custom Stock Button */}
            <button
              onClick={() => setAddStockModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إدخال سهم يدوياً' : 'Manual Stock'}</span>
            </button>

            {/* 5. Export / Import / Backup */}
            <button
              onClick={handleExportAllToExcel}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{isAr ? 'تصدير Excel' : 'Export Excel'}</span>
            </button>

            <button
              onClick={handleExportJsonBackup}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-all"
            >
              <Save className="w-4 h-4 text-emerald-300" />
              <span>{isAr ? 'نسخة احتياطية' : 'Backup'}</span>
            </button>

            <button
              onClick={() => jsonInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-all"
            >
              <Upload className="w-4 h-4 text-sky-300" />
              <span>{isAr ? 'استرجاع' : 'Restore'}</span>
            </button>

            {/* 6. CLEAR ALL CURRENT DATA BUTTON (زر مسح البيانات الحالية) */}
            <button
              onClick={() => setConfirmClearModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-md shadow-rose-600/30 transition-all"
              title={isAr ? 'مسح كافة البيانات الحالية وتفريغ السجل الداخلي' : 'Clear all current data'}
            >
              <Trash2 className="w-4 h-4" />
              <span>{isAr ? 'مسح البيانات الحالية' : 'Clear All Data'}</span>
            </button>
          </div>
        </div>

        {/* DIRECT LIVE TICKER SCAN BAR (فحص سهم محدد مباشرة من السوق الفعلي) */}
        <div className="relative z-10 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleFetchSingleLiveStock(liveTickerInput, liveMarketSelect);
            }}
            className="flex flex-col md:flex-row items-stretch md:items-center gap-3"
          >
            <div className="flex items-center gap-2 text-xs font-black text-emerald-300 whitespace-nowrap">
              <Search className="w-4 h-4" />
              <span>
                {isAr
                  ? 'فحص سهم فعلي من السوق وإضافته للتسجيل الداخلي:'
                  : 'Scan Live Stock from Market:'}
              </span>
            </div>

            <select
              value={liveMarketSelect}
              onChange={(e) => setLiveMarketSelect(e.target.value as MarketRegion)}
              className="px-3 py-2.5 rounded-xl bg-slate-900/90 border border-white/20 text-xs font-extrabold text-white"
            >
              <option value="saudi">{isAr ? 'السوق السعودي (تداول .SR)' : 'Saudi (.SR)'}</option>
              <option value="egypt">{isAr ? 'البورصة المصرية (EGX .CA)' : 'Egypt (.CA)'}</option>
              <option value="us">{isAr ? 'السوق الأمريكي (US)' : 'US Market'}</option>
              <option value="uae">{isAr ? 'سوق الإمارات (.DU / .AD)' : 'UAE Market'}</option>
            </select>

            <input
              type="text"
              value={liveTickerInput}
              onChange={(e) => setLiveTickerInput(e.target.value)}
              placeholder={
                isAr
                  ? 'اكتب رقم أو رمز السهم (مثال: 1120 أو 2222 أو COMI أو AAPL أو NVDA)...'
                  : 'Enter ticker (e.g. 1120, 2222, COMI, AAPL, NVDA)...'
              }
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/20 text-xs font-bold text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />

            <button
              type="submit"
              disabled={isScanningMarket || !liveTickerInput.trim()}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-black whitespace-nowrap transition-all flex items-center justify-center gap-1.5"
            >
              <RefreshCw className={`w-4 h-4 ${isScanningMarket ? 'animate-spin' : ''}`} />
              <span>
                {isAr
                  ? 'فحص السعر الفعلي وتحديث التوصية'
                  : 'Scan Live Price & Signal'}
              </span>
            </button>
          </form>

          {scanningProgressText && (
            <div className="mt-2.5 text-xs font-bold text-amber-300 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{scanningProgressText}</span>
            </div>
          )}
        </div>

        {/* Quick Portfolio & Platform Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-slate-400 block">
              {isAr ? 'الأسهم المسجلة داخلياً' : 'Internally Saved Stocks'}
            </span>
            <span className="text-base sm:text-lg font-black text-emerald-300 mt-0.5 block">
              {stocks.length} {isAr ? 'أسهم' : 'Stocks'}
            </span>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-slate-400 block">
              {isAr ? 'إجمالي قيمة المحفظة' : 'Total Portfolio Equity'}
            </span>
            <span className="text-base sm:text-lg font-black text-white mt-0.5 block">
              {portfolio.totalPortfolioEquity.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </span>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-slate-400 block">
              {isAr ? 'القيمة السوقية للأسهم' : 'Holdings Market Value'}
            </span>
            <span className="text-base sm:text-lg font-black text-indigo-300 mt-0.5 block">
              {portfolio.totalMarketValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-slate-400 block">
              {isAr ? 'السيولة النقدية المتاحة' : 'Available Cash'}
            </span>
            <span className="text-base sm:text-lg font-black text-amber-300 mt-0.5 block">
              {cashBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-slate-400 block">
              {isAr ? 'الربح/الخسارة غير المحققة' : 'Unrealized P&L'}
            </span>
            <span
              className={`text-base sm:text-lg font-black mt-0.5 block ${
                portfolio.totalUnrealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {portfolio.totalUnrealizedPnL >= 0 ? '+' : ''}
              {portfolio.totalUnrealizedPnL.toLocaleString(undefined, {
                maximumFractionDigits: 1,
              })}{' '}
              ({portfolio.totalUnrealizedPnLPercent.toFixed(1)}%)
            </span>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-slate-400 block">
              {isAr ? 'الخطط والآراء المحفوظة' : 'Saved Plans & Notes'}
            </span>
            <span className="text-base sm:text-lg font-black text-sky-300 mt-0.5 block">
              {tradePlans.length} {isAr ? 'خطط' : 'Plans'} / {personalOpinions.length}{' '}
              {isAr ? 'آراء' : 'Notes'}
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================================
          3. INTERNAL WORKSPACE NAVIGATION TABS
         ===================================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto bg-white dark:bg-slate-800/90 p-2 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
        {[
          {
            id: 'stocks_overview',
            icon: Award,
            label: isAr
              ? `1. فحص الأسهم وترشيحات المفضلة (${stocks.length})`
              : `1. Stock Scanner & Featured Picks (${stocks.length})`,
          },
          {
            id: 'stocks_portfolio',
            icon: Wallet,
            label: isAr
              ? `2. المحفظة والشراء والبيع (${portfolio.holdings.length})`
              : `2. Portfolio & Buy/Sell (${portfolio.holdings.length})`,
          },
          {
            id: 'stocks_plans',
            icon: Compass,
            label: isAr
              ? `3. الخطط المحتملة والسيناريوهات (${tradePlans.length})`
              : `3. Trade Plans & Scenarios (${tradePlans.length})`,
          },
          {
            id: 'stocks_opinions',
            icon: MessageSquare,
            label: isAr
              ? `4. الرأي الشخصي والرؤى (${personalOpinions.length})`
              : `4. Personal Opinions & Visions (${personalOpinions.length})`,
          },
        ].map((tab) => {
          const IconComponent = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabSwitch(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =====================================================================
          TAB 1: LIVE STOCK SCANNER, SITE FEATURED PICKS & SCREENER
         ===================================================================== */}
      {currentTab === 'stocks_overview' && (
        <div className="space-y-8">
          {/* EMPTY STATE WHEN NO STOCKS ENTERED YET (يبدأ فارغاً بدون بيانات محاكاة) */}
          {stocks.length === 0 ? (
            <div className="rounded-3xl bg-white dark:bg-slate-800/90 border-2 border-dashed border-indigo-400/60 dark:border-indigo-500/40 p-8 sm:p-12 text-center space-y-6 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>

              <div className="max-w-2xl mx-auto space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {isAr
                    ? 'سجلك الداخلي فارغ وجاهز — لا توجد أي بيانات محاكاة افتراضية'
                    : 'Your Internal Workspace is Clean & Empty — Zero Mock Data'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {isAr
                    ? 'بناءً على تفضيلك، يفتح الموقع فارغاً تماماً. يمكنك الآن كتابة رمز أي سهم في شريط الفحص بالأعلى لجلب سعره الفعلي ومؤشراته من السوق مباشرة، أو الضغط على أي سهم من الأسواق بالأسفل لفحصه الفوري وتسجيله داخلياً في متصفحك.'
                    : 'As requested, the platform starts completely empty. Enter any ticker symbol above to scan its actual market price and indicators, or click any real market ticker below to scan and save it locally.'}
                </p>
              </div>

              {/* Quick 1-Click Live Scan Chips for Popular Real Stocks */}
              <div className="max-w-3xl mx-auto space-y-3">
                <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 block">
                  {isAr
                    ? 'اضغط على أي سهم لفحص سعره الفعلي الآن من السوق وإضافته لسجلك الداخلي:'
                    : 'Click any real stock below to scan its live market price now:'}
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {REAL_MARKET_TICKER_CATALOG.slice(0, 12).map((item) => (
                    <button
                      key={item.symbol}
                      disabled={isScanningMarket}
                      onClick={() => handleFetchSingleLiveStock(item.symbol, item.market, item)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white dark:bg-slate-700/80 dark:hover:bg-indigo-600 text-slate-800 dark:text-slate-100 text-xs font-extrabold border border-slate-200 dark:border-slate-600 transition-all flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{isAr ? item.nameAr : item.nameEn}</span>
                      <span className="font-mono text-[10px] opacity-75">({item.symbol})</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setShowCatalogModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black shadow-md transition-all"
                >
                  {isAr ? 'فتح دليل أسهم الأسواق الكامل للفحص' : 'Open Full Market Directory'}
                </button>
                <button
                  onClick={() => setAddStockModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-white text-xs sm:text-sm font-bold transition-all"
                >
                  {isAr ? '+ إضافة سهم يدوياً' : '+ Add Stock Manually'}
                </button>
                <button
                  onClick={() => excelInputRef.current?.click()}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition-all"
                >
                  {isAr ? 'رفع ملف أسهم Excel' : 'Import Stocks Excel'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Market Region Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/70">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 me-2">
                    {isAr ? 'تصفية السوق:' : 'Market:'}
                  </span>
                  {[
                    { id: 'all', label: isAr ? 'جميع الأسواق' : 'All Markets' },
                    { id: 'saudi', label: isAr ? 'السوق السعودي (تداول)' : 'Saudi (Tadawul)' },
                    { id: 'egypt', label: isAr ? 'البورصة المصرية (EGX)' : 'Egypt (EGX)' },
                    { id: 'us', label: isAr ? 'السوق الأمريكي (US)' : 'US Market' },
                    { id: 'uae', label: isAr ? 'سوق الإمارات (DFM/ADX)' : 'UAE Market' },
                    { id: 'custom', label: isAr ? 'أسهم مخصصة' : 'Custom' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMarket(m.id as MarketRegion | 'all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                        selectedMarket === m.id
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-700/70 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      isAr
                        ? 'ابحث باسم السهم، الرمز، أو القطاع...'
                        : 'Search symbol, name, sector...'
                    }
                    className="w-full ps-9 pe-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* SECTION A: SITE FEATURED PICKS (ترشيحات المفضلة للموقع حسب الأسعار المحدثة) */}
              {siteFavoriteStocks.length > 0 && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-black text-slate-900 dark:text-white">
                            {isAr
                              ? 'ترشيحات المفضلة والإشارات الاسترشادية المحدثة حسب السعر الفعلي'
                              : 'Featured Spotlights & Dynamic Signals'}
                          </h2>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            {isAr ? 'تتغير تلقائياً مع تحديث الأسعار — للاسترشاد فقط' : 'Auto-updates with price'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {siteFavoriteStocks.map((stock) => {
                      const upside =
                        stock.currentPrice > 0
                          ? ((stock.estimatedFairValue - stock.currentPrice) /
                              stock.currentPrice) *
                            100
                          : 0;
                      const signalInfo = getSignalBadge(stock.analyticalSignal);
                      const userOpinion = personalOpinions.find((o) => o.stockId === stock.id);

                      return (
                        <div
                          key={stock.id}
                          onClick={() => setSelectedStockId(stock.id)}
                          className={`cursor-pointer rounded-2xl bg-white dark:bg-slate-800/90 border-2 p-5 shadow-md hover:shadow-xl transition-all flex flex-col justify-between ${
                            selectedStock?.id === stock.id
                              ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                              : 'border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-400'
                          }`}
                        >
                          <div className="space-y-3.5">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-black">
                                    {stock.symbol}
                                  </span>
                                  <span className="text-[11px] font-bold text-slate-400">
                                    {stock.sectorAr}
                                  </span>
                                </div>
                                <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                                  {isAr ? stock.nameAr : stock.nameEn}
                                </h3>
                              </div>

                              <div className="text-end">
                                <div className="text-lg font-black text-slate-900 dark:text-white">
                                  {stock.currentPrice.toLocaleString()}{' '}
                                  <span className="text-[11px] font-normal text-slate-400">
                                    {stock.currency}
                                  </span>
                                </div>
                                <span
                                  className={`inline-flex items-center gap-0.5 text-xs font-extrabold ${
                                    stock.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'
                                  }`}
                                >
                                  {stock.changePercent >= 0 ? (
                                    <TrendingUp className="w-3.5 h-3.5" />
                                  ) : (
                                    <TrendingDown className="w-3.5 h-3.5" />
                                  )}
                                  {stock.changePercent >= 0 ? '+' : ''}
                                  {stock.changePercent}%
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-1">
                              <span
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold border ${signalInfo.classes}`}
                              >
                                {signalInfo.label}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded-lg bg-indigo-600 text-white text-xs font-black">
                                  {stock.siteAnalyticalScore}/100
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-900/70 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                              <div>
                                <span className="text-[10px] text-slate-400 block">
                                  {isAr ? 'الهدف الاسترشادي' : 'Fair Value'}
                                </span>
                                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                                  {stock.estimatedFairValue} ({upside >= 0 ? '+' : ''}
                                  {upside.toFixed(1)}%)
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 block">
                                  {isAr ? 'الدعم / المقاومة' : 'Supp / Res'}
                                </span>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                  {stock.support1} / {stock.resistance1}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 block">
                                  RSI (14) | MA50
                                </span>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                  {stock.rsi14} | {stock.ma50}
                                </span>
                              </div>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                              {isAr ? stock.siteRationaleAr : stock.siteRationaleEn}
                            </p>

                            {userOpinion && (
                              <div className="p-2.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 text-xs">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-black text-amber-900 dark:text-amber-300">
                                    {isAr ? 'رأيي الشخصي:' : 'My View:'}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      getStanceBadge(userOpinion.stance).classes
                                    }`}
                                  >
                                    {getStanceBadge(userOpinion.stance).label}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-700 dark:text-slate-300 line-clamp-2">
                                  {userOpinion.thesisNotes}
                                </p>
                              </div>
                            )}
                          </div>

                          <div
                            className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/70 flex items-center justify-between gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() =>
                                  handleFetchSingleLiveStock(stock.symbol, stock.market)
                                }
                                className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-extrabold flex items-center gap-1"
                                title={isAr ? 'فحص وتحديث السعر الفعلي الآن' : 'Refresh Live Price'}
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>{isAr ? 'فحص' : 'Scan'}</span>
                              </button>
                              <button
                                onClick={() => openTradeModal(stock, 'buy')}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold"
                              >
                                {isAr ? 'شراء' : 'Buy'}
                              </button>
                              <button
                                onClick={() => openTradeModal(stock, 'sell')}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold"
                              >
                                {isAr ? 'بيع' : 'Sell'}
                              </button>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() =>
                                  handleDeleteSingleStock(
                                    stock.id,
                                    isAr ? stock.nameAr : stock.symbol
                                  )
                                }
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                                title={isAr ? 'حذف السهم' : 'Delete stock'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION B: SELECTED STOCK DEEP-DIVE CHART & TECHNICAL/FUNDAMENTAL RADAR */}
              {selectedStock && (
                <div className="rounded-3xl bg-white dark:bg-slate-800/90 border-2 border-indigo-500/30 p-6 shadow-lg space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700/70 pb-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-mono text-xs font-black">
                          {selectedStock.symbol}
                        </span>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">
                          {isAr ? selectedStock.nameAr : selectedStock.nameEn}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-xs font-extrabold border ${
                            getSignalBadge(selectedStock.analyticalSignal).classes
                          }`}
                        >
                          {getSignalBadge(selectedStock.analyticalSignal).label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {isAr
                          ? 'فحص تحليلي مفصل لحركة السعر الفعلي، الدعوم والمقاومات، وتغير الإشارة الاسترشادية'
                          : 'Detailed analytical view of live price action, support/resistance, and dynamic signals'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        onClick={() =>
                          handleFetchSingleLiveStock(selectedStock.symbol, selectedStock.market)
                        }
                        disabled={isScanningMarket}
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1.5 shadow-sm"
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 ${isScanningMarket ? 'animate-spin' : ''}`}
                        />
                        <span>{isAr ? 'تحديث السعر من السوق' : 'Scan Live Price'}</span>
                      </button>

                      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="text-xs font-bold text-slate-500">
                          {isAr ? 'السعر:' : 'Price:'}
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          value={selectedStock.currentPrice}
                          onChange={(e) =>
                            handleInlinePriceUpdate(selectedStock.id, parseFloat(e.target.value))
                          }
                          className="w-24 px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-sm font-black text-indigo-600 dark:text-indigo-400 text-center"
                        />
                        <span className="text-xs font-bold text-slate-400">
                          {selectedStock.currency}
                        </span>
                      </div>

                      <button
                        onClick={() => openTradeModal(selectedStock, 'buy')}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black"
                      >
                        {isAr ? 'شراء' : 'Buy'}
                      </button>
                      <button
                        onClick={() => openTradeModal(selectedStock, 'sell')}
                        className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black"
                      >
                        {isAr ? 'بيع' : 'Sell'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    <div className="lg:col-span-7 h-72 bg-slate-50/70 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <Line
                        data={{
                          labels: selectedStock.priceHistory.map((_, idx) =>
                            isAr
                              ? `جلسة ${idx + 1}`
                              : `T-${selectedStock.priceHistory.length - idx}`
                          ),
                          datasets: [
                            {
                              label: isAr
                                ? `سعر السهم (${selectedStock.currency})`
                                : `Price (${selectedStock.currency})`,
                              data: selectedStock.priceHistory,
                              borderColor: '#4f46e5',
                              backgroundColor: 'rgba(79, 70, 229, 0.15)',
                              borderWidth: 3,
                              fill: true,
                              tension: 0.35,
                              pointRadius: 4,
                            },
                            {
                              label: isAr ? 'الهدف الاسترشادي' : 'Est. Fair Value',
                              data: selectedStock.priceHistory.map(
                                () => selectedStock.estimatedFairValue
                              ),
                              borderColor: '#10b981',
                              borderDash: [6, 6],
                              borderWidth: 2,
                              pointRadius: 0,
                              fill: false,
                            },
                            {
                              label: isAr ? 'مستوى الدعم الأول' : 'Support 1',
                              data: selectedStock.priceHistory.map(() => selectedStock.support1),
                              borderColor: '#f59e0b',
                              borderDash: [4, 4],
                              borderWidth: 2,
                              pointRadius: 0,
                              fill: false,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top',
                              labels: {
                                color: isDark ? '#cbd5e1' : '#334155',
                                font: { family: 'Cairo', weight: 'bold', size: 11 },
                              },
                            },
                          },
                          scales: {
                            x: {
                              ticks: { color: isDark ? '#94a3b8' : '#64748b' },
                              grid: { display: false },
                            },
                            y: {
                              ticks: { color: isDark ? '#94a3b8' : '#64748b' },
                              grid: {
                                color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                              },
                            },
                          },
                        }}
                      />
                    </div>

                    <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 block">
                          {isAr ? 'مستويات الدعم الفنية' : 'Support Zones'}
                        </span>
                        <div className="text-sm font-black text-slate-900 dark:text-white mt-1">
                          {isAr ? 'دعم 1:' : 'S1:'} {selectedStock.support1} |{' '}
                          {isAr ? 'دعم 2:' : 'S2:'} {selectedStock.support2}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60">
                        <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 block">
                          {isAr ? 'مستويات المقاومة الفنية' : 'Resistance Zones'}
                        </span>
                        <div className="text-sm font-black text-slate-900 dark:text-white mt-1">
                          {isAr ? 'مقاومة 1:' : 'R1:'} {selectedStock.resistance1} |{' '}
                          {isAr ? 'مقاومة 2:' : 'R2:'} {selectedStock.resistance2}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60">
                        <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 block">
                          {isAr ? 'القوة النسبية (RSI 14)' : 'RSI (14) Momentum'}
                        </span>
                        <div className="text-sm font-black text-slate-900 dark:text-white mt-1">
                          {selectedStock.rsi14}
                        </div>
                        <span className="text-[10px] text-slate-500">
                          MA50: {selectedStock.ma50} | MA200: {selectedStock.ma200}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
                        <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 block">
                          {isAr ? 'نطاق 52 أسبوعاً' : '52-Week Range'}
                        </span>
                        <div className="text-sm font-black text-slate-900 dark:text-white mt-1">
                          {selectedStock.low52W} — {selectedStock.high52W}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION C: ALL STOCKS SCREENER TABLE */}
              <div className="rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-md overflow-hidden">
                <div className="p-5 border-b border-slate-100 dark:border-slate-700/70 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {isAr
                        ? 'جدول الأسهم المسجلة داخلياً ومراقبة الأسعار والتوصيات الاسترشادية'
                        : 'Internally Recorded Stocks, Live Prices & Dynamic Signals'}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { id: 'all', label: isAr ? 'الكل' : 'All' },
                      { id: 'watchlist', label: isAr ? 'مفضلتي ⭐' : 'Watchlist ⭐' },
                      { id: 'growth', label: isAr ? 'أسهم النمو' : 'Growth' },
                      { id: 'value', label: isAr ? 'القيمة العادلة' : 'Value' },
                      { id: 'momentum', label: isAr ? 'الزخم الفني' : 'Momentum' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedPickCategory(cat.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          selectedPickCategory === cat.id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-start">
                    <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-extrabold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="py-3.5 px-4 text-start">{isAr ? 'السهم' : 'Stock'}</th>
                        <th className="py-3.5 px-3 text-center">
                          {isAr ? 'السعر الفعلي / تحديث' : 'Live Price'}
                        </th>
                        <th className="py-3.5 px-3 text-center">
                          {isAr ? 'التغير اليومي' : 'Change %'}
                        </th>
                        <th className="py-3.5 px-3 text-center">
                          {isAr ? 'الهدف الاسترشادي' : 'Fair Value'}
                        </th>
                        <th className="py-3.5 px-3 text-center">
                          {isAr ? 'الدعم / المقاومة' : 'Supp / Res'}
                        </th>
                        <th className="py-3.5 px-3 text-center">RSI (14)</th>
                        <th className="py-3.5 px-3 text-center">
                          {isAr ? 'الإشارة الاسترشادية المتغيرة' : 'Dynamic Signal'}
                        </th>
                        <th className="py-3.5 px-4 text-center">{isAr ? 'إجراءات' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredStocks.map((st) => {
                        const upside =
                          st.currentPrice > 0
                            ? ((st.estimatedFairValue - st.currentPrice) / st.currentPrice) * 100
                            : 0;
                        const sig = getSignalBadge(st.analyticalSignal);

                        return (
                          <tr
                            key={st.id}
                            onClick={() => setSelectedStockId(st.id)}
                            className={`cursor-pointer transition-colors ${
                              selectedStock?.id === st.id
                                ? 'bg-indigo-50/70 dark:bg-indigo-950/30'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                            }`}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleWatchlist(st.id);
                                  }}
                                  className={
                                    st.isWatchlisted
                                      ? 'text-amber-400'
                                      : 'text-slate-300 hover:text-amber-400'
                                  }
                                >
                                  <Star className="w-4 h-4 fill-current" />
                                </button>
                                <div>
                                  <div className="font-black text-slate-900 dark:text-white">
                                    {isAr ? st.nameAr : st.nameEn}
                                  </div>
                                  <div className="text-[11px] text-slate-400 font-mono">
                                    {st.symbol} • {st.sectorAr}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td
                              className="py-3 px-3 text-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="inline-flex items-center gap-1">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={st.currentPrice}
                                  onChange={(e) =>
                                    handleInlinePriceUpdate(st.id, parseFloat(e.target.value))
                                  }
                                  className="w-20 px-1.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center font-black text-slate-900 dark:text-white"
                                />
                                <span className="text-[10px] text-slate-400">{st.currency}</span>
                              </div>
                            </td>

                            <td className="py-3 px-3 text-center">
                              <span
                                className={`font-black ${
                                  st.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'
                                }`}
                              >
                                {st.changePercent >= 0 ? '+' : ''}
                                {st.changePercent}%
                              </span>
                            </td>

                            <td className="py-3 px-3 text-center">
                              <span className="font-black text-slate-800 dark:text-slate-100">
                                {st.estimatedFairValue}
                              </span>
                              <span
                                className={`block text-[10px] font-bold ${
                                  upside >= 0 ? 'text-emerald-600' : 'text-rose-500'
                                }`}
                              >
                                {upside >= 0 ? `+${upside.toFixed(1)}%` : `${upside.toFixed(1)}%`}
                              </span>
                            </td>

                            <td className="py-3 px-3 text-center font-bold text-slate-700 dark:text-slate-300">
                              <span className="text-emerald-600">{st.support1}</span> /{' '}
                              <span className="text-rose-500">{st.resistance1}</span>
                            </td>

                            <td className="py-3 px-3 text-center font-black">{st.rsi14}</td>

                            <td className="py-3 px-3 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${sig.classes}`}
                              >
                                {sig.label}
                              </span>
                            </td>

                            <td
                              className="py-3 px-4 text-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="inline-flex items-center gap-1">
                                <button
                                  onClick={() => handleFetchSingleLiveStock(st.symbol, st.market)}
                                  className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 hover:bg-indigo-100"
                                  title={isAr ? 'فحص وتحديث السعر الفعلي' : 'Scan Live Price'}
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => openTradeModal(st, 'buy')}
                                  className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                >
                                  {isAr ? 'شراء' : 'Buy'}
                                </button>
                                <button
                                  onClick={() => openTradeModal(st, 'sell')}
                                  className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold"
                                >
                                  {isAr ? 'بيع' : 'Sell'}
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteSingleStock(st.id, isAr ? st.nameAr : st.symbol)
                                  }
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION D: INTERNAL SCAN & SIGNAL UPDATE LOG (سجل الفحص والتحديث الداخلي للأسعار والتوصيات) */}
              {scanLogs.length > 0 && (
                <div className="rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <History className="w-5 h-5 text-indigo-500" />
                      <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                        {isAr
                          ? 'سجل الفحص والتحديث الداخلي للأسعار وتغير الإشارات الاسترشادية'
                          : 'Internal Price Scan & Dynamic Signal Log'}
                      </h3>
                    </div>
                    <button
                      onClick={() => setScanLogs([])}
                      className="text-xs font-bold text-slate-400 hover:text-rose-500"
                    >
                      {isAr ? 'مسح السجل الزمني' : 'Clear Log'}
                    </button>
                  </div>

                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {scanLogs.map((log) => (
                      <div
                        key={log.id}
                        className="py-2 flex flex-wrap items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-slate-400">
                            [{log.timestamp}]
                          </span>
                          <span className="font-black text-slate-800 dark:text-slate-100">
                            {log.stockNameAr} ({log.symbol})
                          </span>
                          <span className="text-slate-500">
                            {log.oldPrice ? `${log.oldPrice} ← ` : ''}
                            <strong className="text-indigo-600 dark:text-indigo-400">
                              {log.newPrice}
                            </strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              getSignalBadge(log.newSignal).classes
                            }`}
                          >
                            {getSignalBadge(log.newSignal).label}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            ({log.newScore}/100)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 2: PORTFOLIO HOLDINGS, CASH MANAGEMENT & BUY/SELL TRACKER
         ===================================================================== */}
      {currentTab === 'stocks_portfolio' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 p-6 shadow-md flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
                    {isAr ? 'السيولة النقدية المتاحة بالمحفظة' : 'Portfolio Cash Management'}
                  </span>
                  <Wallet className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                  {cashBalance.toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {isAr
                    ? 'تُحفظ السيولة والصفقات داخلياً في متصفحك فقط. أدخل رصيد السيولة النقدية المتاحة:'
                    : 'Saved strictly inside your browser. Adjust available cash balance:'}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="number"
                  value={cashBalance}
                  onChange={(e) => setCashBalance(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white"
                />
                {stocks.length > 0 && (
                  <button
                    onClick={() => openTradeModal(stocks[0], 'buy')}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black whitespace-nowrap shadow-sm"
                  >
                    {isAr ? '+ تسجيل شراء / بيع' : '+ Record Trade'}
                  </button>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2 max-w-md">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {isAr
                    ? 'توزيع الأصول والأسهم المملوكة في المحفظة'
                    : 'Portfolio Asset & Stock Allocation'}
                </h3>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">
                      {isAr ? 'إجمالي تكلفة الشراء' : 'Total Cost Basis'}
                    </span>
                    <span className="text-sm font-black text-slate-800 dark:text-white">
                      {portfolio.totalInvestedCost.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">
                      {isAr ? 'الأرباح المحققة (بعد البيع)' : 'Realized P&L'}
                    </span>
                    <span
                      className={`text-sm font-black ${
                        portfolio.totalRealizedPnL >= 0 ? 'text-emerald-600' : 'text-rose-500'
                      }`}
                    >
                      {portfolio.totalRealizedPnL >= 0 ? '+' : ''}
                      {portfolio.totalRealizedPnL.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              {(portfolio.holdings.length > 0 || cashBalance > 0) && (
                <div className="w-44 h-44 flex-shrink-0">
                  <Doughnut
                    data={{
                      labels: [
                        ...portfolio.holdings.map((h) => (isAr ? h.nameAr : h.symbol)),
                        isAr ? 'السيولة النقدية' : 'Cash',
                      ],
                      datasets: [
                        {
                          data: [
                            ...portfolio.holdings.map((h) => Number(h.marketValue.toFixed(0))),
                            Number(cashBalance.toFixed(0)),
                          ],
                          backgroundColor: [
                            '#4f46e5',
                            '#10b981',
                            '#f59e0b',
                            '#ec4899',
                            '#06b6d4',
                            '#8b5cf6',
                            '#64748b',
                          ],
                          borderWidth: 2,
                          borderColor: isDark ? '#0f172a' : '#ffffff',
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700/70">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {isAr
                  ? 'تتبع الأسهم المملوكة حالياً بالمحفظة (حساب تلقائي لمتوسط التكلفة والأرباح)'
                  : 'Active Portfolio Holdings & Live P&L Tracker'}
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-extrabold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'السهم' : 'Stock'}</th>
                    <th className="py-3.5 px-3 text-center">{isAr ? 'الكمية' : 'Qty'}</th>
                    <th className="py-3.5 px-3 text-center">
                      {isAr ? 'متوسط سعر الشراء' : 'Avg Buy Cost'}
                    </th>
                    <th className="py-3.5 px-3 text-center">
                      {isAr ? 'إجمالي التكلفة' : 'Total Cost'}
                    </th>
                    <th className="py-3.5 px-3 text-center">
                      {isAr ? 'السعر الحالي' : 'Current Price'}
                    </th>
                    <th className="py-3.5 px-3 text-center">
                      {isAr ? 'القيمة السوقية' : 'Market Value'}
                    </th>
                    <th className="py-3.5 px-3 text-center">
                      {isAr ? 'صافي الربح / الخسارة' : 'Unrealized P&L'}
                    </th>
                    <th className="py-3.5 px-3 text-center">{isAr ? 'الوزن %' : 'Weight %'}</th>
                    <th className="py-3.5 px-4 text-center">{isAr ? 'تعزيز / بيع' : 'Trade'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {portfolio.holdings.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400 font-bold">
                        {isAr
                          ? 'المحفظة فارغة حالياً — افحص أو أضف سهماً ثم سجل عملية شراء ليتم تتبعها هنا'
                          : 'No active holdings yet.'}
                      </td>
                    </tr>
                  ) : (
                    portfolio.holdings.map((h) => {
                      const stObj = stocks.find((s) => s.id === h.stockId) || stocks[0];
                      return (
                        <tr
                          key={h.stockId}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        >
                          <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                            {isAr ? h.nameAr : h.nameEn}{' '}
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({h.symbol})
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-center font-black">{h.quantity}</td>
                          <td className="py-3.5 px-3 text-center font-bold">
                            {h.avgCostPrice.toFixed(2)} {h.currency}
                          </td>
                          <td className="py-3.5 px-3 text-center font-bold">
                            {h.totalCost.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <input
                              type="number"
                              step="0.01"
                              value={h.currentPrice}
                              onChange={(e) =>
                                handleInlinePriceUpdate(h.stockId, parseFloat(e.target.value))
                              }
                              className="w-20 px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center font-black text-indigo-600"
                            />
                          </td>
                          <td className="py-3.5 px-3 text-center font-black">
                            {h.marketValue.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <span
                              className={`font-black ${
                                h.unrealizedPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {h.unrealizedPnL >= 0 ? '+' : ''}
                              {h.unrealizedPnL.toFixed(1)} ({h.unrealizedPnLPercent.toFixed(2)}%)
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-center font-bold">
                            {h.weightPercent.toFixed(1)}%
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {stObj && (
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => openTradeModal(stObj, 'buy')}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold"
                                >
                                  {isAr ? '+ تعزيز' : '+ Buy'}
                                </button>
                                <button
                                  onClick={() => openTradeModal(stObj, 'sell')}
                                  className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold"
                                >
                                  {isAr ? 'بيع' : 'Sell'}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {transactions.length > 0 && (
            <div className="rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-md overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-700/70 flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {isAr ? 'سجل عمليات الشراء والبيع المحفوظة داخلياً' : 'Internal Transactions Log'}
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-start">
                  <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 font-extrabold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-3 px-4 text-start">{isAr ? 'التاريخ' : 'Date'}</th>
                      <th className="py-3 px-3 text-center">{isAr ? 'العملية' : 'Type'}</th>
                      <th className="py-3 px-3 text-start">{isAr ? 'السهم' : 'Stock'}</th>
                      <th className="py-3 px-3 text-center">{isAr ? 'الكمية' : 'Qty'}</th>
                      <th className="py-3 px-3 text-center">{isAr ? 'السعر' : 'Price'}</th>
                      <th className="py-3 px-3 text-center">{isAr ? 'الصافي' : 'Total'}</th>
                      <th className="py-3 px-3 text-center">{isAr ? 'حذف' : 'Delete'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {transactions.map((tx) => (
                      <tr key={tx.id}>
                        <td className="py-3 px-4 font-mono text-slate-500">{tx.date}</td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                              tx.type === 'buy'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {tx.type === 'buy' ? (isAr ? 'شراء' : 'BUY') : isAr ? 'بيع' : 'SELL'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-black">{tx.stockNameAr}</td>
                        <td className="py-3 px-3 text-center font-bold">{tx.quantity}</td>
                        <td className="py-3 px-3 text-center font-bold">{tx.price}</td>
                        <td className="py-3 px-3 text-center font-black">
                          {tx.totalAmount.toFixed(1)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() =>
                              setTransactions((prev) => prev.filter((item) => item.id !== tx.id))
                            }
                            className="p-1 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 3: POTENTIAL TRADE PLANS, SCENARIOS & RISK CALCULATOR
         ===================================================================== */}
      {currentTab === 'stocks_plans' && (
        <div className="space-y-8">
          <form
            onSubmit={handleSaveTradePlan}
            className="rounded-3xl bg-white dark:bg-slate-800/90 border-2 border-indigo-500/30 p-6 sm:p-7 shadow-lg space-y-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700/70 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    {isAr
                      ? 'بناء خطة تداول محتملة وحاسبة حجم الصفقة والسيناريوهات'
                      : 'Trade Plan Builder & Risk Calculator'}
                  </h2>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'اختر السهم' : 'Select Stock'}
                </label>
                <select
                  value={planForm.stockId}
                  onChange={(e) => handlePlanStockSelect(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-900 dark:text-white"
                >
                  {stocks.length === 0 ? (
                    <option value="">{isAr ? 'أضف أو افحص سهماً أولاً' : 'Add stock first'}</option>
                  ) : (
                    stocks.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.symbol} — {isAr ? st.nameAr : st.nameEn} ({st.currentPrice})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'عنوان الخطة المحتملة' : 'Plan Title'}
                </label>
                <input
                  type="text"
                  required
                  value={planForm.title}
                  onChange={(e) => setPlanForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'المدى الزمني' : 'Timeframe'}
                </label>
                <select
                  value={planForm.timeframe}
                  onChange={(e) =>
                    setPlanForm((prev) => ({ ...prev, timeframe: e.target.value as any }))
                  }
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="intraday">{isAr ? 'مضاربة يومية' : 'Intraday'}</option>
                  <option value="short_term">{isAr ? 'قصير الأجل' : 'Short Term'}</option>
                  <option value="swing">{isAr ? 'متوسط الأجل (Swing)' : 'Swing'}</option>
                  <option value="long_term">{isAr ? 'طويل الأجل' : 'Long Term'}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  {isAr ? 'سعر الدخول' : 'Entry'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={planForm.entryPrice}
                  onChange={(e) =>
                    setPlanForm((prev) => ({ ...prev, entryPrice: Number(e.target.value) }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-black text-indigo-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-rose-600 mb-1">
                  {isAr ? 'وقف الخسارة' : 'Stop-Loss'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={planForm.stopLossPrice}
                  onChange={(e) =>
                    setPlanForm((prev) => ({ ...prev, stopLossPrice: Number(e.target.value) }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-300 text-sm font-black text-rose-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-emerald-600 mb-1">
                  {isAr ? 'الهدف الأول' : 'Target 1'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={planForm.target1Price}
                  onChange={(e) =>
                    setPlanForm((prev) => ({ ...prev, target1Price: Number(e.target.value) }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-300 text-sm font-black text-emerald-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-emerald-600 mb-1">
                  {isAr ? 'الهدف الثاني' : 'Target 2'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={planForm.target2Price}
                  onChange={(e) =>
                    setPlanForm((prev) => ({ ...prev, target2Price: Number(e.target.value) }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-300 text-sm font-black text-emerald-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  {isAr ? 'رأس المال المخصص' : 'Capital'}
                </label>
                <input
                  type="number"
                  value={planForm.plannedCapital}
                  onChange={(e) =>
                    setPlanForm((prev) => ({ ...prev, plannedCapital: Number(e.target.value) }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 text-sm font-black"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  {isAr ? 'نسبة المخاطرة %' : 'Risk %'}
                </label>
                <input
                  type="number"
                  step="0.25"
                  value={planForm.riskPercentOfCapital}
                  onChange={(e) =>
                    setPlanForm((prev) => ({
                      ...prev,
                      riskPercentOfCapital: Number(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 text-sm font-black text-amber-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-indigo-50/80 dark:bg-indigo-950/40 p-4 rounded-2xl border border-indigo-200">
              <div>
                <span className="text-[11px] text-slate-500 block">
                  {isAr ? 'نسبة العائد للمخاطرة' : 'R:R Ratio'}
                </span>
                <span className="text-base font-black text-emerald-600">
                  1 : {planMetrics.rrRatio}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">
                  {isAr ? 'الكمية المقترحة للشراء' : 'Suggested Shares'}
                </span>
                <span className="text-base font-black text-indigo-700 dark:text-indigo-300">
                  {planMetrics.recommendedShares} {isAr ? 'سهم' : 'Shares'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">
                  {isAr ? 'أقصى خسارة عند الوقف' : 'Max Stop Loss'}
                </span>
                <span className="text-base font-black text-rose-600">
                  -{planMetrics.maxRiskCash.toFixed(0)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">
                  {isAr ? 'الربح المتوقع عند T2' : 'Profit at T2'}
                </span>
                <span className="text-base font-black text-emerald-600">
                  +{planMetrics.expectedProfitT2.toFixed(0)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-emerald-700 mb-1">
                  {isAr ? '1. السيناريو الإيجابي' : '1. Bull Case'}
                </label>
                <textarea
                  rows={2}
                  value={planForm.bullScenario}
                  onChange={(e) =>
                    setPlanForm((prev) => ({ ...prev, bullScenario: e.target.value }))
                  }
                  className="w-full p-2.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-indigo-700 mb-1">
                  {isAr ? '2. السيناريو الأساسي' : '2. Base Case'}
                </label>
                <textarea
                  rows={2}
                  value={planForm.baseScenario}
                  onChange={(e) =>
                    setPlanForm((prev) => ({ ...prev, baseScenario: e.target.value }))
                  }
                  className="w-full p-2.5 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-rose-700 mb-1">
                  {isAr ? '3. السيناريو السلبي / الطوارئ' : '3. Bear Case'}
                </label>
                <textarea
                  rows={2}
                  value={planForm.bearScenario}
                  onChange={(e) =>
                    setPlanForm((prev) => ({ ...prev, bearScenario: e.target.value }))
                  }
                  className="w-full p-2.5 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 text-xs font-semibold"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black shadow-lg flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{isAr ? 'حفظ الخطة المحتملة داخلياً' : 'Save Plan Internally'}</span>
              </button>
            </div>
          </form>

          {tradePlans.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {tradePlans.map((plan) => (
                <div
                  key={plan.id}
                  className="rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 p-6 shadow-md space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-black text-indigo-600">
                        {plan.symbol}
                      </span>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        {plan.title}
                      </h3>
                    </div>
                    <button
                      onClick={() =>
                        setTradePlans((prev) => prev.filter((p) => p.id !== plan.id))
                      }
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl text-center text-xs font-black">
                    <div>
                      {isAr ? 'الدخول:' : 'Entry:'} {plan.entryPrice}
                    </div>
                    <div className="text-rose-600">
                      {isAr ? 'الوقف:' : 'Stop:'} {plan.stopLossPrice}
                    </div>
                    <div className="text-emerald-600">
                      {isAr ? 'هدف:' : 'T2:'} {plan.target2Price}
                    </div>
                    <div>1 : {plan.riskRewardRatio}</div>
                  </div>
                  <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                    <p>
                      <strong>{isAr ? 'إيجابي: ' : 'Bull: '}</strong>
                      {plan.bullScenario}
                    </p>
                    <p>
                      <strong>{isAr ? 'سلبي: ' : 'Bear: '}</strong>
                      {plan.bearScenario}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 4: PERSONAL OPINIONS, RESEARCH JOURNAL & STRATEGIC VISIONS
         ===================================================================== */}
      {currentTab === 'stocks_opinions' && (
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {isAr
                  ? 'الرؤى الاستراتيجية الشاملة للمحفظة والأسواق'
                  : 'Automated Strategic Visions'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {strategicVisions.map((v) => (
                <div
                  key={v.id}
                  className="p-5 rounded-2xl border-2 bg-white dark:bg-slate-800 border-indigo-200 dark:border-slate-700 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      {v.title}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {v.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {v.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form
              onSubmit={handleSaveOpinion}
              className="lg:col-span-7 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 p-6 shadow-md space-y-4"
            >
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-500" />
                <span>
                  {isAr
                    ? 'تدوين وحفظ الرأي الشخصي والنظرة الخاصة لكل سهم داخلياً'
                    : 'Record Personal Stock Opinion Internally'}
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">
                    {isAr ? 'اختر السهم' : 'Select Stock'}
                  </label>
                  <select
                    value={opinionForm.stockId}
                    onChange={(e) =>
                      setOpinionForm((prev) => ({ ...prev, stockId: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-black"
                  >
                    {stocks.length === 0 ? (
                      <option value="">{isAr ? 'أضف أو افحص سهماً أولاً' : 'Add stock first'}</option>
                    ) : (
                      stocks.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.symbol} — {isAr ? st.nameAr : st.nameEn}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">
                    {isAr ? 'توجهي ورأيي الشخصي' : 'Personal Stance'}
                  </label>
                  <select
                    value={opinionForm.stance}
                    onChange={(e) =>
                      setOpinionForm((prev) => ({
                        ...prev,
                        stance: e.target.value as PersonalStance,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-black"
                  >
                    <option value="very_bullish">{isAr ? 'إيجابي جداً' : 'Very Bullish'}</option>
                    <option value="bullish">{isAr ? 'متفائل بحذر' : 'Bullish'}</option>
                    <option value="neutral">{isAr ? 'محايد / مراقب' : 'Neutral'}</option>
                    <option value="bearish">{isAr ? 'سلبي / انتظار تصحيح' : 'Bearish'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  {isAr ? 'تفاصيل رأيي الشخصي وملاحظاتي' : 'Personal Notes'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={opinionForm.thesisNotes}
                  onChange={(e) =>
                    setOpinionForm((prev) => ({ ...prev, thesisNotes: e.target.value }))
                  }
                  placeholder={isAr ? 'اكتب رأيك الشخصي حول السهم...' : 'Write your personal view...'}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{isAr ? 'حفظ الرأي الشخصي داخلياً' : 'Save Opinion'}</span>
                </button>
              </div>
            </form>

            <div className="lg:col-span-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 p-6 shadow-md flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-500" />
                  <span>{isAr ? 'مفكرة قواعدي الشخصية للسوق' : 'Personal Market Journal'}</span>
                </h3>
                <span className="text-[10px] font-bold text-emerald-600">
                  {isAr ? 'يحفظ داخلياً تلقائياً' : 'Saved locally'}
                </span>
              </div>

              <textarea
                rows={6}
                value={generalJournal}
                onChange={(e) => setGeneralJournal(e.target.value)}
                placeholder={
                  isAr
                    ? 'اكتب هنا قواعدك الشخصية في التداول وإدارة المخاطر (يتم حفظها داخلياً في متصفحك فقط)...'
                    : 'Write your personal market rules here (saved locally in your browser)...'
                }
                className="w-full p-3.5 rounded-2xl bg-amber-50/50 dark:bg-slate-900 border border-amber-200 dark:border-slate-700 text-xs font-semibold leading-relaxed"
              />
            </div>
          </div>

          {personalOpinions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {personalOpinions.map((op) => {
                const badge = getStanceBadge(op.stance);
                return (
                  <div
                    key={op.id}
                    className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-slate-900 dark:text-white">
                        {op.stockNameAr} ({op.symbol})
                      </h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${badge.classes}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{op.thesisNotes}</p>
                    <div className="flex justify-end">
                      <button
                        onClick={() =>
                          setPersonalOpinions((prev) => prev.filter((item) => item.id !== op.id))
                        }
                        className="text-xs text-rose-500 font-bold"
                      >
                        {isAr ? 'حذف' : 'Delete'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          MODAL 1: REAL MARKET TICKER DIRECTORY (دليل الأسهم الفعلي للفحص السريع)
         ===================================================================== */}
      {showCatalogModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {isAr
                    ? 'دليل الأسهم الفعلي في الأسواق — اضغط على أي سهم لفحص سعره الحي وإضافته'
                    : 'Real Market Ticker Directory — Click to Scan Live Price'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isAr
                    ? 'يجلب السعر الفعلي والتغير اليومي والدعوم والمقاومات من السوق مباشرة ويحفظها في سجلك الداخلي'
                    : 'Fetches actual price, daily change, and support/resistance from the market and saves locally'}
                </p>
              </div>
              <button
                onClick={() => setShowCatalogModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 p-1">
              {REAL_MARKET_TICKER_CATALOG.map((item) => {
                const alreadyAdded = stocks.some(
                  (s) => s.symbol.toUpperCase() === item.symbol.toUpperCase()
                );
                return (
                  <button
                    key={item.symbol}
                    disabled={isScanningMarket}
                    onClick={() => {
                      handleFetchSingleLiveStock(item.symbol, item.market, item);
                    }}
                    className={`p-3 rounded-xl border text-start transition-all flex items-center justify-between ${
                      alreadyAdded
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-400'
                        : 'bg-slate-50 hover:bg-indigo-50 dark:bg-slate-900 dark:hover:bg-indigo-950/40 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">
                        {isAr ? item.nameAr : item.nameEn}
                      </div>
                      <div className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">
                        {item.symbol} • {item.currency}
                      </div>
                    </div>
                    <RefreshCw
                      className={`w-4 h-4 ${
                        alreadyAdded ? 'text-emerald-600' : 'text-indigo-500'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end">
              <button
                onClick={() => setShowCatalogModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-black"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: CONFIRM CLEAR ALL DATA MODAL (تأكيد مسح كافة البيانات الحالية)
         ===================================================================== */}
      {confirmClearModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-rose-500/50 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {isAr
                ? 'هل أنت متأكد من مسح جميع البيانات الحالية؟'
                : 'Clear All Current Internal Data?'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {isAr
                ? 'سيتم مسح كافة الأسهم المضافة، عمليات الشراء والبيع، الخطط، والآراء الشخصية من التسجيل الداخلي لمتصفحك لتعود المنصة فارغة تماماً.'
                : 'This will permanently clear all saved stocks, portfolio transactions, trade plans, and personal opinions from your browser storage.'}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setConfirmClearModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-xs font-bold"
              >
                {isAr ? 'تراجع' : 'Cancel'}
              </button>
              <button
                onClick={handleClearAllData}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-lg"
              >
                {isAr ? 'نعم، مسح كافة البيانات الآن' : 'Yes, Clear Everything'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 3: BUY / SELL EXECUTION WITH MANDATORY DISCLAIMER CHECK
         ===================================================================== */}
      {tradeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {tradeForm.type === 'buy'
                  ? isAr
                    ? 'تسجيل عملية شراء أسهم بالمحفظة الداخلية'
                    : 'Record Stock Buy Order'
                  : isAr
                  ? 'تسجيل عملية بيع أسهم بالمحفظة الداخلية'
                  : 'Record Stock Sell Order'}
              </h3>
              <button
                onClick={() => setTradeModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteTrade} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTradeForm((prev) => ({ ...prev, type: 'buy' }))}
                  className={`py-2.5 rounded-xl text-xs font-black ${
                    tradeForm.type === 'buy'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700'
                  }`}
                >
                  {isAr ? 'شراء (Buy)' : 'BUY'}
                </button>
                <button
                  type="button"
                  onClick={() => setTradeForm((prev) => ({ ...prev, type: 'sell' }))}
                  className={`py-2.5 rounded-xl text-xs font-black ${
                    tradeForm.type === 'sell'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700'
                  }`}
                >
                  {isAr ? 'بيع (Sell)' : 'SELL'}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">
                    {isAr ? 'الكمية' : 'Quantity'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={tradeForm.quantity}
                    onChange={(e) =>
                      setTradeForm((prev) => ({ ...prev, quantity: Number(e.target.value) }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 text-sm font-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">
                    {isAr ? 'سعر التنفيذ' : 'Price'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={tradeForm.price}
                    onChange={(e) =>
                      setTradeForm((prev) => ({ ...prev, price: Number(e.target.value) }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 text-sm font-black text-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">
                    {isAr ? 'العمولة' : 'Commission'}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={tradeForm.commission}
                    onChange={(e) =>
                      setTradeForm((prev) => ({ ...prev, commission: Number(e.target.value) }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 text-sm font-bold"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tradeForm.disclaimerAccepted}
                    onChange={(e) =>
                      setTradeForm((prev) => ({
                        ...prev,
                        disclaimerAccepted: e.target.checked,
                      }))
                    }
                    className="mt-1 rounded text-indigo-600"
                  />
                  <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 leading-relaxed">
                    {isAr
                      ? 'أقر وأوافق على إخلاء المسؤولية: هذه العملية تُحفظ داخلياً في جهازي لتوثيق محفظتي الشخصية فقط، والموقع للاسترشاد بدون أي توصيات بيع أو شراء.'
                      : 'I acknowledge: This record is saved locally on my device for personal tracking only. The site provides no financial recommendations.'}
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTradeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-xs font-bold"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl text-white text-xs font-black ${
                    tradeForm.type === 'buy' ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}
                >
                  {isAr ? 'تأكيد وحفظ داخلياً' : 'Confirm & Save Locally'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 4: ADD NEW CUSTOM STOCK
         ===================================================================== */}
      {addStockModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {isAr ? 'إضافة سهم يدوياً للتسجيل الداخلي' : 'Add Custom Stock Locally'}
              </h3>
              <button
                onClick={() => setAddStockModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomStock} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">
                    {isAr ? 'رمز السهم (Symbol)' : 'Symbol'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="1120.SR / COMI.CA"
                    value={newStockForm.symbol}
                    onChange={(e) =>
                      setNewStockForm((prev) => ({ ...prev, symbol: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">
                    {isAr ? 'اسم السهم' : 'Stock Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newStockForm.nameAr}
                    onChange={(e) =>
                      setNewStockForm((prev) => ({ ...prev, nameAr: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block font-bold mb-1">{isAr ? 'السعر الحالي' : 'Price'}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newStockForm.currentPrice}
                    onChange={(e) =>
                      setNewStockForm((prev) => ({
                        ...prev,
                        currentPrice: Number(e.target.value),
                      }))
                    }
                    className="w-full px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 font-black"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">
                    {isAr ? 'القيمة العادلة' : 'Fair Value'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newStockForm.estimatedFairValue}
                    onChange={(e) =>
                      setNewStockForm((prev) => ({
                        ...prev,
                        estimatedFairValue: Number(e.target.value),
                      }))
                    }
                    className="w-full px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 font-black text-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">{isAr ? 'الدعم 1' : 'Support 1'}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newStockForm.support1}
                    onChange={(e) =>
                      setNewStockForm((prev) => ({ ...prev, support1: Number(e.target.value) }))
                    }
                    className="w-full px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">
                    {isAr ? 'المقاومة 1' : 'Resistance 1'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newStockForm.resistance1}
                    onChange={(e) =>
                      setNewStockForm((prev) => ({
                        ...prev,
                        resistance1: Number(e.target.value),
                      }))
                    }
                    className="w-full px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddStockModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 font-bold"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-black"
                >
                  {isAr ? 'حفظ داخلياً' : 'Save Locally'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 5: FULL LEGAL DISCLAIMER & PRIVACY GUARANTEE MODAL
         ===================================================================== */}
      {showFullDisclaimerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border-2 border-amber-500/60 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {isAr
                      ? 'إخلاء المسؤولية وضمان الخصوصية والحفظ الداخلي الكامل'
                      : 'Legal Disclaimer & 100% Local Data Privacy Guarantee'}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowFullDisclaimerModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <p>
                <strong>1. البيانات تُحفظ داخلياً فقط — لا علاقة لنا ببياناتك:</strong> جميع الأسهم،
                الأسعار، المحافظ، عمليات الشراء والبيع، والخطط التي تدخلها تُحفظ في التسجيل الداخلي
                لمتصفحك وجهازك فقط (Local Storage). لا يمتلك الموقع أي قواعد بيانات سحابية لجمع
                بياناتك ولا نطلع عليها إطلاقاً.
              </p>
              <p>
                <strong>2. الغرض الاسترشادي فقط بدون توصيات:</strong> جميع الأسعار المجلوبة،
                المؤشرات الفنية، والإشارات المتغيرة هي لأغراض الاسترشاد التحليلي وتنظيم محفظتك
                الشخصية فقط، ولا تُعد بأي حال توصية مباشرة بالبيع أو الشراء.
              </p>
              <p>
                <strong>3. المسؤولية الكاملة للمستخدم:</strong> قرارات التداول والاستثمار وما يترتب
                عليها من ربح أو خسارة تقع على مسؤولية المستخدم وحده بالكامل.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end">
              <button
                onClick={() => setShowFullDisclaimerModal(false)}
                className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs sm:text-sm font-black"
              >
                {isAr ? 'قرأت وفهمت' : 'I Understand'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
