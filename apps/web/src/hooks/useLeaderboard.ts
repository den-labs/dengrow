import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { hexToCV, cvToValue, cvToHex, uintCV } from '@stacks/transactions';
import { useNetwork } from '@/lib/use-network';
import { getNftContract, getStorageContract, TOKEN_ID_OFFSET } from '@/constants/contracts';
import { getApi } from '@/lib/stacks-api';
import { Network } from '@/lib/network';

export interface LeaderboardEntry {
  tokenId: number;
  stage: number;
  growthPoints: number;
  lastWaterBlock: number;
  owner: string;
}

export interface LeaderboardData {
  entries: LeaderboardEntry[];
  totalMinted: number;
}

async function fetchLastTokenId(network: Network): Promise<number> {
  const contract = getNftContract(network);
  const api = getApi(network);

  const result = await api.smartContractsApi.callReadOnlyFunction({
    contractAddress: contract.contractAddress,
    contractName: contract.contractName,
    functionName: 'get-last-token-id',
    readOnlyFunctionArgs: {
      sender: contract.contractAddress,
      arguments: [],
    },
  });

  if (!result.result) return 0;

  const cv = hexToCV(result.result);
  const parsed: any = cvToValue(cv);
  return Number(parsed?.value ?? 0);
}

async function fetchPlant(
  network: Network,
  tokenId: number
): Promise<LeaderboardEntry | null> {
  const contract = getStorageContract(network);
  const api = getApi(network);

  try {
    const result = await api.smartContractsApi.callReadOnlyFunction({
      contractAddress: contract.contractAddress,
      contractName: contract.contractName,
      functionName: 'get-plant',
      readOnlyFunctionArgs: {
        sender: contract.contractAddress,
        arguments: [cvToHex(uintCV(tokenId))],
      },
    });

    if (!result.result) return null;

    const cv = hexToCV(result.result);
    const parsed: any = cvToValue(cv);

    if (!parsed?.value) return null;

    const t = parsed.value;
    if (!t.stage || !t['growth-points'] || !t.owner) return null;

    return {
      tokenId,
      stage: Number(t.stage.value),
      growthPoints: Number(t['growth-points'].value),
      lastWaterBlock: Number(t['last-water-block'].value),
      owner: String(t.owner.value),
    };
  } catch {
    return null;
  }
}

/**
 * Hook to fetch all minted plants and build a leaderboard.
 * Fetches get-last-token-id, then queries each plant in parallel.
 */
export const useLeaderboard = (): UseQueryResult<LeaderboardData> => {
  const network = useNetwork();

  return useQuery<LeaderboardData>({
    queryKey: ['leaderboard', network],
    queryFn: async () => {
      if (!network) throw new Error('Network is required');

      const lastTokenId = await fetchLastTokenId(network);
      // Subtract offset — plant-nft-v4 starts at TOKEN_ID_OFFSET
      const totalMinted = Math.max(0, lastTokenId - TOKEN_ID_OFFSET);

      if (totalMinted === 0) {
        return { entries: [], totalMinted: 0 };
      }

      // Fetch all plants in parallel (batch of up to 50 to avoid overload)
      const limit = Math.min(totalMinted, 50);
      // Use raw token IDs (lastTokenId down) for on-chain lookups
      const ids = Array.from({ length: limit }, (_, i) => lastTokenId - i);

      const results = await Promise.all(
        ids.map((id) => fetchPlant(network, id))
      );

      const entries = results.filter((e): e is LeaderboardEntry => e !== null);

      // Sort by growth points descending, then by stage descending
      entries.sort((a, b) => {
        if (b.growthPoints !== a.growthPoints) return b.growthPoints - a.growthPoints;
        if (b.stage !== a.stage) return b.stage - a.stage;
        return a.tokenId - b.tokenId;
      });

      return { entries, totalMinted };
    },
    enabled: !!network,
    retry: 2,
    staleTime: 30000,
    refetchInterval: 60000,
  });
};
