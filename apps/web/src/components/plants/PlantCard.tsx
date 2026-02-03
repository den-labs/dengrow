'use client';

import { Box, VStack, Text, Image, Center, Badge, HStack } from '@chakra-ui/react';
import { useNetwork } from '@/lib/use-network';
import { getPlaceholderImage } from '@/utils/nft-utils';

interface PlantCardProps {
  plant: {
    nftAssetContract: string;
    tokenId: number;
  };
}

export const PlantCard = ({ plant }: PlantCardProps) => {
  const network = useNetwork();
  const { nftAssetContract, tokenId } = plant;
  const imageSrc = network ? getPlaceholderImage(network, nftAssetContract, tokenId) : null;

  return (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden" bg="white" boxShadow="md">
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
      </Box>
      <VStack p={4} spacing={2} align="stretch">
        <HStack justify="space-between">
          <Text fontWeight="bold" fontSize="lg">
            Plant #{tokenId}
          </Text>
          <Badge colorScheme="green">Seed</Badge>
        </HStack>
        <Text fontSize="sm" color="gray.600">
          {nftAssetContract}
        </Text>
      </VStack>
    </Box>
  );
};
