export type Language = 'ar' | 'en';
export type Theme = 'light' | 'dark';
export type AppMode = 'home' | 'sales' | 'inventory' | 'stocks';

export interface SalesColumnMapping {
  revenueCol: string;
  revenueType?: 'total' | 'unit_price'; // 'total' = Total sales value, 'unit_price' = Unit selling price * Quantity
  profitCol: string;
  costCol: string;
  costType?: 'total' | 'unit_cost'; // 'total' = Total cost, 'unit_cost' = Unit cost price * Quantity
  qtyCol: string;
  categoryCol: string;
  regionCol: string;
  clientCol: string;
  salespersonCol: string;
  dateCol: string;
  statusCol: string;
}

export interface SalesSwotAnalysis {
  strengths: {
    id: string;
    title: string;
    detail: string;
    metric?: string;
  }[];
  weaknesses: {
    id: string;
    title: string;
    detail: string;
    metric?: string;
  }[];
  recommendations: {
    id: string;
    title: string;
    actionPlan: string;
    expectedImpact: string;
    priority: 'high' | 'medium';
  }[];
  summaryMetrics: {
    totalRevenue: number;
    totalProfit: number;
    totalCost: number;
    overallMarginPercent: number;
    avgOrderValue: number;
    topCategory: { name: string; revenue: number; sharePercent: number } | null;
    weakestCategory: { name: string; revenue: number; sharePercent: number } | null;
    topRegion: { name: string; revenue: number; sharePercent: number } | null;
    weakestRegion: { name: string; revenue: number; sharePercent: number } | null;
    topClient: { name: string; revenue: number; sharePercent: number } | null;
  };
}


export type ColumnDataType = 'number' | 'string' | 'date' | 'boolean' | 'status';
export type TimeGranularity = 'day' | 'month' | 'quarter' | 'year';

export interface ColumnInfo {
  name: string;
  type: ColumnDataType;
  sampleValues: any[];
  uniqueCount: number;
  hasNulls: boolean;
  min?: number;
  max?: number;
  avg?: number;
  sum?: number;
}

export interface SheetData {
  name: string;
  headers: string[];
  rows: Record<string, any>[];
  columns: ColumnInfo[];
  rowCount: number;
}

export interface WorkbookData {
  fileName: string;
  sheetNames: string[];
  activeSheet: string;
  sheets: Record<string, SheetData>;
  fileSize: number;
  uploadedAt: Date;
}

export interface KpiMetric {
  id: string;
  title: string;
  titleEn: string;
  value: number | string;
  formattedValue: string;
  changePercent?: number;
  trend?: 'up' | 'down' | 'neutral';
  color: 'emerald' | 'blue' | 'purple' | 'amber' | 'rose' | 'indigo';
  icon: string;
  subtitle?: string;
  sparkline?: number[];
}

export interface BusinessStatusSummary {
  overallHealthScore: number; // 0 - 100
  statusCounts: { status: string; count: number; percentage: number; color: string }[];
  targetAchievedPercent: number;
  totalVolume: number;
  completionRate: number;
}

export type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'area' | 'radar';
export type AggregationType = 'sum' | 'avg' | 'count' | 'min' | 'max';

export interface CustomChartConfig {
  id: string;
  title: string;
  chartType: ChartType;
  xAxisColumn: string;
  yAxisColumn: string;
  aggregation: AggregationType;
  groupByColumn?: string;
  sortBy?: 'value-desc' | 'value-asc' | 'label-asc';
  limit?: number;
}

export interface BusinessInsight {
  id: string;
  type: 'positive' | 'warning' | 'info' | 'opportunity';
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  metric?: string;
  impact?: 'high' | 'medium' | 'low';
}

export interface ActiveFilters {
  searchQuery: string;
  categoryFilter: { column: string; value: string } | null;
  dateRange: { start: string; end: string } | null;
  statusFilter: string | null;
}

export interface TimeComparisonPeriod {
  periodLabel: string;
  totalValue: number;
  avgValue: number;
  count: number;
  growthPercent?: number;
}

export type ItemMovementSpeed = 'fast' | 'medium' | 'slow';
export type RestockUrgency = 'critical' | 'needed' | 'sufficient' | 'overstock';

export interface ProductColumnMapping {
  itemNameCol: string;
  categoryCol: string;
  soldQtyCol: string;
  currentStockCol: string;
  revenueCol: string;
  revenueType?: 'total' | 'unit_price'; // 'total' = Total sales value, 'unit_price' = Unit selling price * Sold Quantity
  costCol: string;
  costType?: 'total' | 'unit_cost'; // 'total' = Total cost, 'unit_cost' = Unit cost price * Sold Quantity
  profitCol: string;
  dateCol: string;
}

export interface ProductAnalyticsItem {
  id: string;
  itemName: string;
  category: string;
  soldQty: number;
  currentStock: number | null;
  revenue: number;
  cost: number;
  profit: number;
  profitMarginPercent: number;
  unitPrice: number;
  unitProfit: number;
  dailyRunRate: number;
  daysOfInventoryLeft: number | null;
  movementSpeed: ItemMovementSpeed;
  qtySharePercent: number;
  revenueSharePercent: number;
  profitSharePercent: number;
  isKingItem: boolean;
  kingRank?: number;
  restockUrgency: RestockUrgency;
  suggestedOrderQty: number;
  transactionsCount: number;
}

export interface ProductAnalyticsSummary {
  totalUniqueItems: number;
  totalSoldQty: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  overallMarginPercent: number;
  analyzedDaysCount: number;
  fastMovingCount: number;
  mediumMovingCount: number;
  slowMovingCount: number;
  kingItemsCount: number;
  restockNeededCount: number;
  totalSuggestedOrderUnits: number;
  estimatedRestockCost: number;
  topKingItem: ProductAnalyticsItem | null;
  topSellingItem: ProductAnalyticsItem | null;
}

// ============================================================================
// STOCK MARKET & PORTFOLIO INTELLIGENCE TYPES
// ============================================================================

export type MarketRegion = 'saudi' | 'egypt' | 'us' | 'uae' | 'custom';

export type AnalyticalSignal =
  | 'strong_accumulation' // منطقة تجميع فني ومالي قوية (للاسترشاد)
  | 'positive_momentum'   // زخم إيجابي / قرب دعم
  | 'neutral_watch'       // منطقة محايدة / مراقبة
  | 'take_profit_zone'    // منطقة تشبع شرائي / جني أرباح محتمل
  | 'caution_risk';       // منطقة حذر / تقييم مرتفع

export type SitePickCategory =
  | 'growth'      // أسهم النمو القوي
  | 'value'       // أسهم القيمة العادلة المغرية
  | 'dividend'    // أسهم العوائد والتوزيعات
  | 'momentum'    // أسهم الزخم الفني الإيجابي
  | 'none';

export type PersonalStance =
  | 'very_bullish' // إيجابي جداً (متفائل بقوة)
  | 'bullish'      // متفائل بحذر
  | 'neutral'      // محايد / تحت المراقبة
  | 'bearish';     // سلبي / انتظار تصحيح

export interface StockHistoricalDay {
  date: string;        // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
  changePercent: number;
}

export interface StockItem {
  id: string;
  symbol: string;
  nameAr: string;
  nameEn: string;
  market: MarketRegion;
  currency: string;
  sectorAr: string;
  sectorEn: string;
  currentPrice: number;
  previousClose: number;
  changePercent: number;
  high52W: number;
  low52W: number;
  // Technical metrics
  rsi14: number;
  ma50: number;
  ma200: number;
  support1: number;
  support2: number;
  resistance1: number;
  resistance2: number;
  volumeTrend: 'high' | 'normal' | 'low';
  // Fundamental metrics
  peRatio: number;
  pbRatio: number;
  roePercent: number;
  dividendYieldPercent: number;
  estimatedFairValue: number;
  // Site Featured Pick & Analytical Evaluation (Guidance only)
  isSiteFavorite: boolean;
  sitePickCategory: SitePickCategory;
  siteAnalyticalScore: number; // 0 to 100
  analyticalSignal: AnalyticalSignal;
  siteRationaleAr: string;
  siteRationaleEn: string;
  // Historical recent prices & dates for chart + full previous days OHLCV table
  priceHistory: number[];
  priceDates?: string[];
  historicalDays?: StockHistoricalDay[];
  lastUpdatedAt?: string;
  // User customization
  isWatchlisted?: boolean;
}

export interface StockTransaction {
  id: string;
  stockId: string;
  symbol: string;
  stockNameAr: string;
  stockNameEn: string;
  market: MarketRegion;
  currency: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  commission: number;
  totalAmount: number; // For buy: qty*price + commission; For sell: qty*price - commission
  realizedPnL?: number; // Populated on sell transactions
  date: string;
  strategyTag: string;
  notes: string;
}

export interface PortfolioHolding {
  stockId: string;
  symbol: string;
  nameAr: string;
  nameEn: string;
  market: MarketRegion;
  currency: string;
  sectorAr: string;
  sectorEn: string;
  quantity: number;
  avgCostPrice: number;
  totalCost: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  weightPercent: number;
  stopLossPrice?: number;
  targetPrice?: number;
}

export interface StockTradePlan {
  id: string;
  stockId: string;
  symbol: string;
  stockNameAr: string;
  stockNameEn: string;
  currency: string;
  title: string;
  timeframe: 'intraday' | 'short_term' | 'swing' | 'long_term';
  entryPrice: number;
  stopLossPrice: number;
  target1Price: number;
  target2Price: number;
  target3Price?: number;
  plannedCapital: number;
  riskPercentOfCapital: number;
  recommendedShares: number;
  riskRewardRatio: number;
  bullScenario: string; // السيناريو الإيجابي
  baseScenario: string; // السيناريو الأساسي
  bearScenario: string; // السيناريو السلبي وخطة الطوارئ
  status: 'watching' | 'active' | 'target_hit' | 'stopped_out' | 'cancelled';
  createdAt: string;
}

export interface PersonalStockOpinion {
  id: string;
  stockId: string;
  symbol: string;
  stockNameAr: string;
  stockNameEn: string;
  stance: PersonalStance;
  personalTargetPrice: number;
  personalSupportNote: string;
  convictionLevel: number; // 1 to 5 stars
  thesisNotes: string;
  tags: string[];
  updatedAt: string;
}


