'use client';

import { ExternalLink, Loader2 } from 'lucide-react';
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
import { getColorClasses } from '@/lib/color-variants';
import { cn } from '@/lib/utils';

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
      <div className="flex h-[50vh] items-center justify-center">
        <p>Please connect your wallet to view your plants</p>
      </div>
    );
  }

  if (nftHoldingsLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const mintButtonColors = getColorClasses(hasEnoughBalance ? tierInfo.colorScheme : 'gray');

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">
          My Plants
        </h1>

        {/* Tier Selection */}
        <div className="rounded-lg border bg-white p-6 shadow-md">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold">Mint a Plant NFT</h2>
            <p className="text-sm text-gray-600">
              Choose your tier and start growing
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {([1, 2, 3] as MintTier[]).map((tier) => {
                const t = MINT_TIERS[tier];
                const isSelected = selectedTier === tier;
                const colors = getColorClasses(t.colorScheme);
                return (
                  <div
                    key={tier}
                    className={cn(
                      'cursor-pointer rounded-lg border p-4 transition-all duration-200 hover:shadow-md',
                      isSelected
                        ? `border-2 ${colors.border500} ${colors.bg50}`
                        : `border-gray-200 bg-white hover:${colors.border300}`
                    )}
                    onClick={() => setSelectedTier(tier)}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className={cn('text-lg font-bold', colors.text600)}>
                        {t.name}
                      </span>
                      <span className="text-2xl font-bold">
                        {t.priceSTX} STX
                      </span>
                      <span className="text-center text-sm text-gray-600">
                        {t.description}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              className={cn(mintButtonColors.button)}
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

            {balance && (
              <p className={cn('text-center text-xs', hasEnoughBalance ? 'text-gray-500' : 'text-red-500')}>
                Balance: {balance.stxDecimal.toFixed(2)} STX
                {!hasEnoughBalance && ` — need ~${balanceShortfall.toFixed(2)} more STX`}
              </p>
            )}

            {lastTxId && (
              <a
                href={getExplorerLink(lastTxId, network)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 text-center text-sm text-blue-500 hover:underline"
              >
                View your latest transaction <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        {/* Plant Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {nftHoldings?.results && nftHoldings.results.length > 0
            ? nftHoldings.results
                .filter((holding: any) => {
                  if (!network) return false;
                  const expectedContract = getNftContract(network);
                  const fullContractId = `${expectedContract.contractAddress}.${expectedContract.contractName}`;
                  const holdingContract = holding.asset_identifier.split('::')[0];
                  return holdingContract === fullContractId;
                })
                .map((holding: any) => {
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
                })
            : null}
        </div>
      </div>
    </div>
  );
}
