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
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-dengrow-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8 text-dengrow-500"
            >
              <path d="M7 20h10" />
              <path d="M10 20c5.5-2.5.8-6.4 3-10" />
              <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
              <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
            </svg>
          </div>
          <p className="text-muted-foreground">Connect your wallet to view achievements</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-dengrow-500" />
          <p className="text-muted-foreground">Loading achievements...</p>
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Player Achievements
          </h1>
          <p className="mt-2 text-muted-foreground">
            Earn badges by growing your plants and contributing to the community
          </p>
          <div className="mt-3 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700">
              Rank: Sprouting
            </span>
          </div>
        </div>

        {/* Progress */}
        <Card className="rounded-xl shadow-card">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-display font-medium text-foreground">Badges Collected</span>
                <Badge className="bg-purple-100 px-3 py-1 text-base font-semibold text-purple-800">
                  {earned}/{total}
                </Badge>
              </div>
              <Progress
                value={total > 0 ? (earned / total) * 100 : 0}
                className="h-3 rounded-full [&>div]:bg-purple-500"
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
        <Card className="rounded-xl border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-3">
              <span className="font-display text-lg font-bold text-purple-700">
                How Badges Work
              </span>
              <p className="text-center text-sm text-purple-600">
                Badges are soulbound achievements recorded on-chain. Claim them by proving your
                eligibility - the smart contract verifies your plants and progress before granting
                each badge.
              </p>
              <ul className="mt-1 grid w-full max-w-md grid-cols-1 gap-2 text-sm text-purple-700 sm:grid-cols-2">
                <li className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-purple-400" />
                  On-chain verification via Bitcoin L2
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-purple-400" />
                  Permanent player history
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-purple-400" />
                  Tradable on marketplaces
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-purple-400" />
                  Special discounted rates
                </li>
              </ul>
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
      className={`rounded-xl transition-all duration-200 ${
        isEarned
          ? 'border-2 border-purple-200 bg-white shadow-card'
          : 'border opacity-60 hover:opacity-90 hover:shadow-card'
      }`}
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl ${
              isEarned ? 'bg-purple-50' : 'bg-gray-100 grayscale'
            }`}
          >
            {badge.icon}
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-foreground">{badge.name}</span>
              {isEarned && (
                <Badge className="bg-purple-100 text-xs font-medium text-purple-800">
                  Earned
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {badge.description}
            </p>
            {isEarned && badge.earnedAt && (
              <p className="font-mono-addr text-xs text-muted-foreground/60">
                Earned at block {badge.earnedAt}
              </p>
            )}
            {!isEarned && (
              <Button
                size="sm"
                variant="outline"
                className="mt-1 w-fit rounded-lg border-purple-500 text-purple-600 hover:bg-purple-50"
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
