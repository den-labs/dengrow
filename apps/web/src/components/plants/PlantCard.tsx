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
  const buttonColors = getColorClasses(txPending ? 'orange' : 'blue');

  return (
    <Link href={`/my-plants/${tokenId}`} style={{ textDecoration: 'none' }}>
      <div className="cursor-pointer overflow-hidden rounded-lg border bg-white shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
        <div className="relative pt-[100%]">
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            {imageSrc ? (
              <img src={imageSrc} alt={`Plant #${tokenId}`} className="object-cover" />
            ) : (
              <span className="text-sm text-gray-500">
                Plant #{tokenId}
              </span>
            )}
          </div>
          {tierInfo && tierColors && (
            <span className={cn('absolute left-2 top-2 rounded px-2 py-0.5 text-xs font-medium', tierColors.badge)}>
              {tierInfo.name}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">
              Plant #{tokenId}
            </span>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Badge className={stageColors.badge}>{getStageName(stage)}</Badge>
            )}
          </div>

          {plantState && (
            <>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-gray-600">
                    Growth Progress
                  </span>
                  <span className="text-xs font-medium">
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
                className={cn(buttonColors.button)}
                disabled={isTree || !canWater || !!txPending || isWatering}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleWater();
                }}
              >
                {(isWatering || !!txPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isWatering ? 'Watering...' : txPending ? 'Confirming...' : isTree ? 'Graduated 🌳' : canWater ? 'Water Plant 💧' : 'Cooldown Active ⏳'}
              </Button>
            </>
          )}

          {!plantState && !isLoading && (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-2 w-full rounded-full" />
              <span className="text-center text-xs text-gray-400">
                Loading plant data...
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
