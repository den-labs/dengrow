'use client';

import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

import { useNetwork } from '@/lib/use-network';
import { isTestnetEnvironment } from '@/lib/use-network';
import { useGetPlant, getStageName, getStageColor, getCooldownBlocks } from '@/hooks/useGetPlant';
import { useGetTxId } from '@/hooks/useNftHoldings';
import { useCurrentAddress } from '@/hooks/useCurrentAddress';
import { useGraduationInfo, usePoolStats } from '@/hooks/useImpactRegistry';
import { useGetMintTier } from '@/hooks/useGetMintTier';
import { getPlantImage } from '@/utils/nft-utils';
import { waterPlant, waterPlantWithTip, WATER_TIP_STX } from '@/lib/game/operations';
import { shouldUseDirectCall, executeContractCall, openContractCall } from '@/lib/contract-utils';
import { getContractErrorMessage } from '@/lib/contract-errors';
import { useDevnetWallet } from '@/lib/devnet-wallet-context';
import { getExplorerLink } from '@/utils/explorer-links';
import { generateTraits, calculateRarityScore } from '@/lib/traits';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Stat, StatLabel, StatNumber, StatHelpText } from '@/components/ui/stat';
import { getColorClasses } from '@/lib/color-variants';
import { cn } from '@/lib/utils';

const stageDescriptions: Record<number, { title: string; description: string; icon: string }> = {
  0: { title: 'Seed', description: 'Your journey begins! Water daily to help your seed sprout.', icon: '🌱' },
  1: { title: 'Sprout', description: 'A tiny sprout emerges! Keep watering to grow stronger.', icon: '🌿' },
  2: { title: 'Seedling', description: 'Your plant is growing nicely. Continue the daily care.', icon: '🪴' },
  3: { title: 'Vegetative', description: 'Almost there! Your plant is thriving.', icon: '🌳' },
  4: { title: 'Tree', description: 'Congratulations! Your plant has graduated to the Impact Pool.', icon: '🎄' },
};

const growthMilestones = [
  { points: 0, stage: 0, label: 'Seed' },
  { points: 2, stage: 1, label: 'Sprout' },
  { points: 4, stage: 2, label: 'Seedling' },
  { points: 5, stage: 3, label: 'Vegetative' },
  { points: 7, stage: 4, label: 'Tree' },
];

function getRarityBadgeClass(rarity: string): string {
  if (rarity === 'legendary') return 'bg-yellow-100 text-yellow-800';
  if (rarity === 'rare') return 'bg-purple-100 text-purple-800';
  if (rarity === 'uncommon') return 'bg-blue-100 text-blue-800';
  return 'bg-gray-100 text-gray-800';
}

export default function PlantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tokenId = Number(params.tokenId);

  const network = useNetwork();
  const currentAddress = useCurrentAddress();
  const { currentWallet } = useDevnetWallet();

  const [isWatering, setIsWatering] = useState(false);
  const [lastTxId, setLastTxId] = useState<string | null>(null);

  const { data: plantData, isLoading, refetch } = useGetPlant(tokenId);
  const { data: tierInfo } = useGetMintTier(tokenId);
  const { data: graduationInfo } = useGraduationInfo(tokenId);
  const { data: poolStats } = usePoolStats();
  const { data: txData } = useGetTxId(lastTxId || '');

  // @ts-ignore
  const txPending = lastTxId && (!txData || txData?.tx_status === 'pending');

  useEffect(() => {
    if (!txData || !lastTxId) return;
    // @ts-ignore
    if (txData.tx_status === 'success') {
      toast.success('Plant Watered', { description: 'Transaction confirmed on-chain' });
      setLastTxId(null);
      refetch();
    // @ts-ignore
    } else if (txData.tx_status === 'abort_by_response') {
      toast.error('Watering Failed', { description: 'Transaction was rejected on-chain' });
      setLastTxId(null);
    }
  }, [txData, lastTxId, refetch]);

  const plantState = plantData?.plant;
  const stage = plantState?.stage ?? 0;
  const imageSrc = getPlantImage(tokenId, stage);
  const traits = generateTraits(tokenId);
  const rarityScore = calculateRarityScore(traits);
  const growthPoints = plantState?.['growth-points'] ?? 0;
  const lastWaterBlock = plantState?.['last-water-block'] ?? 0;
  const isTree = stage >= 4;
  const isRedeemed = graduationInfo?.redeemed ?? false;

  const isTestnet = network ? isTestnetEnvironment(network) : false;
  const cooldownBlocks = getCooldownBlocks(isTestnet);
  const canWater = plantState && !isTree && (cooldownBlocks === 0 || lastWaterBlock === 0);

  const nextMilestone = growthMilestones.find((m) => m.stage === stage + 1);
  const pointsToNextStage = nextMilestone ? nextMilestone.points - growthPoints : 0;
  const stageInfo = stageDescriptions[stage] || stageDescriptions[0];
  const stageColors = getColorClasses(getStageColor(stage));
  const tierColors = tierInfo ? getColorClasses(tierInfo.colorScheme) : null;

  const handleWater = async (withTip = false) => {
    if (!network || !currentAddress || isWatering || txPending) return;

    setIsWatering(true);
    try {
      const txOptions = withTip
        ? waterPlantWithTip(network, tokenId, currentAddress)
        : waterPlant(network, tokenId);

      if (shouldUseDirectCall()) {
        const { txid } = await executeContractCall(txOptions, currentWallet);
        setLastTxId(txid);
        toast.info('Watering Submitted', { description: 'Confirming on-chain...' });
      } else {
        await openContractCall({
          ...txOptions,
          onFinish: (data) => {
            setLastTxId(data.txId);
            toast.info('Watering Submitted', { description: 'Confirming on-chain...' });
          },
          onCancel: () => {
            toast.info('Cancelled', { description: 'Transaction was cancelled' });
          },
        });
      }
    } catch (error: unknown) {
      console.error('Error watering plant:', error);
      toast.error('Watering Failed', { description: getContractErrorMessage(error) });
    } finally {
      setIsWatering(false);
    }
  };

  if (!currentAddress) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p>Please connect your wallet to view this plant</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Loading plant data...</p>
        </div>
      </div>
    );
  }

  if (!plantData?.exists) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-xl">Plant #{tokenId} not found</p>
          <Button asChild variant="ghost">
            <Link href="/my-plants">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to My Plants
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-lg px-4 py-8">
      <div className="flex flex-col gap-8">
        {/* Header with back button */}
        <div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/my-plants">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to My Plants
            </Link>
          </Button>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Left: Plant Image */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="relative w-full overflow-hidden rounded-lg bg-gray-100 pt-[100%]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {imageSrc ? (
                      <img src={imageSrc} alt={`Plant #${tokenId}`} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="text-6xl">{stageInfo.icon}</span>
                        <span className="text-gray-500">Plant #{tokenId}</span>
                      </div>
                    )}
                  </div>
                  {tierInfo && tierColors && (
                    <span className={cn('absolute left-4 top-4 rounded px-3 py-1 text-sm font-medium', tierColors.badge)}>
                      {tierInfo.name} Tier
                    </span>
                  )}
                  <span className={cn('absolute right-4 top-4 rounded px-3 py-1 text-base font-medium', stageColors.badge)}>
                    {stageInfo.icon} {getStageName(stage)}
                  </span>
                </div>

                {/* Water button */}
                {isTree ? (
                  <Button className="w-full bg-orange-600 text-white" size="lg" disabled>
                    Graduated to Impact Pool 🌳
                  </Button>
                ) : canWater ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      className={cn(getColorClasses(txPending ? 'orange' : 'blue').button)}
                      size="lg"
                      disabled={!!txPending || isWatering}
                      onClick={() => handleWater(false)}
                    >
                      {(isWatering || !!txPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {txPending ? 'Confirming...' : isWatering ? 'Watering...' : 'Water 💧'}
                    </Button>
                    <Button
                      variant="outline"
                      className={cn(getColorClasses(txPending ? 'orange' : 'teal').buttonOutline)}
                      size="lg"
                      disabled={!!txPending || isWatering}
                      onClick={() => handleWater(true)}
                    >
                      {(isWatering || !!txPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {txPending ? 'Confirming...' : isWatering ? 'Watering...' : `Water + Tip (${WATER_TIP_STX} STX)`}
                    </Button>
                  </div>
                ) : (
                  <Button className="w-full bg-gray-600 text-white" size="lg" disabled>
                    Cooldown Active ⏳
                  </Button>
                )}

                {lastTxId && (
                  <a
                    href={getExplorerLink(lastTxId, network)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-center text-sm text-blue-500 hover:underline"
                  >
                    View transaction in explorer
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right: Plant Info */}
          <div className="flex flex-col gap-6">
            {/* Title and description */}
            <div>
              <div className="flex items-baseline gap-3">
                <h1 className="text-3xl font-bold">Plant #{tokenId}</h1>
                {tierInfo && tierColors && (
                  <Badge className={cn(tierColors.badge, 'px-2 py-0.5 text-sm')}>
                    {tierInfo.name}
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-gray-600">{stageInfo.description}</p>
            </div>

            <Separator />

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Stat>
                <StatLabel>Current Stage</StatLabel>
                <StatNumber>{stageInfo.icon} {stageInfo.title}</StatNumber>
                <StatHelpText>Stage {stage + 1} of 5</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Growth Points</StatLabel>
                <StatNumber>{growthPoints}/7</StatNumber>
                <StatHelpText>
                  {isTree ? 'Fully grown!' : `${pointsToNextStage} more to evolve`}
                </StatHelpText>
              </Stat>
            </div>

            {/* Progress bar */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Growth Progress</span>
                <span className="text-sm text-gray-600">{Math.round((growthPoints / 7) * 100)}%</span>
              </div>
              <Progress value={(growthPoints / 7) * 100} className="h-3 rounded-full" />
            </div>

            {/* Growth Journey */}
            <div>
              <span className="mb-3 block text-sm font-medium">Growth Journey</span>
              <div className="flex items-center justify-between gap-2">
                {growthMilestones.map((milestone) => {
                  const milestoneColors = getColorClasses(getStageColor(milestone.stage));
                  const reached = stage >= milestone.stage;
                  return (
                    <div key={milestone.stage} className="flex flex-col items-center gap-1">
                      <div
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full',
                          reached ? milestoneColors.progress + ' text-white' : 'bg-gray-200 text-gray-500'
                        )}
                      >
                        <span className="text-xs">{stageDescriptions[milestone.stage]?.icon}</span>
                      </div>
                      <span className={cn('text-xs', reached ? 'text-gray-700' : 'text-gray-400')}>
                        {milestone.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* On-Chain Data */}
            <div>
              <span className="mb-3 block text-sm font-medium">On-Chain Data</span>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Token ID</span>
                  <span className="font-mono">#{tokenId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Mint Tier</span>
                  {tierInfo && tierColors ? (
                    <Badge className={tierColors.badge}>{tierInfo.name} ({tierInfo.priceSTX} STX)</Badge>
                  ) : (
                    <span className="font-mono text-gray-400">--</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Owner</span>
                  <span className="max-w-[200px] truncate font-mono">{plantState?.owner}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Last Watered</span>
                  <span className="font-mono">{lastWaterBlock === 0 ? 'Never' : `Block #${lastWaterBlock}`}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Cooldown</span>
                  <span className="font-mono">{cooldownBlocks === 0 ? 'None (Testnet)' : `${cooldownBlocks} blocks`}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Plant Traits */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium">Traits</span>
                <Badge className={rarityScore >= 50 ? 'bg-purple-100 text-purple-800' : rarityScore >= 25 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                  Rarity Score: {rarityScore}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md bg-gray-50 p-3">
                  <span className="mb-1 block text-xs text-gray-500">Pot</span>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full" style={{ backgroundColor: traits.pot.color }} />
                    <span className="text-sm font-medium">{traits.pot.name}</span>
                  </div>
                  <Badge className={cn('mt-1 text-xs', getRarityBadgeClass(traits.pot.rarity))}>
                    {traits.pot.rarity}
                  </Badge>
                </div>
                <div className="rounded-md bg-gray-50 p-3">
                  <span className="mb-1 block text-xs text-gray-500">Background</span>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full" style={{ backgroundColor: traits.background.color }} />
                    <span className="text-sm font-medium">{traits.background.name}</span>
                  </div>
                  <Badge className={cn('mt-1 text-xs', getRarityBadgeClass(traits.background.rarity))}>
                    {traits.background.rarity}
                  </Badge>
                </div>
                <div className="rounded-md bg-gray-50 p-3">
                  <span className="mb-1 block text-xs text-gray-500">Flower</span>
                  <div className="flex items-center gap-2">
                    <span>{traits.flower.emoji}</span>
                    <span className="text-sm font-medium">{traits.flower.name}</span>
                  </div>
                  <Badge className={cn('mt-1 text-xs', getRarityBadgeClass(traits.flower.rarity))}>
                    {traits.flower.rarity}
                  </Badge>
                </div>
                <div className="rounded-md bg-gray-50 p-3">
                  <span className="mb-1 block text-xs text-gray-500">Companion</span>
                  <div className="flex items-center gap-2">
                    <span>{traits.companion.emoji || '—'}</span>
                    <span className="text-sm font-medium">{traits.companion.name}</span>
                  </div>
                  <Badge className={cn('mt-1 text-xs', getRarityBadgeClass(traits.companion.rarity))}>
                    {traits.companion.rarity}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Impact Pool — Post-Graduation UI */}
            {isTree && (
              <div className="flex flex-col gap-4">
                {/* Celebration Header */}
                <Card className={isRedeemed ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-4xl">{isRedeemed ? '🌍' : '🎉'}</span>
                      <h3 className={cn('text-center text-lg font-bold', isRedeemed ? 'text-green-700' : 'text-orange-700')}>
                        {isRedeemed ? 'Real Impact Made!' : 'Your Tree is in the Impact Pool!'}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge className={isRedeemed ? 'bg-green-100 px-2 text-sm text-green-800' : 'bg-orange-100 px-2 text-sm text-orange-800'}>
                          {isRedeemed ? 'Redeemed' : 'In Pool'}
                        </Badge>
                        {graduationInfo && (
                          <span className="font-mono text-xs text-gray-500">
                            Graduated at block #{graduationInfo.graduatedAt}
                          </span>
                        )}
                      </div>
                      <p className={cn('text-center text-sm', isRedeemed ? 'text-green-600' : 'text-orange-600')}>
                        {isRedeemed
                          ? 'This tree has been converted to real-world impact! A real tree was planted thanks to your care.'
                          : 'Your tree is waiting in the Impact Pool to be converted to real-world impact in the next batch redemption.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Mini Pool Stats */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-sm font-bold text-gray-700">Impact Pool Status</span>
                      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
                        <Stat className="text-center">
                          <StatLabel>In Pool</StatLabel>
                          <StatNumber>{poolStats?.currentPoolSize ?? '--'}</StatNumber>
                          <StatHelpText>trees waiting</StatHelpText>
                        </Stat>
                        <Stat className="text-center">
                          <StatLabel>Redeemed</StatLabel>
                          <StatNumber>{poolStats?.totalRedeemed ?? '--'}</StatNumber>
                          <StatHelpText>real trees planted</StatHelpText>
                        </Stat>
                        <Stat className="text-center">
                          <StatLabel>Batches</StatLabel>
                          <StatNumber>{poolStats?.totalBatches ?? '--'}</StatNumber>
                          <StatHelpText>completed</StatHelpText>
                        </Stat>
                      </div>
                      <div className="w-full">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-xs text-gray-500">Redemption progress</span>
                          <span className="text-xs text-gray-500">
                            {poolStats
                              ? poolStats.totalGraduated > 0
                                ? `${Math.round((poolStats.totalRedeemed / poolStats.totalGraduated) * 100)}%`
                                : '0%'
                              : '--'}
                          </span>
                        </div>
                        <Progress
                          value={
                            poolStats && poolStats.totalGraduated > 0
                              ? (poolStats.totalRedeemed / poolStats.totalGraduated) * 100
                              : 0
                          }
                          className="h-2 rounded-full"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* CTA Row */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Button asChild className="bg-green-600 text-white hover:bg-green-700" size="lg">
                    <Link href="/my-plants">Mint Another Plant</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className={isRedeemed ? 'border-green-600 text-green-600 hover:bg-green-50' : 'border-orange-600 text-orange-600 hover:bg-orange-50'}
                  >
                    <Link href="/impact">View Impact Dashboard</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
