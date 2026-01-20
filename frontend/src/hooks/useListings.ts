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

function normalizeFilters(filters: ListingsFilters) {
  // Esto estabiliza valores y evita keys diferentes por espacios/undefined
  return {
    term: filters.term?.trim() || '',
    status: filters.status?.trim() || '',
    platform: filters.platform?.trim() || '',
    category: filters.category?.trim() || ''
  };
}

function buildFirstPagePath(filters: ListingsFilters) {
  const f = normalizeFilters(filters);
  const params = new URLSearchParams();
  if (f.term) params.set('term', f.term);
  if (f.status) params.set('status', f.status);
  if (f.platform) params.set('platform', f.platform);
  if (f.category) params.set('category', f.category);

  const qs = params.toString();
  return `/listings${qs ? `?${qs}` : ''}`;
}

function buildNextPagePath(nextPage: string) {
  const params = new URLSearchParams();
  params.set('nextPage', nextPage);
  return `/listings?${params.toString()}`;
}

export function useListings(filters: ListingsFilters) {
  const f = normalizeFilters(filters);

  return useInfiniteQuery({
    queryKey: ['listings', f.term, f.status, f.platform, f.category],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => {
      const path = pageParam ? buildNextPagePath(pageParam) : buildFirstPagePath(f);
      return apiFetch<ListingsResponse>(path);
    },
    getNextPageParam: (lastPage) => lastPage.next_page ?? undefined
  });
}
