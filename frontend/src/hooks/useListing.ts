import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

export type Listing = Record<string, any>;

export function useListing(id?: string) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => apiFetch<Listing>(`/listings/${id}`),
    enabled: Boolean(id)
  });
}
