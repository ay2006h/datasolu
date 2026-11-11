import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  DEFAULT_STOCKS_DATA,
  DEFAULT_TRANSACTIONS,
  DEFAULT_TRADE_PLANS,
  DEFAULT_PERSONAL_OPINIONS,
  computePortfolioSummary,
  evaluateStockAnalyticalProfile,
} from '../utils/stockMarketData';
import {
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Star,
  Wallet,
  ShoppingCart,
  Compass,
  BookOpen,
  Lightbulb,
  Save,
  Download,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Target,
  Activity,
  Search,
  RefreshCw,
  FileSpreadsheet,
  Award,
  MessageSquare,
  Sliders,
  Info,
  Scale,
  Eye,
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

const STORAGE_KEY = 'datasolu_stock_platform_v1';

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
  // PERSISTENT STATE (Stocks, Cash, Transactions, Plans, Opinions, Journal)
  // =========================================================================
  const [stocks, setStocks] = useState<StockItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.stocks) && parsed.stocks.length > 0) return parsed.stocks;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_STOCKS_DATA;
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
    return 45000;
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
    return DEFAULT_TRANSACTIONS;
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
    return DEFAULT_TRADE_PLANS;
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
    return DEFAULT_PERSONAL_OPINIONS;
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
    return 'قواعدي الشخصية في التداول والاستثمار:\n1. عدم الدخول بكامل السيولة في سهم واحد (الحد الأقصى 25% لكل مركز).\n2. الالتزام الصارم بوقف الخسارة المحدد في الخطة قبل الشراء.\n3. التركيز على الأسهم ذات العائد القوي على حقوق الملكية والتدفقات النقدية المستقرة.\n4. عدم مطاردة الأسهم المتشبعة شرائياً (RSI فوق 70) وانتظار التصحيح قرب الدعوم.';
  });

  const [lastSavedAt, setLastSavedAt] = useState<string>('');
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [showFullDisclaimerModal, setShowFullDisclaimerModal] = useState<boolean>(false);

  // Auto-save to localStorage whenever data changes
  useEffect(() => {
    try {
      const payload = {
        stocks,
        cashBalance,
        transactions,
        tradePlans,
        personalOpinions,
        generalJournal,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setLastSavedAt(
        new Date().toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    } catch (e) {
      console.error('Failed to save stock data locally:', e);
    }
  }, [stocks, cashBalance, transactions, tradePlans, personalOpinions, generalJournal, isAr]);

  const showToast = (msg: string) => {
    setStatusBanner(msg);
    setTimeout(() => setStatusBanner(null), 3500);
  };

  // =========================================================================
  // FILTERS & SELECTION STATES
  // =========================================================================
  const [selectedMarket, setSelectedMarket] = useState<MarketRegion | 'all'>('all');
  const [selectedPickCategory, setSelectedPickCategory] = useState<SitePickCategory | 'all' | 'watchlist'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStockId, setSelectedStockId] = useState<string>(stocks[0]?.id || 'sa-1120');

  const selectedStock = useMemo(
    () => stocks.find((s) => s.id === selectedStockId) || stocks[0],
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
        const matchSector = s.sectorAr.toLowerCase().includes(q) || s.sectorEn.toLowerCase().includes(q);
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
    stockId: 'sa-1120',
    type: 'buy',
    quantity: 50,
    price: 88.4,
    commission: 12,
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
    const targetStock = stocks.find((s) => s.id === tradeForm.stockId);
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

    // Adjust cash balance automatically
    if (tradeForm.type === 'buy') {
      setCashBalance((prev) => Math.max(0, Number((prev - totalAmount).toFixed(2))));
    } else {
      setCashBalance((prev) => Number((prev + totalAmount).toFixed(2)));
    }

    setTradeModalOpen(false);
    showToast(
      isAr
        ? `تم تسجيل عملية ${tradeForm.type === 'buy' ? 'شراء' : 'بيع'} (${tradeForm.quantity} سهم - ${targetStock.nameAr}) وحفظها بالمحفظة بنجاح`
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
        Number((p * 0.94).toFixed(2)),
        Number((p * 0.95).toFixed(2)),
        Number((p * 0.96).toFixed(2)),
        Number((p * 0.955).toFixed(2)),
        Number((p * 0.97).toFixed(2)),
        Number((p * 0.98).toFixed(2)),
        Number((p * 0.975).toFixed(2)),
        Number((p * 0.985).toFixed(2)),
        Number((p * 0.99).toFixed(2)),
        Number((p * 0.995).toFixed(2)),
        p,
      ],
      isWatchlisted: true,
    };

    setStocks((prev) => [created, ...prev]);
    setSelectedStockId(created.id);
    setAddStockModalOpen(false);
    showToast(isAr ? `تمت إضافة السهم (${created.nameAr}) وحفظه بنجاح` : `Added stock ${created.symbol}`);
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
    stockId: 'sa-1120',
    title: 'خطة تجميع على دفعتين فوق مستوى الدعم',
    timeframe: 'swing',
    entryPrice: 87.5,
    stopLossPrice: 84.0,
    target1Price: 92.5,
    target2Price: 96.5,
    target3Price: 101.0,
    plannedCapital: 25000,
    riskPercentOfCapital: 1.5,
    bullScenario: 'اختراق المقاومة الأولى بأحجام تداول مرتفعة يدعم الوصول للهدف الثاني مع رفع الوقف لنقطة الدخول.',
    baseScenario: 'التحرك في القناة الصاعدة وتحقيق الهدف الأول 92.50 وجني 50% من الكمية.',
    bearScenario: 'الإغلاق اليومي أسفل وقف الخسارة 84.00 يلغي السيناريو الصاعد مؤقتاً ويتم الخروج لحماية رأس المال.',
  });

  // Sync planForm defaults when user selects a stock in Plan Builder
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

  // Live Risk/Reward & Position Sizing Calculation for Plan Form
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
    const st = stocks.find((s) => s.id === planForm.stockId);
    if (!st) return;

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
    showToast(isAr ? 'تم حفظ الخطة المحتملة والسيناريوهات بنجاح' : 'Trade plan saved successfully');
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
    stockId: 'sa-1120',
    stance: 'very_bullish',
    personalTargetPrice: 95,
    personalSupportNote: '85.00 دعم رئيسي للمحفظة',
    convictionLevel: 5,
    thesisNotes: '',
    tagsInput: 'سهم قيادي, توزيعات ونمو',
  });

  const handleSaveOpinion = (e: React.FormEvent) => {
    e.preventDefault();
    const st = stocks.find((s) => s.id === opinionForm.stockId);
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
      setPersonalOpinions((prev) => prev.map((item, idx) => (idx === existingIdx ? record : item)));
    } else {
      setPersonalOpinions((prev) => [record, ...prev]);
    }

    showToast(isAr ? `تم حفظ رأيك الشخصي حول (${st.nameAr}) بنجاح` : `Saved personal opinion for ${st.symbol}`);
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
        showToast(isAr ? 'تم استرجاع جميع بيانات المحفظة والخطط والآراء بنجاح' : 'Backup restored successfully');
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

    // Sheet 1: Portfolio Holdings
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

    // Sheet 2: Transactions Log
    const txRows = transactions.map((tx) => ({
      'التاريخ': tx.date,
      'نوع العملية': tx.type === 'buy' ? 'شراء' : 'بيع',
      'رمز السهم': tx.symbol,
      'اسم السهم': tx.stockNameAr,
      'الكمية': tx.quantity,
      'السعر': tx.price,
      'العمولة': tx.commission,
      'الإجمالي الصافي': Number(tx.totalAmount.toFixed(2)),
      'الربح المحقق (عند البيع)': typeof tx.realizedPnL === 'number' ? Number(tx.realizedPnL.toFixed(2)) : '-',
      'الاستراتيجية': tx.strategyTag,
      'ملاحظات': tx.notes,
    }));
    const wsTxs = XLSX.utils.json_to_sheet(txRows);
    XLSX.utils.book_append_sheet(wb, wsTxs, isAr ? 'سجل البيع والشراء' : 'Transactions');

    // Sheet 3: Trade Plans
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
    const wsPlans = XLSX.utils.json_to_sheet(planRows);
    XLSX.utils.book_append_sheet(wb, wsPlans, isAr ? 'الخطط المحتملة' : 'Trade_Plans');

    // Sheet 4: Personal Opinions & Site Picks
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
    const wsOpinions = XLSX.utils.json_to_sheet(opinionRows);
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
          const price = Number(r['السعر'] || r['السعر الحالي'] || r['Price'] || r['Close'] || 25) || 25;
          const fairVal = Number(r['القيمة العادلة'] || r['Fair Value'] || r['الهدف'] || price * 1.12) || Number((price * 1.12).toFixed(2));
          const support = Number(r['الدعم'] || r['Support'] || price * 0.94) || Number((price * 0.94).toFixed(2));
          const resistance = Number(r['المقاومة'] || r['Resistance'] || price * 1.08) || Number((price * 1.08).toFixed(2));
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
            isSiteFavorite: evalProf.score >= 82,
            sitePickCategory: evalProf.pickCategory,
            siteAnalyticalScore: evalProf.score,
            analyticalSignal: evalProf.signal,
            siteRationaleAr: String(
              r['ملاحظات'] ||
                r['التحليل'] ||
                'تم استيراد السهم من ملف الإكسيل وتقييمه آلياً بناءً على مستويات السعر والدعم والقيمة العادلة.'
            ),
            siteRationaleEn: 'Imported from Excel and evaluated automatically.',
            priceHistory: [
              Number((price * 0.95).toFixed(2)),
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
            ? `تم استيراد ${imported.length} سهم من ملف الإكسيل وتحليلها بنجاح`
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

  // Update Stock Live Price inline
  const handleInlinePriceUpdate = (stockId: string, newPrice: number) => {
    if (isNaN(newPrice) || newPrice <= 0) return;
    setStocks((prev) =>
      prev.map((s) => {
        if (s.id !== stockId) return s;
        const changePct =
          s.previousClose > 0
            ? Number((((newPrice - s.previousClose) / s.previousClose) * 100).toFixed(2))
            : 0;
        const newHist = [...s.priceHistory.slice(1), newPrice];
        return {
          ...s,
          currentPrice: newPrice,
          changePercent: changePct,
          priceHistory: newHist,
        };
      })
    );
  };

  // =========================================================================
  // STRATEGIC INSIGHTS & VISIONS GENERATOR (الرؤى الاستراتيجية الشاملة)
  // =========================================================================
  const strategicVisions = useMemo(() => {
    const visions: {
      id: string;
      type: 'positive' | 'warning' | 'opportunity' | 'info';
      title: string;
      detail: string;
      badge: string;
    }[] = [];

    // 1. Cash liquidity ratio vision
    const cashRatio =
      portfolio.totalPortfolioEquity > 0
        ? (cashBalance / portfolio.totalPortfolioEquity) * 100
        : 100;

    if (cashRatio > 45) {
      visions.push({
        id: 'v-cash-high',
        type: 'opportunity',
        title: isAr ? 'وفرة سيولة نقدية عالية بالمحفظة' : 'High Cash Liquidity Buffer',
        detail: isAr
          ? `تمثل السيولة النقدية حالياً ${cashRatio.toFixed(1)}% من إجمالي المحفظة. تمنحك هذه السيولة مرونة ممتازة لاقتناص الفرص عند مناطق الدعم دون الحاجة لبيع أسهمك الحالية.`
          : `Cash represents ${cashRatio.toFixed(1)}% of total equity, offering strong flexibility for dip buying near support zones.`,
        badge: `${cashRatio.toFixed(0)}% سيولة`,
      });
    } else if (cashRatio < 10 && portfolio.holdings.length > 0) {
      visions.push({
        id: 'v-cash-low',
        type: 'warning',
        title: isAr ? 'انخفاض نسبة السيولة النقدية الاحتياطية' : 'Low Cash Reserve Warning',
        detail: isAr
          ? `نسبة السيولة النقدية المتاحة (${cashRatio.toFixed(1)}%) أقل من الحد الاسترشادي الآمن (15% - 20%). يُفضل توفير جزء من السيولة عند جني الأرباح لمواجهة أي تقلبات بالسوق.`
          : `Available cash is only ${cashRatio.toFixed(1)}%. Consider maintaining a 15-20% cash reserve during profit-taking.`,
        badge: 'تنبيه سيولة',
      });
    }

    // 2. Concentration risk vision
    const topHolding = portfolio.holdings[0];
    if (topHolding && topHolding.weightPercent > 40) {
      visions.push({
        id: 'v-conc',
        type: 'warning',
        title: isAr
          ? `تركز مرتفع في سهم (${topHolding.nameAr})`
          : `High Concentration in ${topHolding.symbol}`,
        detail: isAr
          ? `يستحوذ سهم ${topHolding.nameAr} وحده على ${topHolding.weightPercent.toFixed(1)}% من القيمة السوقية للأسهم المملوكة. لتقليل المخاطر غير المنتظمة يُنصح بألا يتجاوز وزن السهم الواحد 25% إلى 30%.`
          : `${topHolding.symbol} accounts for ${topHolding.weightPercent.toFixed(1)}% of invested assets. Diversifying reduces single-stock risk.`,
        badge: `${topHolding.weightPercent.toFixed(0)}% تركز`,
      });
    } else if (portfolio.holdings.length >= 3) {
      visions.push({
        id: 'v-div-ok',
        type: 'positive',
        title: isAr ? 'توازن جيد في توزيع مراكز المحفظة' : 'Healthy Portfolio Diversification',
        detail: isAr
          ? `المحفظة موزعة على ${portfolio.holdings.length} أسهم في قطاعات متنوعة، مما يقلل من تذبذب العائد الكلي ويرفع كفاءة إدارة المخاطر.`
          : `Portfolio is spread across ${portfolio.holdings.length} positions, balancing sector exposure effectively.`,
        badge: 'تنويع صحي',
      });
    }

    // 3. Undervalued + Strong Support opportunities
    const goldenOpportunities = stocks.filter(
      (s) =>
        s.estimatedFairValue > s.currentPrice * 1.12 &&
        s.rsi14 < 62 &&
        s.siteAnalyticalScore >= 85
    );
    if (goldenOpportunities.length > 0) {
      const names = goldenOpportunities.map((g) => g.nameAr).join('، ');
      visions.push({
        id: 'v-golden',
        type: 'opportunity',
        title: isAr
          ? 'أسهم تجمع بين هامش أمان مالي وزخم فني متوازن (للاسترشاد)'
          : 'High Margin-of-Safety Analytical Candidates',
        detail: isAr
          ? `تُظهر المؤشرات الاسترشادية أن الأسهم التالية (${names}) تتداول بخصم يزيد عن 12% مقارنة بقيمتها العادلة التقديرية مع مؤشر RSI غير متشبع شرائياً.`
          : `${goldenOpportunities.map((g) => g.symbol).join(', ')} trade >12% below estimated fair value with healthy RSI levels.`,
        badge: `${goldenOpportunities.length} فرص تحليلية`,
      });
    }

    // 4. Overbought RSI alert
    const overboughtStocks = stocks.filter((s) => s.rsi14 >= 70);
    if (overboughtStocks.length > 0) {
      visions.push({
        id: 'v-rsi-high',
        type: 'info',
        title: isAr ? 'تنبيه تشبع شرائي فني (RSI > 70)' : 'Overbought Technical Alert (RSI > 70)',
        detail: isAr
          ? `الأسهم (${overboughtStocks.map((s) => s.nameAr).join('، ')}) وصلت إلى مناطق تشبع شرائي على مؤشر القوة النسبية؛ تاريخياً يفضل عدم المطاردة السعرية في القمم وانتظار تهدئة المؤشرات.`
          : `${overboughtStocks.map((s) => s.symbol).join(', ')} show RSI >= 70; avoid chasing highs and watch trailing stops.`,
        badge: 'حذر فني',
      });
    }

    return visions;
  }, [portfolio, cashBalance, stocks, isAr]);

  // Signal Badge Helper
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
        <div className="fixed bottom-6 end-6 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl border border-indigo-400 flex items-center gap-2.5 text-xs sm:text-sm font-extrabold animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0" />
          <span>{statusBanner}</span>
        </div>
      )}

      {/* =====================================================================
          1. PROMINENT LEGAL DISCLAIMER BANNER (إخلاء مسؤولية قانوني ومالي بارز)
         ===================================================================== */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50/90 to-rose-50/80 dark:from-amber-950/60 dark:via-slate-900 dark:to-rose-950/50 border-2 border-amber-400/70 dark:border-amber-600/60 p-4 sm:p-5 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-500/20 mt-0.5">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-600 text-white uppercase tracking-wide">
                  {isAr ? 'إخلاء مسؤولية هام جداً' : 'Legal Disclaimer'}
                </span>
                <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  {isAr
                    ? 'الموقع أداة تحليلية وتنظيمية للاسترشاد فقط — بدون أي توصيات بيع أو شراء'
                    : 'Guidance & Educational Platform Only — No Buy or Sell Recommendations'}
                </h2>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {isAr
                  ? 'جميع البيانات، المؤشرات الفنية والمالية، القيم العادلة التقديرية، و"ترشيحات المفضلة للموقع" المعروضة هنا هي لأغراض الاسترشاد التحليلي وتنظيم محفظتك وخططك الشخصية فقط، ولا تُعد بأي شكل من الأشكال توصية مباشرة بالبيع أو الشراء أو استشارة مالية ملزمة. قرارات التداول والاستثمار وما ينتج عنها من ربح أو خسارة تقع على عاتق ومسؤولية المستخدم وحده.'
                  : 'All data, technical/fundamental indicators, estimated fair values, and "Site Featured Picks" are strictly for analytical guidance and personal portfolio organization. They do NOT constitute financial advice or a recommendation to buy or sell any security. Trading decisions and resulting profits or losses are the sole responsibility of the user.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowFullDisclaimerModal(true)}
            className="self-start lg:self-center px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 border border-amber-500/40 text-amber-900 dark:text-amber-300 text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5"
          >
            <Scale className="w-4 h-4" />
            <span>{isAr ? 'قراءة نص إخلاء المسؤولية الكامل' : 'Full Disclaimer'}</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          2. PLATFORM HEADER, LIVE STATS & DATA PERSISTENCE TOOLBAR
         ===================================================================== */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 shadow-xl border border-indigo-500/30 relative overflow-hidden">
        <div className="absolute -top-24 -end-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-extrabold">
              <Activity className="w-3.5 h-3.5" />
              <span>
                {isAr
                  ? 'منصة البورصة المتكاملة — حفظ تلقائي للمحفظة والخطط والآراء الشخصية'
                  : 'Integrated Stock Intelligence — Auto-Saved Portfolio, Plans & Opinions'}
              </span>
              {lastSavedAt && (
                <span className="text-emerald-300 ms-1">
                  ({isAr ? `محفوظ تلقائياً ${lastSavedAt}` : `Saved ${lastSavedAt}`})
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight">
              {isAr
                ? 'مركز تحليل الأسهم، إدارة المحفظة، الخطط المحتملة والرأي الشخصي'
                : 'Stock Market Analysis, Portfolio Tracker, Trade Plans & Personal Thesis'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isAr
                ? 'تابع ترشيحات الموقع الاسترشادية، سجل رأيك الشخصي لكل سهم، نفّذ وتتبع عمليات الشراء والبيع الفعلية أو الافتراضية، وابنِ خطط التداول والسيناريوهات المحتملة مع حفظ كامل للبيانات.'
                : 'Explore analytical spotlights, record your personal thesis, execute & track buy/sell positions, and build risk-managed trade plans with persistent storage.'}
            </p>
          </div>

          {/* Data Persistence & Quick Actions Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setAddStockModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إضافة سهم جديد' : 'Add Stock'}</span>
            </button>

            <button
              onClick={() => excelInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold border border-indigo-400/40 transition-all"
              title={isAr ? 'استيراد قائمة أسهم وأسعار من ملف إكسيل' : 'Import stocks from Excel'}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{isAr ? 'استيراد أسهم Excel' : 'Import Excel'}</span>
            </button>

            <button
              onClick={handleExportAllToExcel}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-all"
              title={isAr ? 'تصدير المحفظة والصفقات والخطط والآراء إلى ملف إكسيل' : 'Export all to Excel'}
            >
              <Download className="w-4 h-4" />
              <span>{isAr ? 'تصدير المحفظة والخطط Excel' : 'Export Excel'}</span>
            </button>

            <button
              onClick={handleExportJsonBackup}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-all"
              title={isAr ? 'حفظ كافة المعلومات في ملف نسخة احتياطية على جهازك' : 'Save backup file'}
            >
              <Save className="w-4 h-4 text-emerald-300" />
              <span>{isAr ? 'حفظ نسخة احتياطية' : 'Backup JSON'}</span>
            </button>

            <button
              onClick={() => jsonInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-all"
              title={isAr ? 'استرجاع معلومات محفوظة مسبقاً' : 'Restore backup'}
            >
              <Upload className="w-4 h-4 text-sky-300" />
              <span>{isAr ? 'استرجاع بيانات' : 'Restore'}</span>
            </button>
          </div>
        </div>

        {/* Quick Portfolio & Platform Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-slate-400 block">
              {isAr ? 'إجمالي قيمة المحفظة' : 'Total Portfolio Equity'}
            </span>
            <span className="text-base sm:text-lg font-black text-white mt-0.5 block">
              {portfolio.totalPortfolioEquity.toLocaleString(undefined, { maximumFractionDigits: 0 })}
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
              {portfolio.totalUnrealizedPnL.toLocaleString(undefined, { maximumFractionDigits: 1 })} (
              {portfolio.totalUnrealizedPnLPercent.toFixed(1)}%)
            </span>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-slate-400 block">
              {isAr ? 'الأرباح المحققة (بعد البيع)' : 'Realized P&L'}
            </span>
            <span
              className={`text-base sm:text-lg font-black mt-0.5 block ${
                portfolio.totalRealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {portfolio.totalRealizedPnL >= 0 ? '+' : ''}
              {portfolio.totalRealizedPnL.toLocaleString(undefined, { maximumFractionDigits: 1 })}
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
              ? '1. ترشيحات المفضلة للموقع وفحص الأسهم'
              : '1. Site Featured Picks & Screener',
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
              ? `4. الرأي الشخصي والرؤى الاستراتيجية (${personalOpinions.length})`
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
          TAB 1: SITE FEATURED PICKS, MARKET SCREENER & DEEP-DIVE RADAR
         ===================================================================== */}
      {currentTab === 'stocks_overview' && (
        <div className="space-y-8">
          {/* Market Region Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/70">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 me-2">
                {isAr ? 'اختر السوق:' : 'Market:'}
              </span>
              {[
                { id: 'all', label: isAr ? 'جميع الأسواق' : 'All Markets' },
                { id: 'saudi', label: isAr ? 'السوق السعودي (تداول)' : 'Saudi (Tadawul)' },
                { id: 'egypt', label: isAr ? 'البورصة المصرية (EGX)' : 'Egypt (EGX)' },
                { id: 'us', label: isAr ? 'السوق الأمريكي (US)' : 'US Market' },
                { id: 'uae', label: isAr ? 'سوق الإمارات (DFM/ADX)' : 'UAE Market' },
                { id: 'custom', label: isAr ? 'أسهم مضافة/مستوردة' : 'Custom/Imported' },
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
                  isAr ? 'ابحث باسم السهم، الرمز، أو القطاع...' : 'Search symbol, name, sector...'
                }
                className="w-full ps-9 pe-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* SECTION A: SITE FEATURED PICKS (ترشيحات المفضلة للموقع - استرشادية) */}
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
                        ? 'ترشيحات المفضلة للموقع (نخبة الأسهم الاسترشادية)'
                        : 'Site Featured Analytical Spotlights'}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      {isAr ? 'للاسترشاد التحليلي فقط - ليست توصية' : 'Analytical Guidance Only'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isAr
                      ? 'أسهم مختارة آلياً وفق معايير القيمة العادلة، العائد على حقوق الملكية، التوزيعات النقدية، ومناطق الدعم الفنية (يمكنك إضافة أو إزالة أي سهم من المفضلة)'
                      : 'Curated stocks highlighted by fundamental value, ROE, dividend yield, and technical support.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {siteFavoriteStocks.map((stock) => {
                const upside =
                  stock.currentPrice > 0
                    ? ((stock.estimatedFairValue - stock.currentPrice) / stock.currentPrice) * 100
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
                      {/* Card Header */}
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

                      {/* Signal & Analytical Score */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold border ${signalInfo.classes}`}
                        >
                          {signalInfo.label}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-slate-500">
                            {isAr ? 'التقييم الاسترشادي:' : 'Score:'}
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-indigo-600 text-white text-xs font-black">
                            {stock.siteAnalyticalScore}/100
                          </span>
                        </div>
                      </div>

                      {/* Key Metrics Grid */}
                      <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-900/70 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                        <div>
                          <span className="text-[10px] text-slate-400 block">
                            {isAr ? 'القيمة العادلة التقديرية' : 'Est. Fair Value'}
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
                            {isAr ? 'مكرر P/E | توزيعات' : 'P/E | Div%'}
                          </span>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            {stock.peRatio}x | {stock.dividendYieldPercent}%
                          </span>
                        </div>
                      </div>

                      {/* Site Analytical Rationale */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                        <strong className="text-indigo-600 dark:text-indigo-400">
                          {isAr ? 'سبب الترشيح الاسترشادي: ' : 'Analytical Rationale: '}
                        </strong>
                        {isAr ? stock.siteRationaleAr : stock.siteRationaleEn}
                      </p>

                      {/* User Personal Opinion Preview if saved */}
                      {userOpinion && (
                        <div className="p-2.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-black text-amber-900 dark:text-amber-300 flex items-center gap-1">
                              <MessageSquare className="w-3.5 h-3.5" />
                              {isAr ? 'رأيي الشخصي المسجل:' : 'My Personal View:'}
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

                    {/* Quick Action Footer */}
                    <div
                      className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/70 flex items-center justify-between gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openTradeModal(stock, 'buy')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-colors"
                        >
                          {isAr ? 'شراء' : 'Buy'}
                        </button>
                        <button
                          onClick={() => openTradeModal(stock, 'sell')}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition-colors"
                        >
                          {isAr ? 'بيع' : 'Sell'}
                        </button>
                        <button
                          onClick={() => {
                            handlePlanStockSelect(stock.id);
                            handleTabSwitch('stocks_plans');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
                          title={isAr ? 'وضع خطة تداول محتملة للسهم' : 'Create Trade Plan'}
                        >
                          {isAr ? '+ خطة' : '+ Plan'}
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setOpinionForm((prev) => ({
                              ...prev,
                              stockId: stock.id,
                              personalTargetPrice: stock.estimatedFairValue,
                            }));
                            handleTabSwitch('stocks_opinions');
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                          title={isAr ? 'تدوين رأيي الشخصي' : 'Add Personal Opinion'}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleWatchlist(stock.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            stock.isWatchlisted
                              ? 'text-amber-400 bg-amber-50 dark:bg-amber-950/50'
                              : 'text-slate-400 hover:text-amber-400'
                          }`}
                          title={isAr ? 'إضافة/إزالة من مفضلتي الشخصية' : 'Toggle Watchlist'}
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

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
                      ? 'فحص تحليلي مفصل لحركة السعر، الدعوم والمقاومات، المؤشرات الفنية والمالية (للاسترشاد فقط)'
                      : 'Detailed analytical view of price action, support/resistance, and technical/fundamental metrics'}
                  </p>
                </div>

                {/* Inline Live Price Updater & Quick Trade Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-500">
                      {isAr ? 'تحديث السعر اللحظي:' : 'Live Price:'}
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
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-sm transition-all"
                  >
                    {isAr ? 'شراء السهم' : 'Buy Stock'}
                  </button>
                  <button
                    onClick={() => openTradeModal(selectedStock, 'sell')}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-sm transition-all"
                  >
                    {isAr ? 'بيع السهم' : 'Sell Stock'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Price Trajectory & Support/Resistance Chart (7 cols) */}
                <div className="lg:col-span-7 h-72 bg-slate-50/70 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <Line
                    data={{
                      labels: selectedStock.priceHistory.map((_, idx) =>
                        isAr ? `جلسة ${idx + 1}` : `T-${selectedStock.priceHistory.length - idx}`
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
                          label: isAr ? 'القيمة العادلة الاسترشادية' : 'Est. Fair Value',
                          data: selectedStock.priceHistory.map(() => selectedStock.estimatedFairValue),
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
                          grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
                        },
                      },
                    }}
                  />
                </div>

                {/* Technical & Fundamental Thermometer Cards (5 cols) */}
                <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 block">
                      {isAr ? 'مستويات الدعم الفنية' : 'Support Zones'}
                    </span>
                    <div className="text-sm font-black text-slate-900 dark:text-white mt-1">
                      {isAr ? 'دعم 1:' : 'S1:'} {selectedStock.support1} | {isAr ? 'دعم 2:' : 'S2:'}{' '}
                      {selectedStock.support2}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {isAr ? 'مناطق ارتداد ومراقبة' : 'Key demand levels'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60">
                    <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 block">
                      {isAr ? 'مستويات المقاومة الفنية' : 'Resistance Zones'}
                    </span>
                    <div className="text-sm font-black text-slate-900 dark:text-white mt-1">
                      {isAr ? 'مقاومة 1:' : 'R1:'} {selectedStock.resistance1} |{' '}
                      {isAr ? 'مقاومة 2:' : 'R2:'} {selectedStock.resistance2}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {isAr ? 'مناطق جني أرباح محتملة' : 'Supply / target zones'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60">
                    <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 block">
                      {isAr ? 'القوة النسبية (RSI 14)' : 'RSI (14) Momentum'}
                    </span>
                    <div className="text-sm font-black text-slate-900 dark:text-white mt-1">
                      {selectedStock.rsi14}{' '}
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        (
                        {selectedStock.rsi14 > 70
                          ? isAr
                            ? 'تشبع شرائي'
                            : 'Overbought'
                          : selectedStock.rsi14 < 35
                          ? isAr
                            ? 'تشبع بيعي'
                            : 'Oversold'
                          : isAr
                          ? 'نطاق صحي متوازن'
                          : 'Balanced'}
                        )
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      MA50: {selectedStock.ma50} | MA200: {selectedStock.ma200}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
                    <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 block">
                      {isAr ? 'المؤشرات المالية الأساسية' : 'Fundamental Valuation'}
                    </span>
                    <div className="text-sm font-black text-slate-900 dark:text-white mt-1">
                      P/E: {selectedStock.peRatio}x | ROE: {selectedStock.roePercent}%
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {isAr ? 'التوزيعات السنوية:' : 'Div Yield:'}{' '}
                      {selectedStock.dividendYieldPercent}%
                    </span>
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
                    ? 'جدول فحص الأسهم الشامل والمؤشرات الاسترشادية'
                    : 'Comprehensive Stock Screener & Guidance Indicators'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAr
                    ? 'اضغط على أي سهم لعرض الشارت الخاص به، أو استخدم الأزرار السريعة للشراء/البيع أو إضافته لترشيحات الموقع المفضلة'
                    : 'Click any row to inspect its chart, update price, or record a buy/sell action'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: isAr ? 'الكل' : 'All' },
                  { id: 'watchlist', label: isAr ? 'مفضلتي ⭐' : 'Watchlist ⭐' },
                  { id: 'growth', label: isAr ? 'أسهم النمو' : 'Growth' },
                  { id: 'value', label: isAr ? 'القيمة العادلة' : 'Value' },
                  { id: 'dividend', label: isAr ? 'التوزيعات' : 'Dividends' },
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
                      {isAr ? 'السعر الحالي' : 'Price'}
                    </th>
                    <th className="py-3.5 px-3 text-center">
                      {isAr ? 'القيمة العادلة التقديرية' : 'Fair Value'}
                    </th>
                    <th className="py-3.5 px-3 text-center">
                      {isAr ? 'الدعم / المقاومة' : 'Supp / Res'}
                    </th>
                    <th className="py-3.5 px-3 text-center">RSI (14)</th>
                    <th className="py-3.5 px-3 text-center">
                      {isAr ? 'مكرر P/E | توزيعات' : 'P/E | Div%'}
                    </th>
                    <th className="py-3.5 px-3 text-center">
                      {isAr ? 'الإشارة الاسترشادية' : 'Analytical Signal'}
                    </th>
                    <th className="py-3.5 px-3 text-center">
                      {isAr ? 'ترشيح الموقع' : 'Site Pick'}
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
                                st.isWatchlisted ? 'text-amber-400' : 'text-slate-300 hover:text-amber-400'
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

                        <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
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

                        <td className="py-3 px-3 text-center font-black">
                          <span
                            className={
                              st.rsi14 > 70
                                ? 'text-rose-600'
                                : st.rsi14 < 35
                                ? 'text-emerald-600'
                                : 'text-slate-700 dark:text-slate-200'
                            }
                          >
                            {st.rsi14}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center font-bold text-slate-600 dark:text-slate-300">
                          {st.peRatio}x | {st.dividendYieldPercent}%
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${sig.classes}`}
                          >
                            {sig.label}
                          </span>
                        </td>

                        <td
                          className="py-3 px-3 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => toggleSiteFavorite(st.id)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                              st.isSiteFavorite
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}
                          >
                            {st.isSiteFavorite
                              ? isAr
                                ? 'ضمن مفضلة الموقع ⭐'
                                : 'Featured ⭐'
                              : isAr
                              ? 'إضافة للمفضلة'
                              : 'Add Pick'}
                          </button>
                        </td>

                        <td
                          className="py-3 px-4 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => openTradeModal(st, 'buy')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                            >
                              {isAr ? 'شراء' : 'Buy'}
                            </button>
                            <button
                              onClick={() => openTradeModal(st, 'sell')}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold"
                            >
                              {isAr ? 'بيع' : 'Sell'}
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
        </div>
      )}

      {/* =====================================================================
          TAB 2: PORTFOLIO HOLDINGS, CASH MANAGEMENT & BUY/SELL TRACKER
         ===================================================================== */}
      {currentTab === 'stocks_portfolio' && (
        <div className="space-y-8">
          {/* Top Bar: Cash Balance Control & Quick Buy/Sell Button */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cash Balance Control Card */}
            <div className="rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 p-6 shadow-md flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
                    {isAr ? 'إدارة السيولة النقدية المتاحة بالمحفظة' : 'Portfolio Cash Management'}
                  </span>
                  <Wallet className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                  {cashBalance.toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {isAr
                    ? 'تُخصم قيمة الشراء تلقائياً من السيولة وتُضاف إليها عوائد البيع. يمكنك تعديل رصيد الكاش يدوياً هنا:'
                    : 'Buy orders deduct cash and sell orders credit cash automatically. Adjust cash balance below:'}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="number"
                  value={cashBalance}
                  onChange={(e) => setCashBalance(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white"
                />
                <button
                  onClick={() => openTradeModal(stocks[0], 'buy')}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black whitespace-nowrap shadow-sm"
                >
                  {isAr ? '+ تسجيل شراء / بيع' : '+ Record Trade'}
                </button>
              </div>
            </div>

            {/* Portfolio Allocation Doughnut Chart */}
            <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2 max-w-md">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {isAr
                    ? 'توزيع الأصول والأسهم المملوكة في المحفظة'
                    : 'Portfolio Asset & Stock Allocation'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {isAr
                    ? 'يوضح الرسم البياني الوزن النسبي لكل سهم مملوك بالإضافة إلى نسبة السيولة النقدية لضمان عدم التركز المفرط في سهم واحد.'
                    : 'Visualizes the weight of each stock position alongside available cash liquidity.'}
                </p>
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
                      {isAr ? 'عدد الصفقات الرابحة / الخاسرة' : 'Closed Win / Loss Trades'}
                    </span>
                    <span className="text-sm font-black text-emerald-600">
                      {portfolio.winTradesCount} {isAr ? 'رابحة' : 'Win'} /{' '}
                      <span className="text-rose-500">
                        {portfolio.lossTradesCount} {isAr ? 'خاسرة' : 'Loss'}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-48 h-48 flex-shrink-0">
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
                    plugins: {
                      legend: { display: false },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Active Holdings Table */}
          <div className="rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700/70 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {isAr
                    ? 'تتبع الأسهم المملوكة حالياً بالمحفظة (حساب تلقائي لمتوسط التكلفة والأرباح)'
                    : 'Active Portfolio Holdings & Live P&L Tracker'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAr
                    ? 'يمكنك تعديل السعر السوقي الحالي لأي سهم مباشرة في الجدول لترى تأثيره اللحظي على أرباح محفظتك'
                    : 'Update current market prices inline to see real-time unrealized P&L impact'}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-extrabold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'السهم' : 'Stock'}</th>
                    <th className="py-3.5 px-3 text-center">
                      {isAr ? 'الكمية المملوكة' : 'Qty'}
                    </th>
                    <th className="py-3.5 px-3 text-center">
                      {isAr ? 'متوسط سعر الشراء' : 'Avg Buy Cost'}
                    </th>
                    <th className="py-3.5 px-3 text-center">
                      {isAr ? 'إجمالي التكلفة' : 'Total Cost'}
                    </th>
                    <th className="py-3.5 px-3 text-center">
                      {isAr ? 'السعر الحالي (قابل للتحديث)' : 'Current Price'}
                    </th>
                    <th className="py-3.5 px-3 text-center">
                      {isAr ? 'القيمة السوقية' : 'Market Value'}
                    </th>
                    <th className="py-3.5 px-3 text-center">
                      {isAr ? 'صافي الربح / الخسارة' : 'Unrealized P&L'}
                    </th>
                    <th className="py-3.5 px-3 text-center">
                      {isAr ? 'الوزن %' : 'Weight %'}
                    </th>
                    <th className="py-3.5 px-4 text-center">
                      {isAr ? 'تعزيز / بيع' : 'Trade'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {portfolio.holdings.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400 font-bold">
                        {isAr
                          ? 'لا توجد أسهم مملوكة حالياً — اضغط على زر (شراء) لتسجيل أول صفقة في محفظتك'
                          : 'No active holdings yet. Click Buy to record your first position.'}
                      </td>
                    </tr>
                  ) : (
                    portfolio.holdings.map((h) => {
                      const stObj = stocks.find((s) => s.id === h.stockId) || stocks[0];
                      return (
                        <tr
                          key={h.stockId}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <div className="font-black text-slate-900 dark:text-white">
                              {isAr ? h.nameAr : h.nameEn}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {h.symbol} • {h.sectorAr}
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-center font-black text-slate-800 dark:text-slate-100">
                            {h.quantity.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-3 text-center font-bold text-slate-600 dark:text-slate-300">
                            {h.avgCostPrice.toFixed(2)} {h.currency}
                          </td>
                          <td className="py-3.5 px-3 text-center font-bold text-slate-700 dark:text-slate-200">
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
                              className="w-20 px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center font-black text-indigo-600 dark:text-indigo-400"
                            />
                          </td>
                          <td className="py-3.5 px-3 text-center font-black text-slate-900 dark:text-white">
                            {h.marketValue.toLocaleString(undefined, { maximumFractionDigits: 1 })}{' '}
                            {h.currency}
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
                          <td className="py-3.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                              {h.weightPercent.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => openTradeModal(stObj, 'buy')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                              >
                                {isAr ? '+ تعزيز' : '+ Buy'}
                              </button>
                              <button
                                onClick={() => openTradeModal(stObj, 'sell')}
                                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold"
                              >
                                {isAr ? 'بيع' : 'Sell'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transaction History Log */}
          <div className="rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700/70 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {isAr
                  ? 'سجل عمليات الشراء والبيع المحفوظة'
                  : 'Recorded Buy & Sell Transactions Log'}
              </h3>
              <span className="text-xs font-bold text-slate-400">
                {transactions.length} {isAr ? 'عمليات مسجلة' : 'Transactions'}
              </span>
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
                    <th className="py-3 px-3 text-center">
                      {isAr ? 'الربح المحقق' : 'Realized P&L'}
                    </th>
                    <th className="py-3 px-3 text-start">
                      {isAr ? 'السبب / الملاحظات' : 'Notes'}
                    </th>
                    <th className="py-3 px-3 text-center">{isAr ? 'حذف' : 'Delete'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono text-slate-500">{tx.date}</td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            tx.type === 'buy'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {tx.type === 'buy' ? (isAr ? 'شراء' : 'BUY') : isAr ? 'بيع' : 'SELL'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-black text-slate-900 dark:text-white">
                        {isAr ? tx.stockNameAr : tx.stockNameEn}{' '}
                        <span className="text-[10px] text-slate-400 font-mono">({tx.symbol})</span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold">{tx.quantity}</td>
                      <td className="py-3 px-3 text-center font-bold">
                        {tx.price} {tx.currency}
                      </td>
                      <td className="py-3 px-3 text-center font-black">
                        {tx.totalAmount.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                      </td>
                      <td className="py-3 px-3 text-center font-black">
                        {typeof tx.realizedPnL === 'number' ? (
                          <span
                            className={tx.realizedPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'}
                          >
                            {tx.realizedPnL >= 0 ? '+' : ''}
                            {tx.realizedPnL.toFixed(1)}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 me-1">
                          [{tx.strategyTag}]
                        </span>
                        {tx.notes}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() =>
                            setTransactions((prev) => prev.filter((item) => item.id !== tx.id))
                          }
                          className="p-1 text-slate-400 hover:text-rose-600"
                          title={isAr ? 'حذف العملية' : 'Delete transaction'}
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
        </div>
      )}

      {/* =====================================================================
          TAB 3: POTENTIAL TRADE PLANS, SCENARIOS & RISK CALCULATOR
         ===================================================================== */}
      {currentTab === 'stocks_plans' && (
        <div className="space-y-8">
          {/* Interactive Plan Builder & Position Size Calculator */}
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
                      : 'Trade Plan Builder, Risk Calculator & Scenario Planner'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isAr
                      ? 'حدد نقطة الدخول ووقف الخسارة والأهداف ليقوم النظام بحساب نسبة العائد للمخاطرة والكمية المثالية للشراء'
                      : 'Define entry, stop-loss, and targets to compute R:R ratio and optimal position size'}
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300">
                {isAr
                  ? 'أداة تخطيط شخصية استرشادية - ليست توصية'
                  : 'Personal Planning Tool Only'}
              </span>
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
                  {stocks.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.symbol} — {isAr ? st.nameAr : st.nameEn} ({st.currentPrice} {st.currency})
                    </option>
                  ))}
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
                  {isAr ? 'المدى الزمني للخطة' : 'Timeframe'}
                </label>
                <select
                  value={planForm.timeframe}
                  onChange={(e) =>
                    setPlanForm((prev) => ({ ...prev, timeframe: e.target.value as any }))
                  }
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="intraday">{isAr ? 'مضاربة لحظية / يومية' : 'Intraday'}</option>
                  <option value="short_term">{isAr ? 'قصير الأجل (أيام - أسابيع)' : 'Short Term'}</option>
                  <option value="swing">{isAr ? 'متوسط الأجل (Swing)' : 'Swing Trade'}</option>
                  <option value="long_term">{isAr ? 'استثمار طويل الأجل' : 'Long Term'}</option>
                </select>
              </div>
            </div>

            {/* Price Levels & Capital Risk Inputs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  {isAr ? 'سعر الدخول المستهدف' : 'Entry Price'}
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
                  {isAr ? 'سعر وقف الخسارة (Stop)' : 'Stop-Loss Price'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={planForm.stopLossPrice}
                  onChange={(e) =>
                    setPlanForm((prev) => ({ ...prev, stopLossPrice: Number(e.target.value) }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 text-sm font-black text-rose-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-600 mb-1">
                  {isAr ? 'الهدف الأول (T1)' : 'Target 1'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={planForm.target1Price}
                  onChange={(e) =>
                    setPlanForm((prev) => ({ ...prev, target1Price: Number(e.target.value) }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-sm font-black text-emerald-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-600 mb-1">
                  {isAr ? 'الهدف الثاني الرئيسي (T2)' : 'Target 2'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={planForm.target2Price}
                  onChange={(e) =>
                    setPlanForm((prev) => ({ ...prev, target2Price: Number(e.target.value) }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-sm font-black text-emerald-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  {isAr ? 'رأس المال المخصص' : 'Allocated Capital'}
                </label>
                <input
                  type="number"
                  value={planForm.plannedCapital}
                  onChange={(e) =>
                    setPlanForm((prev) => ({ ...prev, plannedCapital: Number(e.target.value) }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-black text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  {isAr ? 'نسبة المخاطرة المسموحة %' : 'Max Risk %'}
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-black text-amber-600"
                />
              </div>
            </div>

            {/* Live Position Sizing & Risk/Reward Output Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-indigo-50/80 dark:bg-indigo-950/40 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-800/70">
              <div>
                <span className="text-[11px] text-slate-500 block">
                  {isAr ? 'نسبة العائد للمخاطرة (R:R)' : 'Risk / Reward Ratio'}
                </span>
                <span
                  className={`text-base font-black ${
                    planMetrics.rrRatio >= 2 ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  1 : {planMetrics.rrRatio}{' '}
                  {planMetrics.rrRatio >= 2
                    ? isAr
                      ? '(ممتازة ✅)'
                      : '(Strong ✅)'
                    : isAr
                    ? '(تحتاج تحسين)'
                    : '(Low)'}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block">
                  {isAr ? 'الكمية المقترحة للشراء' : 'Suggested Position Size'}
                </span>
                <span className="text-base font-black text-indigo-700 dark:text-indigo-300">
                  {planMetrics.recommendedShares} {isAr ? 'سهم' : 'Shares'}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block">
                  {isAr ? 'أقصى خسارة محتملة عند الوقف' : 'Max Risk at Stop-Loss'}
                </span>
                <span className="text-base font-black text-rose-600">
                  -{planMetrics.maxRiskCash.toFixed(0)}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block">
                  {isAr ? 'الربح المتوقع عند الهدف الثاني' : 'Expected Profit at T2'}
                </span>
                <span className="text-base font-black text-emerald-600">
                  +{planMetrics.expectedProfitT2.toFixed(0)}
                </span>
              </div>
            </div>

            {/* 3 Scenarios Inputs (Bull / Base / Bear) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-emerald-700 dark:text-emerald-400 mb-1">
                  {isAr
                    ? '1. السيناريو الإيجابي (عند اختراق المقاومة)'
                    : '1. Bullish Scenario'}
                </label>
                <textarea
                  rows={2}
                  value={planForm.bullScenario}
                  onChange={(e) =>
                    setPlanForm((prev) => ({ ...prev, bullScenario: e.target.value }))
                  }
                  className="w-full p-2.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-indigo-700 dark:text-indigo-400 mb-1">
                  {isAr ? '2. السيناريو الأساسي المتوقع' : '2. Base Scenario'}
                </label>
                <textarea
                  rows={2}
                  value={planForm.baseScenario}
                  onChange={(e) =>
                    setPlanForm((prev) => ({ ...prev, baseScenario: e.target.value }))
                  }
                  className="w-full p-2.5 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/60 text-xs font-semibold text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-rose-700 dark:text-rose-400 mb-1">
                  {isAr
                    ? '3. السيناريو السلبي / خطة الطوارئ عند كسر الدعم'
                    : '3. Bearish / Contingency Plan'}
                </label>
                <textarea
                  rows={2}
                  value={planForm.bearScenario}
                  onChange={(e) =>
                    setPlanForm((prev) => ({ ...prev, bearScenario: e.target.value }))
                  }
                  className="w-full p-2.5 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60 text-xs font-semibold text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{isAr ? 'حفظ الخطة المحتملة والسيناريوهات' : 'Save Trade Plan'}</span>
              </button>
            </div>
          </form>

          {/* Saved Trade Plans Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tradePlans.map((plan) => {
              const stObj = stocks.find((s) => s.id === plan.stockId);
              return (
                <div
                  key={plan.id}
                  className="rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 p-6 shadow-md space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-black">
                          {plan.symbol}
                        </span>
                        <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                          {plan.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={plan.status}
                          onChange={(e) =>
                            setTradePlans((prev) =>
                              prev.map((p) =>
                                p.id === plan.id ? { ...p, status: e.target.value as any } : p
                              )
                            )
                          }
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-xs font-extrabold text-slate-800 dark:text-white"
                        >
                          <option value="watching">{isAr ? 'قيد المراقبة 👁️' : 'Watching'}</option>
                          <option value="active">{isAr ? 'تم الدخول والتفعيل ⚡' : 'Active'}</option>
                          <option value="target_hit">{isAr ? 'حققت الهدف ✅' : 'Target Hit'}</option>
                          <option value="stopped_out">{isAr ? 'ضربت الوقف 🛑' : 'Stopped Out'}</option>
                        </select>

                        <button
                          onClick={() =>
                            setTradePlans((prev) => prev.filter((p) => p.id !== plan.id))
                          }
                          className="p-1.5 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 block">
                          {isAr ? 'الدخول' : 'Entry'}
                        </span>
                        <span className="text-xs font-black text-indigo-600">
                          {plan.entryPrice}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">
                          {isAr ? 'وقف الخسارة' : 'Stop-Loss'}
                        </span>
                        <span className="text-xs font-black text-rose-600">
                          {plan.stopLossPrice}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">
                          {isAr ? 'الهدف 1 / 2' : 'T1 / T2'}
                        </span>
                        <span className="text-xs font-black text-emerald-600">
                          {plan.target1Price} / {plan.target2Price}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">
                          {isAr ? 'الكمية | R:R' : 'Shares | R:R'}
                        </span>
                        <span className="text-xs font-black text-slate-800 dark:text-white">
                          {plan.recommendedShares} | 1:{plan.riskRewardRatio}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/50">
                        <strong className="text-emerald-700 dark:text-emerald-300">
                          {isAr ? 'السيناريو الإيجابي: ' : 'Bull Case: '}
                        </strong>
                        <span className="text-slate-700 dark:text-slate-300">
                          {plan.bullScenario}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/50">
                        <strong className="text-indigo-700 dark:text-indigo-300">
                          {isAr ? 'السيناريو الأساسي: ' : 'Base Case: '}
                        </strong>
                        <span className="text-slate-700 dark:text-slate-300">
                          {plan.baseScenario}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-800/50">
                        <strong className="text-rose-700 dark:text-rose-300">
                          {isAr ? 'خطة الطوارئ (السلبي): ' : 'Bear Case: '}
                        </strong>
                        <span className="text-slate-700 dark:text-slate-300">
                          {plan.bearScenario}
                        </span>
                      </div>
                    </div>
                  </div>

                  {stObj && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700/70 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {isAr ? `السعر الحالي بالسوق: ${stObj.currentPrice}` : `Current: ${stObj.currentPrice}`}
                      </span>
                      <button
                        onClick={() => {
                          setTradeForm({
                            stockId: stObj.id,
                            type: 'buy',
                            quantity: plan.recommendedShares,
                            price: plan.entryPrice,
                            commission: 12,
                            strategyTag: plan.title,
                            notes: `تنفيذ شراء بناءً على الخطة المحتملة (وقف خسارة: ${plan.stopLossPrice} - هدف: ${plan.target2Price})`,
                            disclaimerAccepted: true,
                          });
                          setTradeModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all"
                      >
                        {isAr ? 'تحويل الخطة لعملية شراء بالمحفظة' : 'Execute Plan as Buy Order'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: PERSONAL OPINIONS, RESEARCH JOURNAL & STRATEGIC VISIONS
         ===================================================================== */}
      {currentTab === 'stocks_opinions' && (
        <div className="space-y-8">
          {/* SECTION 1: AUTOMATED STRATEGIC VISIONS & INSIGHTS (الرؤى الاستراتيجية) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {isAr
                    ? 'الرؤى الاستراتيجية الشاملة للمحفظة والأسواق (للاسترشاد)'
                    : 'Automated Strategic Portfolio & Market Visions'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAr
                    ? 'قراءة تحليلية آلية لتوازن محفظتك، توزيع السيولة، والفرص والتنبيهات الفنية في قائمة الأسهم'
                    : 'Automated diagnosis of portfolio concentration, cash buffer, and market technical alerts'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {strategicVisions.map((v) => (
                <div
                  key={v.id}
                  className={`p-5 rounded-2xl border-2 shadow-sm space-y-2 ${
                    v.type === 'positive'
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                      : v.type === 'warning'
                      ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                      : v.type === 'opportunity'
                      ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                      : 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      {v.title}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-white/80 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200">
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

          {/* SECTION 2: ADD / UPDATE PERSONAL OPINION FORM + GENERAL JOURNAL */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Personal Opinion Form (7 cols) */}
            <form
              onSubmit={handleSaveOpinion}
              className="lg:col-span-7 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 p-6 shadow-md space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-500" />
                  <span>
                    {isAr
                      ? 'تدوين وحفظ الرأي الشخصي والنظرة الخاصة لكل سهم'
                      : 'Record Personal Stock Opinion & Thesis'}
                  </span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    {isAr ? 'اختر السهم' : 'Select Stock'}
                  </label>
                  <select
                    value={opinionForm.stockId}
                    onChange={(e) => {
                      const st = stocks.find((s) => s.id === e.target.value);
                      const existing = personalOpinions.find((o) => o.stockId === e.target.value);
                      setOpinionForm({
                        stockId: e.target.value,
                        stance: existing?.stance || 'bullish',
                        personalTargetPrice:
                          existing?.personalTargetPrice || st?.estimatedFairValue || 50,
                        personalSupportNote:
                          existing?.personalSupportNote || `${st?.support1 || ''} منطقة دعم رئيسية`,
                        convictionLevel: existing?.convictionLevel || 4,
                        thesisNotes: existing?.thesisNotes || '',
                        tagsInput: existing ? existing.tags.join('، ') : 'متابعة شخصية, استثمار',
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-900 dark:text-white"
                  >
                    {stocks.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.symbol} — {isAr ? st.nameAr : st.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-900 dark:text-white"
                  >
                    <option value="very_bullish">
                      {isAr ? 'إيجابي جداً (قناعة استثمارية عالية)' : 'Very Bullish'}
                    </option>
                    <option value="bullish">{isAr ? 'متفائل بحذر' : 'Moderately Bullish'}</option>
                    <option value="neutral">
                      {isAr ? 'محايد / تحت المراقبة والانتظار' : 'Neutral / Watch'}
                    </option>
                    <option value="bearish">
                      {isAr ? 'سلبي / انتظار تصحيح سعري' : 'Bearish / Wait for Dip'}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    {isAr ? 'تقديري الشخصي للسعر المستهدف' : 'My Target Price'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={opinionForm.personalTargetPrice}
                    onChange={(e) =>
                      setOpinionForm((prev) => ({
                        ...prev,
                        personalTargetPrice: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-black text-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    {isAr ? 'مستوى القناعة (من 1 إلى 5 نجوم)' : 'Conviction (1-5)'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={opinionForm.convictionLevel}
                    onChange={(e) =>
                      setOpinionForm((prev) => ({
                        ...prev,
                        convictionLevel: Math.min(5, Math.max(1, Number(e.target.value))),
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-black text-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  {isAr
                    ? 'تفاصيل رأيي الشخصي وملاحظاتي المالية والفنية حول السهم'
                    : 'Detailed Personal Thesis & Notes'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={opinionForm.thesisNotes}
                  onChange={(e) =>
                    setOpinionForm((prev) => ({ ...prev, thesisNotes: e.target.value }))
                  }
                  placeholder={
                    isAr
                      ? 'اكتب أسباب قناعتك بالسهم، ملاحظاتك حول القوائم المالية، التوزيعات، أو مناطق الدخول التي تنتظرها...'
                      : 'Write your personal investment thesis, earnings notes, or entry criteria...'
                  }
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md transition-all flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{isAr ? 'حفظ الرأي الشخصي' : 'Save Personal Opinion'}</span>
                </button>
              </div>
            </form>

            {/* General Personal Market Journal (5 cols) */}
            <div className="lg:col-span-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 p-6 shadow-md flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-amber-500" />
                    <span>
                      {isAr
                        ? 'مفكرة قواعدي ورؤيتي الشخصية للسوق'
                        : 'Personal Market Rules & Journal'}
                    </span>
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-600">
                    {isAr ? 'حفظ تلقائي فوري' : 'Auto-saved'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {isAr
                    ? 'سجل هنا خطتك العامة للسوق، قواعد إدارة المخاطر الخاصة بك، والدروس المستفادة من تداولاتك:'
                    : 'Write your overarching trading rules, macro observations, and lessons learned:'}
                </p>
              </div>

              <textarea
                rows={7}
                value={generalJournal}
                onChange={(e) => setGeneralJournal(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-amber-50/50 dark:bg-slate-900 border border-amber-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed"
              />
            </div>
          </div>

          {/* Saved Personal Opinions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {personalOpinions.map((op) => {
              const st = stocks.find((s) => s.id === op.stockId);
              const badge = getStanceBadge(op.stance);
              return (
                <div
                  key={op.id}
                  className="rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 p-5 shadow-md flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400">
                          {op.symbol}
                        </span>
                        <h4 className="text-base font-black text-slate-900 dark:text-white">
                          {isAr ? op.stockNameAr : op.stockNameEn}
                        </h4>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${badge.classes}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl">
                      <div>
                        <span className="text-[10px] text-slate-400 block">
                          {isAr ? 'هدفي الشخصي' : 'My Target'}
                        </span>
                        <span className="font-black text-emerald-600">
                          {op.personalTargetPrice} {st?.currency || ''}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">
                          {isAr ? 'تقييم الموقع الاسترشادي' : 'Site Fair Value'}
                        </span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {st ? st.estimatedFairValue : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">
                          {isAr ? 'القناعة' : 'Conviction'}
                        </span>
                        <span className="font-black text-amber-500">
                          {'★'.repeat(op.convictionLevel)}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {op.thesisNotes}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      {isAr ? `آخر تحديث: ${op.updatedAt}` : `Updated: ${op.updatedAt}`}
                    </span>
                    <button
                      onClick={() =>
                        setPersonalOpinions((prev) => prev.filter((item) => item.id !== op.id))
                      }
                      className="text-xs text-rose-500 hover:underline font-bold"
                    >
                      {isAr ? 'حذف' : 'Delete'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 1: BUY / SELL EXECUTION WITH MANDATORY DISCLAIMER CHECK
         ===================================================================== */}
      {tradeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {tradeForm.type === 'buy'
                  ? isAr
                    ? 'تسجيل عملية شراء أسهم بالمحفظة'
                    : 'Record Stock Buy Order'
                  : isAr
                  ? 'تسجيل عملية بيع أسهم بالمحفظة'
                  : 'Record Stock Sell Order'}
              </h3>
              <button
                onClick={() => setTradeModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteTrade} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTradeForm((prev) => ({ ...prev, type: 'buy' }))}
                  className={`py-2.5 rounded-xl text-xs font-black transition-all ${
                    tradeForm.type === 'buy'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {isAr ? 'عملية شراء (Buy)' : 'BUY Order'}
                </button>
                <button
                  type="button"
                  onClick={() => setTradeForm((prev) => ({ ...prev, type: 'sell' }))}
                  className={`py-2.5 rounded-xl text-xs font-black transition-all ${
                    tradeForm.type === 'sell'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {isAr ? 'عملية بيع (Sell)' : 'SELL Order'}
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  {isAr ? 'السهم' : 'Stock'}
                </label>
                <select
                  value={tradeForm.stockId}
                  onChange={(e) => {
                    const st = stocks.find((s) => s.id === e.target.value);
                    setTradeForm((prev) => ({
                      ...prev,
                      stockId: e.target.value,
                      price: st ? st.currentPrice : prev.price,
                    }));
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-900 dark:text-white"
                >
                  {stocks.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.symbol} — {isAr ? st.nameAr : st.nameEn} ({st.currentPrice} {st.currency})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    {isAr ? 'الكمية (عدد الأسهم)' : 'Quantity'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={tradeForm.quantity}
                    onChange={(e) =>
                      setTradeForm((prev) => ({ ...prev, quantity: Number(e.target.value) }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    {isAr ? 'سعر التنفيذ للحبة' : 'Execution Price'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={tradeForm.price}
                    onChange={(e) =>
                      setTradeForm((prev) => ({ ...prev, price: Number(e.target.value) }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-black text-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    {isAr ? 'عمولة التداول' : 'Commission'}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={tradeForm.commission}
                    onChange={(e) =>
                      setTradeForm((prev) => ({ ...prev, commission: Number(e.target.value) }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  {isAr ? 'سبب العملية / ملاحظات' : 'Strategy / Notes'}
                </label>
                <input
                  type="text"
                  value={tradeForm.notes}
                  onChange={(e) => setTradeForm((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder={
                    isAr
                      ? 'مثال: شراء دفعة أولى عند الدعم / جني أرباح جزئي...'
                      : 'e.g. Support bounce entry / partial profit taking...'
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              {/* Mandatory Disclaimer Check inside Buy/Sell Modal */}
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 space-y-2">
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
                      ? 'أقر وأوافق على إخلاء المسؤولية: هذه العملية لتوثيق وتتبع محفظتي الشخصية، والموقع أداة للاسترشاد التحليلي فقط بدون أي توصيات ملزمة بالبيع أو الشراء، وأتحمل كامل المسؤولية عن قراراتي الاستثمارية.'
                      : 'I acknowledge the disclaimer: This platform is strictly for personal tracking and analytical guidance without buy/sell recommendations. I bear full responsibility for my trading decisions.'}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs font-black text-slate-700 dark:text-slate-200">
                  {isAr ? 'الإجمالي الصافي:' : 'Net Total:'}{' '}
                  {(
                    tradeForm.quantity * tradeForm.price +
                    (tradeForm.type === 'buy' ? tradeForm.commission : -tradeForm.commission)
                  ).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTradeModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className={`px-5 py-2 rounded-xl text-white text-xs font-black shadow-md ${
                      tradeForm.type === 'buy'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                  >
                    {tradeForm.type === 'buy'
                      ? isAr
                        ? 'تأكيد وحفظ الشراء'
                        : 'Confirm Buy'
                      : isAr
                      ? 'تأكيد وحفظ البيع'
                      : 'Confirm Sell'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: ADD NEW CUSTOM STOCK
         ===================================================================== */}
      {addStockModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {isAr ? 'إضافة سهم جديد للمنصة والمفضلة' : 'Add Custom Stock'}
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
                    placeholder="e.g. 1150.SR / HRHO.CA"
                    value={newStockForm.symbol}
                    onChange={(e) =>
                      setNewStockForm((prev) => ({ ...prev, symbol: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">
                    {isAr ? 'اسم السهم بالعربية' : 'Stock Name'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isAr ? 'مثال: مصرف الإنماء' : 'Alinma Bank'}
                    value={newStockForm.nameAr}
                    onChange={(e) =>
                      setNewStockForm((prev) => ({ ...prev, nameAr: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold mb-1">{isAr ? 'السوق' : 'Market'}</label>
                  <select
                    value={newStockForm.market}
                    onChange={(e) =>
                      setNewStockForm((prev) => ({
                        ...prev,
                        market: e.target.value as MarketRegion,
                      }))
                    }
                    className="w-full px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="saudi">{isAr ? 'السعودي' : 'Saudi'}</option>
                    <option value="egypt">{isAr ? 'المصري' : 'Egypt'}</option>
                    <option value="us">{isAr ? 'الأمريكي' : 'US'}</option>
                    <option value="uae">{isAr ? 'الإماراتي' : 'UAE'}</option>
                    <option value="custom">{isAr ? 'أخرى' : 'Custom'}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">{isAr ? 'العملة' : 'Currency'}</label>
                  <input
                    type="text"
                    value={newStockForm.currency}
                    onChange={(e) =>
                      setNewStockForm((prev) => ({ ...prev, currency: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">{isAr ? 'القطاع' : 'Sector'}</label>
                  <input
                    type="text"
                    value={newStockForm.sectorAr}
                    onChange={(e) =>
                      setNewStockForm((prev) => ({ ...prev, sectorAr: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
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
                    className="w-full px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-black"
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
                    className="w-full px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-black text-emerald-600"
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
                    className="w-full px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
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
                    className="w-full px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">
                  {isAr ? 'ملخص التحليل الاسترشادي للسهم' : 'Analytical Rationale'}
                </label>
                <textarea
                  rows={2}
                  value={newStockForm.siteRationaleAr}
                  onChange={(e) =>
                    setNewStockForm((prev) => ({ ...prev, siteRationaleAr: e.target.value }))
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                />
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
                  {isAr ? 'حفظ وإضافة السهم' : 'Save Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 3: FULL LEGAL DISCLAIMER MODAL (نص إخلاء المسؤولية الكامل)
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
                      ? 'إخلاء مسؤولية قانوني ومالي شامل — منصة DataSolu'
                      : 'Comprehensive Financial & Legal Disclaimer'}
                  </h3>
                  <span className="text-xs font-bold text-rose-600">
                    {isAr
                      ? 'يرجى القراءة بعناية قبل استخدام أدوات البورصة والبيع والشراء'
                      : 'Please read carefully before using stock analysis & portfolio tools'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowFullDisclaimerModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <p>
                <strong>1. الغرض الاسترشادي والتعليمي فقط:</strong> إن جميع المعلومات، الأسعار،
                المؤشرات الفنية والمالية، حسابات القيمة العادلة، و"ترشيحات المفضلة للموقع" الواردة
                في قسم تحليل البورصة بمنصة <strong>DataSolu BI Pro</strong> هي لأغراض{' '}
                <span className="underline font-black text-rose-600 dark:text-rose-400">
                  الاسترشاد التحليلي، التعليم، وتنظيم المحفظة والخطط الشخصية فقط
                </span>
                .
              </p>
              <p>
                <strong>2. عدم تقديم توصيات بيع أو شراء:</strong> لا يمثل الموقع أو القائمون عليه
                مستشاراً مالياً مرخصاً أو وسيط أوراق مالية، ولا يُعد أي محتوى معروض في المنصة دعوة
                أو نصيحة أو توصية مباشرة أو غير مباشرة لشراء أو بيع أو الاحتفاظ بأي سهم أو ورقة
                مالية في أي سوق مالي.
              </p>
              <p>
                <strong>3. المسؤولية الكاملة للمستخدم في البيع والشراء:</strong> التداول والاستثمار
                في أسواق الأسهم ينطوي على مخاطر مالية وتقلبات سعرية قد تؤدي إلى خسارة جزء من رأس
                المال أو كله. أي قرارات بالبيع أو الشراء يتخذها المستخدم تكون بناءً على بحثه
                وقناعته الشخصية ومسؤوليته المنفردة، ويُخلي الموقع مسؤوليته القانونية والمالية
                الكاملة عن أي أرباح أو خسائر تنتج عن استخدام هذه البيانات أو الأدوات.
              </p>
              <p>
                <strong>4. حفظ البيانات والخصوصية:</strong> كافة عمليات الشراء والبيع والخطط والآراء
                الشخصية التي يدونها المستخدم تُحفظ محلياً داخل متصفحه أو في ملفات النسخ الاحتياطي
                الخاصة به لتسهيل متابعته لمحفظته.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end">
              <button
                onClick={() => setShowFullDisclaimerModal(false)}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black shadow-md transition-all"
              >
                {isAr
                  ? 'قرأت وفهمت إخلاء المسؤولية (الموقع للاسترشاد فقط)'
                  : 'I Understand & Acknowledge'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
