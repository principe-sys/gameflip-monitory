import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

export function useWallet(months: string[]) {
  const query = months.length > 0 ? `?months=${months.join(',')}` : '';
  return useQuery({
    queryKey: ['wallet', months],
    queryFn: () => apiFetch(`/wallet${query}`)
  });
}
