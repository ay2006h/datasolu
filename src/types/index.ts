export type Language = 'ar' | 'en';
export type Theme = 'light' | 'dark';
export type AppMode = 'home' | 'sales' | 'inventory';

export interface SalesColumnMapping {
  revenueCol: string;
  profitCol: string;
  costCol: string;
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
  costCol: string;
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

