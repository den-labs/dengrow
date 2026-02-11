'use client';

import {
  Container,
  SimpleGrid,
  VStack,
  Text,
  Heading,
  Center,
  Spinner,
  Button,
  useToast,
  Link,
  Box,
} from '@chakra-ui/react';
import { PlantCard } from '@/components/plants/PlantCard';
import { useNftHoldings, useGetTxId } from '@/hooks/useNftHoldings';
import { formatValue } from '@/lib/clarity-utils';
import { mintPlantNFTWithTier, MINT_TIERS, MintTier } from '@/lib/nft/operations';
import { getNftContract } from '@/constants/contracts';
import { useNetwork } from '@/lib/use-network';
import { useCurrentAddress } from '@/hooks/useCurrentAddress';
import { useAccountBalance } from '@/hooks/useAccountBalance';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { useState, useEffect } from 'react';
import { shouldUseDirectCall, executeContractCall, openContractCall } from '@/lib/contract-utils';
import { getContractErrorMessage } from '@/lib/contract-errors';
import { useDevnetWallet } from '@/lib/devnet-wallet-context';
import { getExplorerLink } from '@/utils/explorer-links';

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
  const toast = useToast();

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
      toast({
        title: 'Minting Confirmed',
        description: 'Your plant has been minted successfully',
        status: 'success',
      });
      setLastTxId(null);
      // @ts-ignore
    } else if (txData && txData.tx_status === 'abort_by_response') {
      toast({
        title: 'Minting Failed',
        description: 'The transaction was aborted',
        status: 'error',
      });
      setLastTxId(null);
    }
  }, [txData, toast]);

  const handleMintPlant = async () => {
    if (!network || !currentAddress || isMinting) return;

    if (!hasEnoughBalance) {
      toast({
        title: 'Insufficient Balance',
        description: `You need at least ${(requiredMicro / 1_000_000).toFixed(2)} STX (${tierInfo.priceSTX} STX + gas). You're short ~${balanceShortfall.toFixed(2)} STX.`,
        status: 'warning',
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
        toast({
          title: `${tierInfo.name} Mint Submitted`,
          description: `Transaction broadcast with ID: ${txid}`,
          status: 'info',
        });
        return;
      }

      await openContractCall({
        ...txOptions,
        onFinish: (data) => {
          setLastTxId(data.txId);
          toast({
            title: 'Success',
            description: `${tierInfo.name} plant minting submitted!`,
            status: 'success',
          });
        },
        onCancel: () => {
          toast({
            title: 'Cancelled',
            description: 'Transaction was cancelled',
            status: 'info',
          });
        },
      });
    } catch (error: unknown) {
      console.error('Error minting plant:', error);
      toast({
        title: 'Minting Failed',
        description: getContractErrorMessage(error),
        status: 'error',
      });
    } finally {
      setIsMinting(false);
    }
  };

  if (!currentAddress) {
    return (
      <Center h="50vh">
        <Text>Please connect your wallet to view your plants</Text>
      </Center>
    );
  }

  if (nftHoldingsLoading) {
    return (
      <Center h="50vh">
        <Spinner />
      </Center>
    );
  }
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Text fontSize="2xl" fontWeight="bold">
          My Plants
        </Text>

        {/* Tier Selection */}
        <Box borderWidth="1px" borderRadius="lg" p={6} bg="white" boxShadow="md">
          <VStack spacing={4} align="stretch">
            <Heading size="md">Mint a Plant NFT</Heading>
            <Text fontSize="sm" color="gray.600">
              Choose your tier and start growing
            </Text>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              {([1, 2, 3] as MintTier[]).map((tier) => {
                const t = MINT_TIERS[tier];
                const isSelected = selectedTier === tier;
                return (
                  <Box
                    key={tier}
                    borderWidth={isSelected ? '2px' : '1px'}
                    borderColor={isSelected ? `${t.colorScheme}.500` : 'gray.200'}
                    borderRadius="lg"
                    p={4}
                    cursor="pointer"
                    onClick={() => setSelectedTier(tier)}
                    _hover={{ shadow: 'md', borderColor: `${t.colorScheme}.300` }}
                    transition="all 0.2s"
                    bg={isSelected ? `${t.colorScheme}.50` : 'white'}
                  >
                    <VStack spacing={2}>
                      <Text fontWeight="bold" fontSize="lg" color={`${t.colorScheme}.600`}>
                        {t.name}
                      </Text>
                      <Text fontWeight="bold" fontSize="2xl">
                        {t.priceSTX} STX
                      </Text>
                      <Text fontSize="sm" color="gray.600" textAlign="center">
                        {t.description}
                      </Text>
                    </VStack>
                  </Box>
                );
              })}
            </SimpleGrid>

            <Button
              colorScheme={hasEnoughBalance ? tierInfo.colorScheme : 'gray'}
              onClick={handleMintPlant}
              size="lg"
              isLoading={isMinting}
              isDisabled={!hasEnoughBalance}
              loadingText="Minting..."
            >
              {hasEnoughBalance
                ? `Mint ${tierInfo.name} Plant — ${tierInfo.priceSTX} STX`
                : `Insufficient balance (need ${(requiredMicro / 1_000_000).toFixed(2)} STX)`}
            </Button>

            {balance && (
              <Text fontSize="xs" color={hasEnoughBalance ? 'gray.500' : 'red.500'} textAlign="center">
                Balance: {balance.stxDecimal.toFixed(2)} STX
                {!hasEnoughBalance && ` — need ~${balanceShortfall.toFixed(2)} more STX`}
              </Text>
            )}

            {lastTxId && (
              <Link
                href={getExplorerLink(lastTxId, network)}
                isExternal
                color="blue.500"
                fontSize="sm"
                textAlign="center"
              >
                View your latest transaction <ExternalLinkIcon mx="2px" />
              </Link>
            )}
          </VStack>
        </Box>

        {/* Plant Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
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
        </SimpleGrid>
      </VStack>
    </Container>
  );
}
