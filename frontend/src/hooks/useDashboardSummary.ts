import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

export type DashboardSummary = {
  balance_usd: number;
  balance_flp: string;
  balance_held?: number;
  balance_available?: number;
  listings: {
    total: number;
    draft: number;
    ready: number;
    onsale: number;
    sale_pending: number;
    sold: number;
    expired: number;
  };
  exchanges: {
    total: number;
    last_7_days: number;
    last_30_days: number;
    month_sales_count?: number;
  };
  kpis: {
    sales_per_week: number;
    sales_per_month: number;
    listings_on_sale: number;
    listings_sold_total: number;
    month_sales_count?: number;
  };
};

export function useDashboardSummary(month?: string) {
  const query = month ? `?month=${month}` : '';
  return useQuery({
    queryKey: ['dashboard-summary', month],
    queryFn: () => apiFetch<DashboardSummary>(`/dashboard/summary${query}`)
  });
}
