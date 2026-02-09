'use client';

import {
  Box,
  VStack,
  Text,
  Image,
  Center,
  Badge,
  HStack,
  Button,
  Spinner,
  Progress,
  useToast,
} from '@chakra-ui/react';
import { useNetwork } from '@/lib/use-network';
import { getPlaceholderImage } from '@/utils/nft-utils';
import { useGetPlant, getStageName, getStageColor, getCooldownBlocks } from '@/hooks/useGetPlant';
import { useGetMintTier } from '@/hooks/useGetMintTier';
import { isTestnetEnvironment } from '@/lib/use-network';
import { waterPlant } from '@/lib/game/operations';
import { shouldUseDirectCall, executeContractCall, openContractCall } from '@/lib/contract-utils';
import { useDevnetWallet } from '@/lib/devnet-wallet-context';
import { useState } from 'react';
import Link from 'next/link';

interface PlantCardProps {
  plant: {
    nftAssetContract: string;
    tokenId: number;
  };
}

export const PlantCard = ({ plant }: PlantCardProps) => {
  const network = useNetwork();
  const toast = useToast();
  const { currentWallet } = useDevnetWallet();
  const [isWatering, setIsWatering] = useState(false);

  const { nftAssetContract, tokenId } = plant;
  const { data: plantData, isLoading, refetch } = useGetPlant(tokenId);
  const { data: tierInfo } = useGetMintTier(tokenId);

  const plantState = plantData?.plant;
  const stage = plantState?.stage ?? 0;

  const imageSrc = network ? getPlaceholderImage(network, nftAssetContract, tokenId, stage) : null;

  const handleWater = async () => {
    if (!network) return;

    setIsWatering(true);
    try {
      const txOptions = waterPlant(network, tokenId);

      if (shouldUseDirectCall()) {
        const { txid } = await executeContractCall(txOptions, currentWallet);
        toast({
          title: 'Watering Submitted',
          description: `Transaction broadcast with ID: ${txid}`,
          status: 'info',
        });
        // Refetch plant data after a delay
        setTimeout(() => refetch(), 2000);
      } else {
        await openContractCall({
          ...txOptions,
          onFinish: (data) => {
            toast({
              title: 'Success',
              description: 'Plant watered successfully!',
              status: 'success',
            });
            // Refetch plant data
            setTimeout(() => refetch(), 2000);
          },
          onCancel: () => {
            toast({
              title: 'Cancelled',
              description: 'Transaction was cancelled',
              status: 'info',
            });
          },
        });
      }
    } catch (error: any) {
      console.error('Error watering plant:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to water plant',
        status: 'error',
      });
    } finally {
      setIsWatering(false);
    }
  };

  const growthPoints = plantState?.['growth-points'] ?? 0;
  const isTree = stage >= 4;

  // Check if watering is allowed based on network cooldown
  const isTestnet = network ? isTestnetEnvironment(network) : false;
  const cooldownBlocks = getCooldownBlocks(isTestnet);
  // If cooldown is 0 (testnet), always allow watering. Otherwise check last-water-block.
  const canWater = plantState && !isTree && (cooldownBlocks === 0 || plantState['last-water-block'] === 0);

  return (
    <Link href={`/my-plants/${tokenId}`} style={{ textDecoration: 'none' }}>
      <Box
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        bg="white"
        boxShadow="md"
        transition="transform 0.2s, box-shadow 0.2s"
        _hover={{
          transform: 'translateY(-4px)',
          boxShadow: 'lg',
        }}
        cursor="pointer"
      >
        <Box position="relative" paddingTop="100%">
          <Center position="absolute" top={0} left={0} right={0} bottom={0} bg="gray.100">
            {imageSrc ? (
              <Image src={imageSrc} alt={`Plant #${tokenId}`} objectFit="cover" />
            ) : (
              <Text color="gray.500" fontSize="sm">
                Plant #{tokenId}
              </Text>
            )}
          </Center>
          {tierInfo && (
            <Badge
              position="absolute"
              top={2}
              left={2}
              colorScheme={tierInfo.colorScheme}
              fontSize="xs"
              px={2}
              py={0.5}
            >
              {tierInfo.name}
            </Badge>
          )}
        </Box>
        <VStack p={4} spacing={3} align="stretch">
          <HStack justify="space-between">
            <Text fontWeight="bold" fontSize="lg">
              Plant #{tokenId}
            </Text>
            {isLoading ? (
              <Spinner size="sm" />
            ) : (
              <Badge colorScheme={getStageColor(stage)}>{getStageName(stage)}</Badge>
            )}
          </HStack>

          {plantState && (
            <>
              <Box>
                <HStack justify="space-between" mb={1}>
                  <Text fontSize="xs" color="gray.600">
                    Growth Progress
                  </Text>
                  <Text fontSize="xs" fontWeight="medium">
                    {growthPoints}/7
                  </Text>
                </HStack>
                <Progress
                  value={(growthPoints / 7) * 100}
                  size="sm"
                  colorScheme={getStageColor(stage)}
                  borderRadius="full"
                />
              </Box>

              <Button
                size="sm"
                colorScheme="blue"
                isDisabled={isTree || !canWater}
                isLoading={isWatering}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleWater();
                }}
              >
                {isTree ? 'Graduated 🌳' : canWater ? 'Water Plant 💧' : 'Cooldown Active ⏳'}
              </Button>
            </>
          )}

          {!plantState && !isLoading && (
            <Text fontSize="xs" color="red.500">
              Plant not initialized
            </Text>
          )}
        </VStack>
      </Box>
    </Link>
  );
};
