import { useQuery } from '@tanstack/react-query';
import { endpoints } from '../api';

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => endpoints.analytics.overview().then(res => res.data),
  });
}

export function useAnalyticsListings() {
  return useQuery({
    queryKey: ['analytics', 'listings'],
    queryFn: () => endpoints.analytics.listings().then(res => res.data),
  });
}

export function useAnalyticsSales() {
  return useQuery({
    queryKey: ['analytics', 'sales'],
    queryFn: () => endpoints.analytics.sales().then(res => res.data),
  });
}

export function useAnalyticsAlerts() {
  return useQuery({
    queryKey: ['analytics', 'alerts'],
    queryFn: () => endpoints.analytics.alerts().then(res => res.data),
    refetchInterval: 60000, // Refetch every minute
  });
}

