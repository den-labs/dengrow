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
  if (rarity === 'legendary') return 'bg-yellow-50 text-yellow-700';
  if (rarity === 'rare') return 'bg-purple-50 text-purple-700';
  if (rarity === 'uncommon') return 'bg-blue-50 text-blue-700';
  return 'bg-gray-100 text-gray-700';
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
        <p className="text-muted-foreground">Please connect your wallet to view this plant</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-4 border-dengrow-500/20" />
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-dengrow-500" />
          </div>
          <p className="text-muted-foreground">Loading plant data...</p>
        </div>
      </div>
    );
  }

  if (!plantData?.exists) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-xl font-semibold">Plant #{tokenId} not found</p>
          <Button asChild variant="ghost" className="text-dengrow-500 hover:bg-dengrow-50">
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link href="/my-plants" className="text-dengrow-500 hover:underline">
            My Plants
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">Plant #{tokenId}</span>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left: Plant Image */}
          <Card className="overflow-hidden rounded-2xl shadow-card">
            <CardContent className="p-0">
              <div className="relative aspect-square bg-gradient-to-br from-dengrow-50 via-green-50 to-emerald-100">
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  {imageSrc ? (
                    <img src={imageSrc} alt={`Plant #${tokenId}`} className="h-full w-full object-contain drop-shadow-2xl" />
                  ) : (
                    <div className="flex flex-col items-center">
                      <svg className="h-24 w-24 text-dengrow-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 20h10" /><path d="M10 20c5.5-2.5.8-6.4 3-10" /><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" /><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                {tierInfo && tierColors && (
                  <span className={cn('absolute left-4 top-4 rounded-full px-3 py-1 text-sm font-semibold', tierColors.badge)}>
                    {tierInfo.name} Tier
                  </span>
                )}
                <span className={cn('absolute right-4 top-4 rounded-full px-3 py-1 text-sm font-semibold', stageColors.badge)}>
                  {getStageName(stage)}
                </span>
              </div>

              <div className="flex flex-col gap-3 p-6">
                {/* Water button */}
                {isTree ? (
                  <Button className="w-full rounded-xl bg-orange-500 py-6 text-white hover:bg-orange-600" size="lg" disabled>
                    Graduated to Impact Pool
                  </Button>
                ) : canWater ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      className="rounded-xl bg-dengrow-500 py-6 text-white shadow-sm hover:bg-dengrow-600 hover:shadow-glow"
                      size="lg"
                      disabled={!!txPending || isWatering}
                      onClick={() => handleWater(false)}
                    >
                      {(isWatering || !!txPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {txPending ? 'Confirming...' : isWatering ? 'Watering...' : 'Water Plant'}
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-xl border-teal-500 py-6 text-teal-600 hover:bg-teal-50"
                      size="lg"
                      disabled={!!txPending || isWatering}
                      onClick={() => handleWater(true)}
                    >
                      {(isWatering || !!txPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {txPending ? 'Confirming...' : isWatering ? 'Watering...' : `Tip ${WATER_TIP_STX} STX`}
                    </Button>
                  </div>
                ) : (
                  <Button className="w-full rounded-xl py-6" size="lg" disabled>
                    Cooldown Active
                  </Button>
                )}

                {lastTxId && (
                  <a
                    href={getExplorerLink(lastTxId, network)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-center text-sm text-dengrow-500 hover:underline"
                  >
                    View transaction in explorer
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right: Plant Info */}
          <div className="flex flex-col gap-6">
            {/* Title */}
            <div>
              <div className="flex items-baseline gap-3">
                <h1 className="font-display text-3xl font-bold tracking-tight">Plant #{tokenId}</h1>
                {tierInfo && tierColors && (
                  <Badge className={cn(tierColors.badge, 'px-2 py-0.5 text-sm')}>
                    {tierInfo.name}
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-muted-foreground">{stageInfo.description}</p>
            </div>

            <Separator />

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border bg-white p-4 shadow-card">
                <Stat>
                  <StatLabel>Current Stage</StatLabel>
                  <StatNumber className="text-dengrow-600">{stageInfo.title}</StatNumber>
                  <StatHelpText>Stage {stage + 1} of 5</StatHelpText>
                </Stat>
              </div>
              <div className="rounded-xl border bg-white p-4 shadow-card">
                <Stat>
                  <StatLabel>Growth Points</StatLabel>
                  <StatNumber className="text-dengrow-600">{growthPoints}/7</StatNumber>
                  <StatHelpText>
                    {isTree ? 'Fully grown!' : `${pointsToNextStage} more to evolve`}
                  </StatHelpText>
                </Stat>
              </div>
            </div>

            {/* Progress bar */}
            <div className="rounded-xl border bg-white p-4 shadow-card">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Growth Progress</span>
                <span className="text-sm font-bold text-dengrow-600">{Math.round((growthPoints / 7) * 100)}%</span>
              </div>
              <Progress value={(growthPoints / 7) * 100} className="h-3 rounded-full" />
            </div>

            {/* Growth Journey */}
            <div className="rounded-xl border bg-white p-4 shadow-card">
              <span className="mb-4 block text-sm font-medium">Growth Journey</span>
              <div className="flex items-center justify-between gap-2">
                {growthMilestones.map((milestone, idx) => {
                  const milestoneColors = getColorClasses(getStageColor(milestone.stage));
                  const reached = stage >= milestone.stage;
                  return (
                    <div key={milestone.stage} className="flex flex-col items-center gap-1.5">
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-full text-sm transition-all',
                          reached ? milestoneColors.progress + ' text-white shadow-sm' : 'bg-gray-100 text-gray-400'
                        )}
                      >
                        {stageDescriptions[milestone.stage]?.icon}
                      </div>
                      <span className={cn('text-xs font-medium', reached ? 'text-foreground' : 'text-muted-foreground')}>
                        {milestone.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Traits */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium">Traits</span>
                <Badge className={rarityScore >= 50 ? 'bg-purple-50 text-purple-700' : rarityScore >= 25 ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-700'}>
                  Rarity: {rarityScore}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border bg-white p-3 shadow-card">
                  <span className="mb-1 block text-xs text-muted-foreground">Pot</span>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full shadow-sm" style={{ backgroundColor: traits.pot.color }} />
                    <span className="text-sm font-medium">{traits.pot.name}</span>
                  </div>
                  <Badge className={cn('mt-1.5 text-xs', getRarityBadgeClass(traits.pot.rarity))}>
                    {traits.pot.rarity}
                  </Badge>
                </div>
                <div className="rounded-xl border bg-white p-3 shadow-card">
                  <span className="mb-1 block text-xs text-muted-foreground">Background</span>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full shadow-sm" style={{ backgroundColor: traits.background.color }} />
                    <span className="text-sm font-medium">{traits.background.name}</span>
                  </div>
                  <Badge className={cn('mt-1.5 text-xs', getRarityBadgeClass(traits.background.rarity))}>
                    {traits.background.rarity}
                  </Badge>
                </div>
                <div className="rounded-xl border bg-white p-3 shadow-card">
                  <span className="mb-1 block text-xs text-muted-foreground">Flower</span>
                  <div className="flex items-center gap-2">
                    <span>{traits.flower.emoji}</span>
                    <span className="text-sm font-medium">{traits.flower.name}</span>
                  </div>
                  <Badge className={cn('mt-1.5 text-xs', getRarityBadgeClass(traits.flower.rarity))}>
                    {traits.flower.rarity}
                  </Badge>
                </div>
                <div className="rounded-xl border bg-white p-3 shadow-card">
                  <span className="mb-1 block text-xs text-muted-foreground">Companion</span>
                  <div className="flex items-center gap-2">
                    <span>{traits.companion.emoji || '—'}</span>
                    <span className="text-sm font-medium">{traits.companion.name}</span>
                  </div>
                  <Badge className={cn('mt-1.5 text-xs', getRarityBadgeClass(traits.companion.rarity))}>
                    {traits.companion.rarity}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* On-Chain Data */}
            <div className="rounded-xl border bg-white p-4 shadow-card">
              <span className="mb-3 block text-sm font-medium">On-Chain Data</span>
              <div className="flex flex-col gap-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Token ID</span>
                  <span className="font-mono-addr font-medium">#{tokenId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Mint Tier</span>
                  {tierInfo && tierColors ? (
                    <Badge className={tierColors.badge}>{tierInfo.name} ({tierInfo.priceSTX} STX)</Badge>
                  ) : (
                    <span className="font-mono-addr text-muted-foreground">--</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Owner</span>
                  <span className="max-w-[200px] truncate font-mono-addr text-xs">{plantState?.owner}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last Watered</span>
                  <span className="font-mono-addr">{lastWaterBlock === 0 ? 'Never' : `Block #${lastWaterBlock}`}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Cooldown</span>
                  <span className="font-mono-addr">{cooldownBlocks === 0 ? 'None (Testnet)' : `${cooldownBlocks} blocks`}</span>
                </div>
              </div>
            </div>

            {/* Impact Pool — Post-Graduation UI */}
            {isTree && (
              <div className="flex flex-col gap-4">
                <Card className={cn('rounded-2xl', isRedeemed ? 'border-dengrow-200 bg-dengrow-50' : 'border-orange-200 bg-orange-50')}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center gap-3">
                      <div className={cn('flex h-16 w-16 items-center justify-center rounded-full', isRedeemed ? 'bg-dengrow-100' : 'bg-orange-100')}>
                        <svg className={cn('h-8 w-8', isRedeemed ? 'text-dengrow-600' : 'text-orange-600')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
                        </svg>
                      </div>
                      <h3 className={cn('text-center text-lg font-bold', isRedeemed ? 'text-dengrow-700' : 'text-orange-700')}>
                        {isRedeemed ? 'Real Impact Made!' : 'Your Tree is in the Impact Pool!'}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge className={isRedeemed ? 'bg-dengrow-100 text-sm text-dengrow-800' : 'bg-orange-100 text-sm text-orange-800'}>
                          {isRedeemed ? 'Redeemed' : 'In Pool'}
                        </Badge>
                        {graduationInfo && (
                          <span className="font-mono-addr text-xs text-muted-foreground">
                            Block #{graduationInfo.graduatedAt}
                          </span>
                        )}
                      </div>
                      <p className={cn('text-center text-sm', isRedeemed ? 'text-dengrow-600' : 'text-orange-600')}>
                        {isRedeemed
                          ? 'This tree has been converted to real-world impact! A real tree was planted thanks to your care.'
                          : 'Your tree is waiting in the Impact Pool to be converted to real-world impact in the next batch redemption.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-card">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-sm font-bold">Impact Pool Status</span>
                      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
                        <Stat className="text-center">
                          <StatLabel>In Pool</StatLabel>
                          <StatNumber className="text-dengrow-600">{poolStats?.currentPoolSize ?? '--'}</StatNumber>
                          <StatHelpText>trees waiting</StatHelpText>
                        </Stat>
                        <Stat className="text-center">
                          <StatLabel>Redeemed</StatLabel>
                          <StatNumber className="text-orange-500">{poolStats?.totalRedeemed ?? '--'}</StatNumber>
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
                          <span className="text-xs text-muted-foreground">Redemption progress</span>
                          <span className="text-xs text-muted-foreground">
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

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Button asChild className="rounded-xl bg-dengrow-500 py-6 text-white hover:bg-dengrow-600" size="lg">
                    <Link href="/my-plants">Mint Another Plant</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className={cn('rounded-xl py-6', isRedeemed ? 'border-dengrow-500 text-dengrow-600 hover:bg-dengrow-50' : 'border-orange-500 text-orange-600 hover:bg-orange-50')}
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
