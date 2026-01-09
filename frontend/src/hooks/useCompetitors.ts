import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

export type Competitor = {
  id: string;
  name: string;
  slug?: string;
};

export function useCompetitors() {
  return useQuery({
    queryKey: ['competitors'],
    queryFn: () => apiFetch<Competitor[]>('/competitors')
  });
}

export function useCompetitor(id?: string) {
  return useQuery({
    queryKey: ['competitor', id],
    queryFn: () => apiFetch(`/competitors/${id}`),
    enabled: Boolean(id)
  });
}

export function useCompetitorAnalytics(id?: string) {
  return useQuery({
    queryKey: ['competitor-analytics', id],
    queryFn: () => apiFetch(`/competitors/${id}/analytics`),
    enabled: Boolean(id)
  });
}

export function useCreateCompetitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiFetch('/competitors', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitors'] });
    }
  });
}
