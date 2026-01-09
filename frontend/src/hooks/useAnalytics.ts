import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => apiFetch('/analytics/overview')
  });
}

export function useAnalyticsListings() {
  return useQuery({
    queryKey: ['analytics-listings'],
    queryFn: () => apiFetch('/analytics/listings')
  });
}

export function useAnalyticsSales() {
  return useQuery({
    queryKey: ['analytics-sales'],
    queryFn: () => apiFetch('/analytics/sales')
  });
}
