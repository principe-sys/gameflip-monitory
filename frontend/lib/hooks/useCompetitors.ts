import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { endpoints } from '../api';

export function useCompetitors() {
  return useQuery({
    queryKey: ['competitors'],
    queryFn: () => endpoints.competitors.list().then(res => res.data),
  });
}

export function useCompetitor(id: string) {
  return useQuery({
    queryKey: ['competitors', id],
    queryFn: () => endpoints.competitors.get(id).then(res => res.data),
    enabled: !!id,
  });
}

export function useCompetitorListings(id: string, params?: any) {
  return useQuery({
    queryKey: ['competitors', id, 'listings', params],
    queryFn: () => endpoints.competitors.listings(id, params).then(res => res.data),
    enabled: !!id,
  });
}

export function useCompetitorAnalytics(id: string) {
  return useQuery({
    queryKey: ['competitors', id, 'analytics'],
    queryFn: () => endpoints.competitors.analytics(id).then(res => res.data),
    enabled: !!id,
  });
}

export function useCreateCompetitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => endpoints.competitors.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitors'] });
    },
  });
}

export function useDeleteCompetitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => endpoints.competitors.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitors'] });
    },
  });
}

