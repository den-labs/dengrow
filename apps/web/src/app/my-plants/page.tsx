'use client';

import { ExternalLink, Loader2, Wallet, Sprout } from 'lucide-react';
import { toast } from 'sonner';
import { PlantCard } from '@/components/plants/PlantCard';
import { useNftHoldings, useGetTxId } from '@/hooks/useNftHoldings';
import { formatValue } from '@/lib/clarity-utils';
import { mintPlantNFTWithTier, MINT_TIERS, MintTier } from '@/lib/nft/operations';
import { getNftContract } from '@/constants/contracts';
import { useNetwork } from '@/lib/use-network';
import { useCurrentAddress } from '@/hooks/useCurrentAddress';
import { useAccountBalance } from '@/hooks/useAccountBalance';
import { useState, useEffect } from 'react';
import { shouldUseDirectCall, executeContractCall, openContractCall } from '@/lib/contract-utils';
import { getContractErrorMessage } from '@/lib/contract-errors';
import { useDevnetWallet } from '@/lib/devnet-wallet-context';
import { getExplorerLink } from '@/utils/explorer-links';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { getColorClasses } from '@/lib/color-variants';
import { cn } from '@/lib/utils';

const TIER_FEATURES: Record<MintTier, string[]> = {
  1: ['1x Growth Speed'],
  2: ['1.5x Growth Speed', 'High Yield'],
  3: ['2x Growth Speed', 'Real Tree Planted'],
};

export default function MyPlantsPage() {
  const [lastTxId, setLastTxId] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<MintTier>(1);
  const [isMinting, setIsMinting] = useState(false);
  const currentAddress = useCurrentAddress();
  const network = useNetwork();
  const { currentWallet } = useDevnetWallet();
  const { data: nftHoldings, isLoading: nftHoldingsLoading } = useNftHoldings(currentAddress || '');
  const { data: balance } = useAccountBalance(currentAddress || undefined);
  const { data: txData } = useGetTxId(lastTxId || '');

  // Fee buffer: 0.05 STX (50,000 microSTX) to cover gas
  const FEE_BUFFER_MICRO = 50_000;
  const tierInfo = MINT_TIERS[selectedTier];
  const requiredMicro = tierInfo.priceMicroSTX + FEE_BUFFER_MICRO;
  const hasEnoughBalance = balance ? Number(balance.stx) >= requiredMicro : true;
  const balanceShortfall = balance
    ? Math.max(0, (requiredMicro - Number(balance.stx)) / 1_000_000)
    : 0;

  useEffect(() => {
    // @ts-ignore
    if (txData && txData.tx_status === 'success') {
      toast.success('Minting Confirmed', { description: 'Your plant has been minted successfully' });
      setLastTxId(null);
    // @ts-ignore
    } else if (txData && txData.tx_status === 'abort_by_response') {
      toast.error('Minting Failed', { description: 'The transaction was aborted' });
      setLastTxId(null);
    }
  }, [txData]);

  const handleMintPlant = async () => {
    if (!network || !currentAddress || isMinting) return;

    if (!hasEnoughBalance) {
      toast.warning('Insufficient Balance', {
        description: `You need at least ${(requiredMicro / 1_000_000).toFixed(2)} STX (${tierInfo.priceSTX} STX + gas). You're short ~${balanceShortfall.toFixed(2)} STX.`,
        duration: 8000,
      });
      return;
    }

    setIsMinting(true);

    try {
      const txOptions = mintPlantNFTWithTier(network, currentAddress, selectedTier, currentAddress);

      if (shouldUseDirectCall()) {
        const { txid } = await executeContractCall(txOptions, currentWallet);
        setLastTxId(txid);
        toast.info(`${tierInfo.name} Mint Submitted`, {
          description: `Transaction broadcast with ID: ${txid}`,
        });
        return;
      }

      await openContractCall({
        ...txOptions,
        onFinish: (data) => {
          setLastTxId(data.txId);
          toast.success('Success', { description: `${tierInfo.name} plant minting submitted!` });
        },
        onCancel: () => {
          toast.info('Cancelled', { description: 'Transaction was cancelled' });
        },
      });
    } catch (error: unknown) {
      console.error('Error minting plant:', error);
      toast.error('Minting Failed', { description: getContractErrorMessage(error) });
    } finally {
      setIsMinting(false);
    }
  };

  if (!currentAddress) {
    return (
      <div className="flex h-[50vh] items-center justify-center px-4">
        <EmptyState
          variant="wallet"
          title="Wallet Not Connected"
          description="Connect your Stacks wallet to view your DenGrow garden and mint new plants."
          className="max-w-md"
        />
      </div>
    );
  }

  if (nftHoldingsLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <EmptyState
          variant="loading"
          title="Loading your garden..."
          description="Fetching plant data from Stacks"
          className="border-none bg-transparent shadow-none"
        />
      </div>
    );
  }

  const mintButtonColors = getColorClasses(hasEnoughBalance ? tierInfo.colorScheme : 'gray');

  const filteredPlants = nftHoldings?.results
    ? nftHoldings.results.filter((holding: any) => {
        if (!network) return false;
        const expectedContract = getNftContract(network);
        const fullContractId = `${expectedContract.contractAddress}.${expectedContract.contractName}`;
        const holdingContract = holding.asset_identifier.split('::')[0];
        return holdingContract === fullContractId;
      })
    : [];

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Gradient background overlay */}
      <div className="absolute left-0 top-0 h-96 w-full bg-gradient-to-b from-dengrow-500/10 to-transparent pointer-events-none" />

      <div className="relative flex flex-col gap-8">
        {/* Page Header */}
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            My Plants
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your collection and mint new seeds.
          </p>
        </div>

        {/* Mint Section Card */}
        <div className="rounded-2xl border bg-white p-6 shadow-card sm:p-8">
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="font-display text-xl font-bold">Mint a Plant NFT</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose your tier and start growing
              </p>
            </div>

            {/* Tier Selection Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {([1, 2, 3] as MintTier[]).map((tier) => {
                const t = MINT_TIERS[tier];
                const isSelected = selectedTier === tier;
                const colors = getColorClasses(t.colorScheme);
                const isPopular = tier === 2;
                return (
                  <div
                    key={tier}
                    className={cn(
                      'relative cursor-pointer rounded-xl border p-5 transition-all duration-200 hover:shadow-lg',
                      isSelected
                        ? 'border-2 border-dengrow-500 bg-dengrow-50 shadow-glow'
                        : 'border-gray-200 bg-white',
                      isPopular && !isSelected && 'shadow-glow'
                    )}
                    onClick={() => setSelectedTier(tier)}
                  >
                    {isPopular && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-dengrow-500 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        Popular
                      </span>
                    )}
                    <div className="flex flex-col items-center gap-3">
                      <span className={cn('text-lg font-bold', colors.text600)}>
                        {t.name}
                      </span>
                      <span className="text-3xl font-bold">
                        {t.priceSTX} STX
                      </span>
                      <span className="text-center text-sm text-muted-foreground">
                        {t.description}
                      </span>
                      {/* Features list */}
                      <ul className="mt-1 flex flex-col gap-1">
                        {TIER_FEATURES[tier].map((feature) => (
                          <li key={feature} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Sprout className="h-3 w-3 text-dengrow-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mint Button */}
            <Button
              className={cn(
                'bg-dengrow-500 text-white hover:bg-dengrow-600 shadow-sm hover:shadow-glow',
                !hasEnoughBalance && mintButtonColors.button
              )}
              onClick={handleMintPlant}
              size="lg"
              disabled={!hasEnoughBalance || isMinting}
            >
              {isMinting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isMinting
                ? 'Minting...'
                : hasEnoughBalance
                  ? `Mint ${tierInfo.name} Plant — ${tierInfo.priceSTX} STX`
                  : `Insufficient balance (need ${(requiredMicro / 1_000_000).toFixed(2)} STX)`}
            </Button>

            {/* Balance Display */}
            {balance && (
              <div className={cn(
                'flex items-center justify-center gap-2 rounded-lg px-4 py-2',
                hasEnoughBalance ? 'bg-dengrow-50' : 'bg-red-50'
              )}>
                <Wallet className={cn(
                  'h-4 w-4',
                  hasEnoughBalance ? 'text-dengrow-500' : 'text-red-500'
                )} />
                <p className={cn(
                  'text-sm font-medium',
                  hasEnoughBalance ? 'text-dengrow-700' : 'text-red-600'
                )}>
                  {balance.stxDecimal.toFixed(2)} STX
                  {!hasEnoughBalance && (
                    <span className="ml-1 font-normal text-red-500">
                      — need ~{balanceShortfall.toFixed(2)} more STX
                    </span>
                  )}
                </p>
              </div>
            )}

            {lastTxId && (
              <a
                href={getExplorerLink(lastTxId, network)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 text-center text-sm text-dengrow-600 hover:text-dengrow-700 hover:underline"
              >
                View your latest transaction <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        {/* Plant Grid Section */}
        <div>
          <div className="mb-4 flex items-center gap-3">
            <h2 className="font-display text-xl font-bold tracking-tight">Your Garden</h2>
            <span className="rounded-full bg-dengrow-50 px-2.5 py-0.5 text-sm font-semibold text-dengrow-600">
              {filteredPlants.length}
            </span>
          </div>

          {filteredPlants.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filteredPlants.map((holding: any) => {
                const tokenId = +formatValue(holding.value.hex).replace('u', '');
                return (
                  <PlantCard
                    key={`${holding.asset_identifier}-${tokenId}`}
                    plant={{
                      nftAssetContract: holding.asset_identifier.split('::')[0],
                      tokenId,
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState
              variant="empty"
              title="No plants yet"
              description="Mint your first seed above to start your garden."
              className="min-h-[200px]"
            />
          )}
        </div>
      </div>
    </div>
  );
}
