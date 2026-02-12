'use client';

import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAchievements, BadgeInfo } from '@/hooks/useAchievements';
import { useCurrentAddress } from '@/hooks/useCurrentAddress';
import { useNetwork } from '@/lib/use-network';
import { useNftHoldings } from '@/hooks/useNftHoldings';
import { useDevnetWallet } from '@/lib/devnet-wallet-context';
import { getNftContract, getStorageContract } from '@/constants/contracts';
import { formatValue } from '@/lib/clarity-utils';
import { getApi } from '@/lib/stacks-api';
import { hexToCV, cvToValue, cvToHex, uintCV } from '@stacks/transactions';
import {
  claimFirstSeed,
  claimFirstTree,
  claimGreenThumb,
  claimEarlyAdopter,
} from '@/lib/game/badge-operations';
import { shouldUseDirectCall, executeContractCall, openContractCall } from '@/lib/contract-utils';
import { getContractErrorMessage } from '@/lib/contract-errors';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function AchievementsPage() {
  const currentAddress = useCurrentAddress();
  const network = useNetwork();
  const { data: achievements, isLoading, refetch } = useAchievements(currentAddress || undefined);
  const { data: nftHoldings } = useNftHoldings(currentAddress || '');
  const { currentWallet } = useDevnetWallet();
  const [claimingBadge, setClaimingBadge] = useState<number | null>(null);

  // Extract user's plant token IDs from holdings
  const nftContractId = network
    ? `${getNftContract(network).contractAddress}.${getNftContract(network).contractName}`
    : '';
  const plants: { tokenId: number }[] = (nftHoldings?.results || [])
    .filter((h: any) => h.asset_identifier?.startsWith(nftContractId))
    .map((h: any) => ({
      tokenId: Number(formatValue(h.value?.hex).replace('u', '')),
    }))
    .sort((a: { tokenId: number }, b: { tokenId: number }) => a.tokenId - b.tokenId);

  if (!currentAddress) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="text-3xl">🏅</span>
          <p>Connect your wallet to view achievements</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          <p className="text-gray-600">Loading achievements...</p>
        </div>
      </div>
    );
  }

  const badges = achievements?.badges || [];
  const earned = badges.filter((b) => b.earned).length;
  const total = badges.length;

  const fetchPlantStage = async (tokenId: number): Promise<number | null> => {
    if (!network) return null;
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
      const parsed: any = cvToValue(hexToCV(result.result));
      return parsed?.value?.stage?.value != null ? Number(parsed.value.stage.value) : null;
    } catch {
      return null;
    }
  };

  const handleClaim = async (badgeId: number) => {
    if (!network || claimingBadge) return;

    if (plants.length === 0) {
      toast.warning('No plants found', { description: 'You need at least one plant to claim badges' });
      return;
    }

    setClaimingBadge(badgeId);
    try {
      let txOptions;

      switch (badgeId) {
        case 1:
          txOptions = claimFirstSeed(network, plants[0].tokenId);
          break;
        case 2: {
          const stages = await Promise.all(plants.map((p) => fetchPlantStage(p.tokenId)));
          const treeIdx = stages.findIndex((s) => s !== null && s >= 4);
          if (treeIdx === -1) {
            toast.warning('Not eligible', { description: 'No graduated tree found — grow a plant to stage 4' });
            setClaimingBadge(null);
            return;
          }
          txOptions = claimFirstTree(network, plants[treeIdx].tokenId);
          break;
        }
        case 3: {
          const stages3 = await Promise.all(plants.map((p) => fetchPlantStage(p.tokenId)));
          const graduatedPlants = plants.filter((_, i) => stages3[i] !== null && stages3[i]! >= 4);
          if (graduatedPlants.length < 3) {
            toast.warning('Not eligible', { description: `Need 3 graduated trees, you have ${graduatedPlants.length}` });
            setClaimingBadge(null);
            return;
          }
          txOptions = claimGreenThumb(network, graduatedPlants[0].tokenId, graduatedPlants[1].tokenId, graduatedPlants[2].tokenId);
          break;
        }
        case 4: {
          const targetToken = plants.find((p) => p.tokenId <= 200);
          if (!targetToken) {
            toast.warning('Not eligible', { description: 'No plant with ID <= 200' });
            setClaimingBadge(null);
            return;
          }
          txOptions = claimEarlyAdopter(network, targetToken.tokenId);
          break;
        }
        default:
          setClaimingBadge(null);
          return;
      }

      if (shouldUseDirectCall()) {
        await executeContractCall(txOptions, currentWallet);
        toast.success('Badge Claimed!', { description: 'Transaction submitted' });
        setTimeout(() => refetch(), 3000);
      } else {
        await openContractCall({
          ...txOptions,
          onFinish: () => {
            toast.info('Badge Claimed!', { description: 'Confirming on-chain...' });
            setTimeout(() => refetch(), 10000);
          },
          onCancel: () => {
            toast.info('Cancelled');
          },
        });
      }
    } catch (error: unknown) {
      console.error('Error claiming badge:', error);
      toast.error('Claim Failed', { description: getContractErrorMessage(error) });
    } finally {
      setClaimingBadge(null);
    }
  };

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-purple-600">
            Achievements
          </h1>
          <p className="mt-2 text-gray-600">
            Earn badges by growing your plants and contributing to the community
          </p>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Badge Progress</span>
                <Badge className="bg-purple-100 px-3 py-1 text-base text-purple-800">
                  {earned}/{total}
                </Badge>
              </div>
              <Progress
                value={total > 0 ? (earned / total) * 100 : 0}
                className="h-3 rounded-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Badge Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {badges.map((badge) => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              isClaiming={claimingBadge === badge.id}
              onClaim={() => handleClaim(badge.id)}
            />
          ))}
        </div>

        {/* Info */}
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-2">
              <span className="font-bold text-purple-700">
                How Badges Work
              </span>
              <p className="text-center text-sm text-purple-600">
                Badges are soulbound achievements recorded on-chain. Claim them by proving your
                eligibility - the smart contract verifies your plants and progress before granting
                each badge.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface BadgeCardProps {
  badge: BadgeInfo;
  isClaiming: boolean;
  onClaim: () => void;
}

function BadgeCard({ badge, isClaiming, onClaim }: BadgeCardProps) {
  const isEarned = badge.earned;

  return (
    <Card
      className={`transition-all duration-200 ${
        isEarned
          ? 'border-2 border-purple-300 bg-white'
          : 'border opacity-70 hover:border-purple-200 hover:opacity-90'
      }`}
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-3xl ${
              isEarned ? 'bg-purple-100' : 'bg-gray-100 grayscale'
            }`}
          >
            {badge.icon}
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-bold">{badge.name}</span>
              {isEarned && (
                <Badge className="bg-purple-100 text-xs text-purple-800">
                  Earned
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600">
              {badge.description}
            </p>
            {isEarned && badge.earnedAt && (
              <p className="text-xs text-gray-400">
                Earned at block {badge.earnedAt}
              </p>
            )}
            {!isEarned && (
              <Button
                size="sm"
                variant="outline"
                className="mt-1 w-fit border-purple-600 text-purple-600 hover:bg-purple-50"
                disabled={isClaiming}
                onClick={onClaim}
              >
                {isClaiming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isClaiming ? 'Claiming...' : 'Claim Badge'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
