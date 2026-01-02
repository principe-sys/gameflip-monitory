import { useQuery } from '@tanstack/react-query';
import { endpoints } from '../api';

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => endpoints.dashboard.summary().then(res => res.data),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useDashboardListings(status?: string) {
  return useQuery({
    queryKey: ['dashboard', 'listings', status],
    queryFn: () => endpoints.dashboard.listings(status).then(res => res.data),
  });
}

