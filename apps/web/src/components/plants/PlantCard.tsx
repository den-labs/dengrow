'use client';

import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNetwork } from '@/lib/use-network';
import { getPlaceholderImage } from '@/utils/nft-utils';
import { useGetPlant, getStageName, getStageColor, getCooldownBlocks } from '@/hooks/useGetPlant';
import { useGetMintTier } from '@/hooks/useGetMintTier';
import { isTestnetEnvironment } from '@/lib/use-network';
import { waterPlant } from '@/lib/game/operations';
import { shouldUseDirectCall, executeContractCall, openContractCall } from '@/lib/contract-utils';
import { getContractErrorMessage } from '@/lib/contract-errors';
import { useGetTxId } from '@/hooks/useNftHoldings';
import { useDevnetWallet } from '@/lib/devnet-wallet-context';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { getColorClasses } from '@/lib/color-variants';
import { cn } from '@/lib/utils';

interface PlantCardProps {
  plant: {
    nftAssetContract: string;
    tokenId: number;
  };
}

export const PlantCard = ({ plant }: PlantCardProps) => {
  const network = useNetwork();
  const { currentWallet } = useDevnetWallet();
  const [isWatering, setIsWatering] = useState(false);
  const [waterTxId, setWaterTxId] = useState<string | null>(null);

  const { nftAssetContract, tokenId } = plant;
  const { data: plantData, isLoading, refetch } = useGetPlant(tokenId);
  const { data: tierInfo } = useGetMintTier(tokenId);
  const { data: txData } = useGetTxId(waterTxId || '');

  const plantState = plantData?.plant;
  const stage = plantState?.stage ?? 0;

  const imageSrc = network ? getPlaceholderImage(network, nftAssetContract, tokenId, stage) : null;

  // Track TX status for water action
  // @ts-ignore
  const txPending = waterTxId && (!txData || txData?.tx_status === 'pending');

  useEffect(() => {
    if (!txData || !waterTxId) return;
    // @ts-ignore
    if (txData.tx_status === 'success') {
      toast.success('Plant Watered', { description: 'Transaction confirmed on-chain' });
      setWaterTxId(null);
      refetch();
    // @ts-ignore
    } else if (txData.tx_status === 'abort_by_response') {
      toast.error('Watering Failed', { description: 'Transaction was rejected on-chain' });
      setWaterTxId(null);
    }
  }, [txData, waterTxId, refetch]);

  const handleWater = async () => {
    if (!network || isWatering || txPending) return;

    setIsWatering(true);
    try {
      const txOptions = waterPlant(network, tokenId);

      if (shouldUseDirectCall()) {
        const { txid } = await executeContractCall(txOptions, currentWallet);
        setWaterTxId(txid);
        toast.info('Watering Submitted', { description: 'Confirming on-chain...' });
      } else {
        await openContractCall({
          ...txOptions,
          onFinish: (data) => {
            setWaterTxId(data.txId);
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

  const growthPoints = plantState?.['growth-points'] ?? 0;
  const isTree = stage >= 4;

  // Check if watering is allowed based on network cooldown
  const isTestnet = network ? isTestnetEnvironment(network) : false;
  const cooldownBlocks = getCooldownBlocks(isTestnet);
  const canWater = plantState && !isTree && (cooldownBlocks === 0 || plantState['last-water-block'] === 0);

  const stageColors = getColorClasses(getStageColor(stage));
  const tierColors = tierInfo ? getColorClasses(tierInfo.colorScheme) : null;

  return (
    <Link href={`/my-plants/${tokenId}`} style={{ textDecoration: 'none' }}>
      <div className="group cursor-pointer overflow-hidden rounded-xl border bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-dengrow-500/30 hover:shadow-card-hover">
        <div className="relative aspect-square">
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-dengrow-50 to-green-100">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={`Plant #${tokenId}`}
                className="h-full w-full object-contain p-4 drop-shadow-lg transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <svg
                className="h-16 w-16 text-dengrow-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 20h10" />
                <path d="M10 20c5.5-2.5.8-6.4 3-10" />
                <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
                <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
              </svg>
            )}
          </div>
          {tierInfo && tierColors && (
            <span
              className={cn(
                'absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                tierColors.badge
              )}
            >
              {tierInfo.name}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <span className="truncate text-sm font-bold">
              Plant #{tokenId}
            </span>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-dengrow-500" />
            ) : (
              <Badge className={cn('text-xs', stageColors.badge)}>
                {getStageName(stage)}
              </Badge>
            )}
          </div>

          {plantState && (
            <>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Growth Progress
                  </span>
                  <span className="text-xs font-semibold text-dengrow-600">
                    {growthPoints}/7
                  </span>
                </div>
                <Progress
                  value={(growthPoints / 7) * 100}
                  className="h-2 rounded-full"
                />
              </div>

              <Button
                size="sm"
                className={cn(
                  'w-full transition-all',
                  isTree
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : canWater
                      ? 'bg-dengrow-500 text-white hover:bg-dengrow-600 shadow-sm hover:shadow-glow'
                      : txPending
                        ? 'bg-orange-500 text-white'
                        : ''
                )}
                disabled={isTree || !canWater || !!txPending || isWatering}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleWater();
                }}
              >
                {(isWatering || !!txPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isWatering ? 'Watering...' : txPending ? 'Confirming...' : isTree ? 'Graduated' : canWater ? 'Water Plant' : 'Cooldown Active'}
              </Button>
            </>
          )}

          {!plantState && !isLoading && (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-2 w-full rounded-full" />
              <span className="text-center text-xs text-muted-foreground">
                Loading plant data...
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
