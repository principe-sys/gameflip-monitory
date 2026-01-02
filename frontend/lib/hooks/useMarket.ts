import { useQuery } from '@tanstack/react-query';
import { endpoints } from '../api';
import { calculatePriceStats, normalizeName, PriceStats } from '../utils/priceAnalysis';

export function useMarketSearch(params?: {
  keywords?: string;
  platform?: string;
  category?: string;
  status?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['market', 'search', params],
    queryFn: async () => {
      const response = await endpoints.market.search({
        ...params,
        status: params?.status || 'onsale',
        limit: params?.limit || 100,
      });
      
      // Backend returns { listings: [...], found: ..., next_page: ... }
      const listings = Array.isArray(response.data)
        ? response.data
        : (response.data?.listings || response.data?.data || []);
      
      // Calcular estadísticas de precios
      const prices = listings
        .map((l: any) => l.price)
        .filter((p: any) => typeof p === 'number' && p > 0);
      
      const stats = calculatePriceStats(prices);
      
      return {
        listings,
        stats,
        count: listings.length,
        found: response.data?.found || listings.length,
        next_page: response.data?.next_page || null,
      };
    },
    enabled: !!(params?.keywords || params?.platform || params?.category),
  });
}

export function usePriceComparison(
  myListings: any[],
  competitorListings: any[]
) {
  return useQuery({
    queryKey: ['market', 'comparison', myListings.length, competitorListings.length],
    queryFn: () => {
      const myMap = new Map(
        myListings.map((l: any) => [normalizeName(l.name), l])
      );
      
      const matches: any[] = [];
      const opportunities: any[] = [];
      
      competitorListings.forEach((comp: any) => {
        const key = normalizeName(comp.name);
        const mine = myMap.get(key);
        
        if (mine) {
          matches.push({
            name: comp.name,
            competitor_price: comp.price,
            my_price: mine.price,
            price_difference: comp.price - mine.price,
            price_difference_percent: ((comp.price - mine.price) / comp.price) * 100,
            recommendation: comp.price < mine.price ? 'lower_price' : 'competitor_higher',
          });
        } else {
          opportunities.push({
            name: comp.name,
            price: comp.price,
            category: comp.category,
            platform: comp.platform,
          });
        }
      });
      
      return { matches, opportunities };
    },
    enabled: myListings.length > 0 || competitorListings.length > 0,
  });
}

