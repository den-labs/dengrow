'use client';

import {
  Container,
  SimpleGrid,
  VStack,
  Text,
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
import { mintFunnyDogNFT } from '@/lib/nft/operations';
import { getNftContract } from '@/constants/contracts';
import { useNetwork } from '@/lib/use-network';
import { useCurrentAddress } from '@/hooks/useCurrentAddress';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { useState, useEffect } from 'react';
import { shouldUseDirectCall, executeContractCall, openContractCall } from '@/lib/contract-utils';
import { useDevnetWallet } from '@/lib/devnet-wallet-context';
import { getExplorerLink } from '@/utils/explorer-links';

export default function MyPlantsPage() {
  const [lastTxId, setLastTxId] = useState<string | null>(null);
  const currentAddress = useCurrentAddress();
  const network = useNetwork();
  const { currentWallet } = useDevnetWallet();
  const { data: nftHoldings, isLoading: nftHoldingsLoading } = useNftHoldings(currentAddress || '');
  const { data: txData } = useGetTxId(lastTxId || '');
  const toast = useToast();

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
    if (!network || !currentAddress) return;

    try {
      const txOptions = mintFunnyDogNFT(network, currentAddress);

      if (shouldUseDirectCall()) {
        const { txid } = await executeContractCall(txOptions, currentWallet);
        setLastTxId(txid);
        toast({
          title: 'Minting Submitted',
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
            description: 'Minting submitted!',
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
    } catch (error) {
      console.error('Error minting plant:', error);
      toast({
        title: 'Error',
        description: 'Failed to mint plant',
        status: 'error',
      });
    }
  };

  const MintCard = () => (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden" bg="white" boxShadow="md">
      <Box position="relative" paddingTop="100%">
        <Center position="absolute" top={0} left={0} right={0} bottom={0} bg="gray.100"></Center>
      </Box>
      <VStack p={4} spacing={3} align="stretch">
        <Text fontWeight="bold" fontSize="lg">
          Mint a Plant NFT
        </Text>
        <Text fontSize="sm" color="gray.600">
          Start a new plant and begin your daily growth streak.
        </Text>
        <Button colorScheme="green" onClick={handleMintPlant} width="full" size="sm">
          Mint Plant
        </Button>
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
  );

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
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {nftHoldings?.results && nftHoldings.results.length > 0
            ? nftHoldings.results
                .filter((holding: any) => {
                  // Only show NFTs from the correct contract for current network
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
          <MintCard />
        </SimpleGrid>
      </VStack>
    </Container>
  );
}
