import { useInfiniteQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

export type Listing = Record<string, any>;

export type ListingsResponse = {
  listings: Listing[];
  found: number;
  next_page: string | null;
};

export type ListingsFilters = {
  term?: string;
  status?: string;
  platform?: string;
  category?: string;
};

function buildFirstPagePath(filters: ListingsFilters) {
  const params = new URLSearchParams();
  if (filters.term?.trim()) params.set('term', filters.term.trim());
  if (filters.status?.trim()) params.set('status', filters.status.trim());
  if (filters.platform?.trim()) params.set('platform', filters.platform.trim());
  if (filters.category?.trim()) params.set('category', filters.category.trim());
  const qs = params.toString();
  return `/listings${qs ? `?${qs}` : ''}`;
}

function buildNextPagePath(nextPage: string) {
  // El backend acepta nextPage y lo pasa a gf.listing_search()
  const params = new URLSearchParams();
  params.set('nextPage', nextPage);
  return `/listings?${params.toString()}`;
}

export function useListings(filters: ListingsFilters) {
  return useInfiniteQuery({
    queryKey: ['listings', filters],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      const path = pageParam ? buildNextPagePath(pageParam) : buildFirstPagePath(filters);
      return apiFetch<ListingsResponse>(path);
    },
    getNextPageParam: (lastPage) => lastPage.next_page ?? undefined
  });
}
