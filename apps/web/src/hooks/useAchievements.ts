import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { hexToCV, cvToValue, cvToHex, uintCV, principalCV } from '@stacks/transactions';
import { useNetwork, isTestnetEnvironment } from '@/lib/use-network';
import { getContractAddress } from '@/constants/contracts';
import { getApi } from '@/lib/stacks-api';
import { Network } from '@/lib/network';

export interface BadgeInfo {
  id: number;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt: number | null;
}

export interface AchievementsData {
  badges: BadgeInfo[];
  badgeCount: number;
  totalBadgeTypes: number;
}

const BADGE_ICONS: Record<number, string> = {
  1: '🌱',
  2: '🌳',
  3: '🏆',
  4: '⭐',
};

const BADGE_META: Record<number, { name: string; description: string }> = {
  1: { name: 'First Seed', description: 'Planted your first seed' },
  2: { name: 'First Tree', description: 'Graduated your first tree' },
  3: { name: 'Green Thumb', description: 'Graduated 3 trees' },
  4: { name: 'Early Adopter', description: 'Minted in the first 100' },
};

const getAchievementContract = (network: Network) => {
  const isTestnet = isTestnetEnvironment(network);
  return {
    contractAddress: getContractAddress(network),
    contractName: isTestnet ? 'achievement-badges' : 'achievement-badges',
  };
};

async function checkBadge(
  network: Network,
  owner: string,
  badgeId: number
): Promise<{ earned: boolean; earnedAt: number | null }> {
  const contract = getAchievementContract(network);
  const api = getApi(network);

  try {
    const result = await api.smartContractsApi.callReadOnlyFunction({
      contractAddress: contract.contractAddress,
      contractName: contract.contractName,
      functionName: 'get-badge',
      readOnlyFunctionArgs: {
        sender: contract.contractAddress,
        arguments: [cvToHex(principalCV(owner)), cvToHex(uintCV(badgeId))],
      },
    });

    if (!result.result) return { earned: false, earnedAt: null };

    const cv = hexToCV(result.result);
    const parsed: any = cvToValue(cv);

    if (!parsed?.value) return { earned: false, earnedAt: null };

    return {
      earned: true,
      earnedAt: Number(parsed.value['earned-at']?.value ?? 0),
    };
  } catch {
    return { earned: false, earnedAt: null };
  }
}

/**
 * Hook to fetch all badge statuses for a given principal
 */
export const useAchievements = (owner: string | undefined): UseQueryResult<AchievementsData> => {
  const network = useNetwork();

  return useQuery<AchievementsData>({
    queryKey: ['achievements', owner, network],
    queryFn: async () => {
      if (!network || !owner) throw new Error('Network and owner required');

      const totalBadgeTypes = 4;

      // Check all badges in parallel
      const results = await Promise.all(
        Array.from({ length: totalBadgeTypes }, (_, i) => i + 1).map((badgeId) =>
          checkBadge(network, owner, badgeId)
        )
      );

      const badges: BadgeInfo[] = results.map((result, i) => {
        const badgeId = i + 1;
        return {
          id: badgeId,
          name: BADGE_META[badgeId].name,
          description: BADGE_META[badgeId].description,
          icon: BADGE_ICONS[badgeId],
          earned: result.earned,
          earnedAt: result.earnedAt,
        };
      });

      const badgeCount = badges.filter((b) => b.earned).length;

      return { badges, badgeCount, totalBadgeTypes };
    },
    enabled: !!network && !!owner,
    retry: 2,
    staleTime: 30000,
    refetchInterval: 60000,
  });
};
