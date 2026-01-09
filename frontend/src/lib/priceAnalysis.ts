export type PricePoint = {
  price: number;
  quantity?: number;
};

export type PriceAnalysisResult = {
  average: number;
  median: number;
  recommended: number;
};

export function priceAnalysis(points: PricePoint[]): PriceAnalysisResult {
  if (!points.length) {
    return { average: 0, median: 0, recommended: 0 };
  }

  const sorted = [...points].sort((a, b) => a.price - b.price);
  const total = sorted.reduce((sum, point) => sum + point.price, 0);
  const average = total / sorted.length;
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0 ? (sorted[mid - 1].price + sorted[mid].price) / 2 : sorted[mid].price;

  const recommended = Math.round((median * 0.98 + average * 0.02) * 100) / 100;

  return {
    average: Number(average.toFixed(2)),
    median: Number(median.toFixed(2)),
    recommended
  };
}
