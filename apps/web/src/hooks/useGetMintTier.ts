import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { hexToCV, cvToValue, cvToHex, uintCV } from '@stacks/transactions';
import { getNftContract } from '@/constants/contracts';
import { useNetwork } from '@/lib/use-network';
import { getApi } from '@/lib/stacks-api';
import { MintTier, MINT_TIERS } from '@/lib/nft/operations';

export interface MintTierInfo {
  tier: MintTier;
  name: string;
  priceSTX: number;
  colorScheme: string;
  description: string;
}

/**
 * Hook to fetch the mint tier for a given token from plant-nft contract.
 * Returns null for admin-minted plants (no tier stored).
 */
export const useGetMintTier = (tokenId: number): UseQueryResult<MintTierInfo | null> => {
  const network = useNetwork();

  return useQuery<MintTierInfo | null>({
    queryKey: ['mint-tier', tokenId, network],
    queryFn: async () => {
      if (!network) throw new Error('Network is required');

      const contract = getNftContract(network);
      const api = getApi(network);

      try {
        const result = await api.smartContractsApi.callReadOnlyFunction({
          contractAddress: contract.contractAddress,
          contractName: contract.contractName,
          functionName: 'get-mint-tier',
          readOnlyFunctionArgs: {
            sender: contract.contractAddress,
            arguments: [cvToHex(uintCV(tokenId))],
          },
        });

        if (!result.result) return null;

        const clarityValue = hexToCV(result.result);
        const parsed: any = cvToValue(clarityValue);

        // get-mint-tier returns (optional uint) via from-consensus-buff?
        // cvToValue on (some (some u2)) unwraps to nested optional
        if (parsed === null || parsed === undefined) return null;

        // Extract the uint value — may be nested optionals
        let tierValue: number | null = null;
        if (typeof parsed === 'bigint' || typeof parsed === 'number') {
          tierValue = Number(parsed);
        } else if (parsed?.value !== undefined && parsed?.value !== null) {
          const inner = parsed.value;
          if (typeof inner === 'bigint' || typeof inner === 'number') {
            tierValue = Number(inner);
          } else if (inner?.value !== undefined) {
            tierValue = Number(inner.value);
          }
        }

        if (tierValue === null || !(tierValue in MINT_TIERS)) return null;

        const tier = tierValue as MintTier;
        const info = MINT_TIERS[tier];
        return {
          tier,
          name: info.name,
          priceSTX: info.priceSTX,
          colorScheme: info.colorScheme,
          description: info.description,
        };
      } catch (error) {
        console.error('Error fetching mint tier:', error);
        return null;
      }
    },
    enabled: !!network && tokenId > 0,
    retry: 1,
    staleTime: 60000, // Tier never changes, cache for 1 minute
    refetchOnWindowFocus: false,
  });
};
