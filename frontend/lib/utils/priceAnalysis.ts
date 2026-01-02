export interface PriceStats {
  count: number;
  min: number;
  p25: number;
  median: number;
  mean: number;
  p75: number;
  max: number;
  undercut: number;
}

export function calculatePriceStats(prices: number[]): PriceStats | null {
  if (!prices || prices.length === 0) return null;
  
  const sorted = [...prices].sort((a, b) => a - b);
  const count = sorted.length;
  const min = sorted[0];
  const max = sorted[count - 1];
  const median = sorted[Math.floor(count / 2)];
  const p25 = sorted[Math.floor(count * 0.25)];
  const p75 = sorted[Math.floor(count * 0.75)];
  const mean = sorted.reduce((sum, p) => sum + p, 0) / count;
  
  // Undercut: precio mínimo menos 1 centavo (mínimo 1)
  const undercut = Math.max(1, min - 1);
  
  return { count, min, p25, median, mean, p75, max, undercut };
}

export function charm9(price: number): number {
  // Redondeo psicológico: acaba en 9 centavos
  if (price <= 9) return price;
  return Math.floor(price / 10) * 10 + 9;
}

export function normalizeName(name: string): string {
  return (name || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

export function calculateRecommendedPrice(
  stats: PriceStats,
  cost?: number,
  desiredMargin: number = 0,
  undercutMin: number = 0
): number {
  let recommended = stats.undercut;
  
  if (undercutMin > 0 && stats.min) {
    recommended = Math.max(recommended, stats.min - undercutMin);
  }
  
  if (cost !== undefined && cost !== null && desiredMargin > 0) {
    recommended = Math.max(recommended, cost + desiredMargin);
  }
  
  return Math.max(1, Math.floor(recommended));
}

