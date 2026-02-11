import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getApi } from '@/lib/stacks-api';
import { useNetwork } from '@/lib/use-network';

export interface AccountBalance {
  /** Available STX balance in microSTX */
  stx: bigint;
  /** Available STX balance in STX (decimal) */
  stxDecimal: number;
}

/**
 * Hook to fetch STX balance for an address.
 * Refetches every 15 seconds and on window focus.
 */
export const useAccountBalance = (address?: string): UseQueryResult<AccountBalance> => {
  const network = useNetwork();

  return useQuery<AccountBalance>({
    queryKey: ['accountBalance', address, network],
    queryFn: async () => {
      if (!address) throw new Error('Address is required');
      if (!network) throw new Error('Network is required');

      const api = getApi(network).accountsApi;
      const response = await api.getAccountBalance({ principal: address });

      const balanceMicro = BigInt((response as any).stx?.balance ?? '0');
      const lockedMicro = BigInt((response as any).stx?.locked ?? '0');
      const available = balanceMicro - lockedMicro;

      return {
        stx: available,
        stxDecimal: Number(available) / 1_000_000,
      };
    },
    enabled: !!address && !!network,
    retry: 1,
    staleTime: 10_000,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });
};
