import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { hexToCV, cvToValue } from '@stacks/transactions';
import { useNetwork } from '@/lib/use-network';
import { getTreasuryContract } from '@/constants/contracts';
import { getApi } from '@/lib/stacks-api';

export interface TreasuryStats {
  balance: number;
  partner: string | null;
  pricePerTree: number;
  totalDeposited: number;
  totalPaidOut: number;
  totalWithdrawn: number;
  totalRedemptions: number;
}

/**
 * Hook to fetch treasury stats (balance, partner, price, totals)
 */
export const useTreasuryStats = (): UseQueryResult<TreasuryStats> => {
  const network = useNetwork();

  return useQuery<TreasuryStats>({
    queryKey: ['treasury-stats', network],
    queryFn: async () => {
      if (!network) throw new Error('Network is required');

      const contract = getTreasuryContract(network);
      const api = getApi(network);

      try {
        const result = await api.smartContractsApi.callReadOnlyFunction({
          contractAddress: contract.contractAddress,
          contractName: contract.contractName,
          functionName: 'get-treasury-stats',
          readOnlyFunctionArgs: {
            sender: contract.contractAddress,
            arguments: [],
          },
        });

        if (!result.result) {
          throw new Error('No result from get-treasury-stats');
        }

        const clarityValue = hexToCV(result.result);
        const parsed: any = cvToValue(clarityValue);

        // Partner is (optional principal) — comes as { type: 'some', value: ... } or { type: 'none' }
        let partner: string | null = null;
        if (parsed.partner?.value) {
          partner = String(parsed.partner.value);
        }

        return {
          balance: Number(parsed.balance?.value ?? 0),
          partner,
          pricePerTree: Number(parsed['price-per-tree']?.value ?? 500000),
          totalDeposited: Number(parsed['total-deposited']?.value ?? 0),
          totalPaidOut: Number(parsed['total-paid-out']?.value ?? 0),
          totalWithdrawn: Number(parsed['total-withdrawn']?.value ?? 0),
          totalRedemptions: Number(parsed['total-redemptions']?.value ?? 0),
        };
      } catch (error) {
        console.error('Error fetching treasury stats:', error);
        return {
          balance: 0,
          partner: null,
          pricePerTree: 500000,
          totalDeposited: 0,
          totalPaidOut: 0,
          totalWithdrawn: 0,
          totalRedemptions: 0,
        };
      }
    },
    enabled: !!network,
    retry: 2,
    staleTime: 30000,
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
  });
};
