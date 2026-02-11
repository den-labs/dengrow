'use client';

import {
  Container,
  VStack,
  Text,
  Box,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Badge,
  Spinner,
  Center,
  SimpleGrid,
  Button,
  Progress,
  useToast,
} from '@chakra-ui/react';
import { useAchievements, BadgeInfo } from '@/hooks/useAchievements';
import { useCurrentAddress } from '@/hooks/useCurrentAddress';
import { useNetwork } from '@/lib/use-network';
import { useNftHoldings } from '@/hooks/useNftHoldings';
import { useDevnetWallet } from '@/lib/devnet-wallet-context';
import { getNftContract } from '@/constants/contracts';
import { formatValue } from '@/lib/clarity-utils';
import {
  claimFirstSeed,
  claimFirstTree,
  claimGreenThumb,
  claimEarlyAdopter,
} from '@/lib/game/badge-operations';
import { shouldUseDirectCall, executeContractCall, openContractCall } from '@/lib/contract-utils';
import { getContractErrorMessage } from '@/lib/contract-errors';
import { useState } from 'react';

export default function AchievementsPage() {
  const currentAddress = useCurrentAddress();
  const network = useNetwork();
  const { data: achievements, isLoading, refetch } = useAchievements(currentAddress || undefined);
  const { data: nftHoldings } = useNftHoldings(currentAddress || '');
  const { currentWallet } = useDevnetWallet();
  const toast = useToast();
  const [claimingBadge, setClaimingBadge] = useState<number | null>(null);

  // Extract user's plant token IDs from holdings
  const nftContractId = network
    ? `${getNftContract(network).contractAddress}.${getNftContract(network).contractName}`
    : '';
  const plants: { tokenId: number }[] = (nftHoldings?.results || [])
    .filter((h: any) => h.asset_identifier?.startsWith(nftContractId))
    .map((h: any) => ({
      tokenId: Number(formatValue(h.value?.hex).replace('u', '')),
    }))
    .sort((a: { tokenId: number }, b: { tokenId: number }) => a.tokenId - b.tokenId);

  if (!currentAddress) {
    return (
      <Center h="50vh">
        <VStack spacing={4}>
          <Text fontSize="3xl">🏅</Text>
          <Text>Connect your wallet to view achievements</Text>
        </VStack>
      </Center>
    );
  }

  if (isLoading) {
    return (
      <Center h="50vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="purple.500" />
          <Text color="gray.600">Loading achievements...</Text>
        </VStack>
      </Center>
    );
  }

  const badges = achievements?.badges || [];
  const earned = badges.filter((b) => b.earned).length;
  const total = badges.length;

  const handleClaim = async (badgeId: number) => {
    if (!network || claimingBadge) return;

    // Find a suitable plant for the claim
    if (plants.length === 0) {
      toast({ title: 'No plants found', description: 'You need at least one plant to claim badges', status: 'warning' });
      return;
    }

    setClaimingBadge(badgeId);
    try {
      let txOptions;

      switch (badgeId) {
        case 1: // First Seed
          txOptions = claimFirstSeed(network, plants[0].tokenId);
          break;
        case 2: // First Tree - find a tree
        case 4: { // Early Adopter - find token <= 100
          // For these we just pass the first suitable plant
          // The contract will verify eligibility
          const targetToken = badgeId === 4
            ? plants.find((p) => p.tokenId <= 100)
            : plants[0];
          if (!targetToken) {
            toast({ title: 'Not eligible', description: badgeId === 4 ? 'No plant with ID <= 100' : 'No suitable plant found', status: 'warning' });
            setClaimingBadge(null);
            return;
          }
          txOptions = badgeId === 2
            ? claimFirstTree(network, targetToken.tokenId)
            : claimEarlyAdopter(network, targetToken.tokenId);
          break;
        }
        case 3: { // Green Thumb - need 3 plants
          if (plants.length < 3) {
            toast({ title: 'Not eligible', description: 'Need at least 3 plants', status: 'warning' });
            setClaimingBadge(null);
            return;
          }
          txOptions = claimGreenThumb(network, plants[0].tokenId, plants[1].tokenId, plants[2].tokenId);
          break;
        }
        default:
          setClaimingBadge(null);
          return;
      }

      if (shouldUseDirectCall()) {
        await executeContractCall(txOptions, currentWallet);
        toast({ title: 'Badge Claimed!', description: 'Transaction submitted', status: 'success' });
        setTimeout(() => refetch(), 3000);
      } else {
        await openContractCall({
          ...txOptions,
          onFinish: () => {
            toast({ title: 'Badge Claimed!', description: 'Confirming on-chain...', status: 'info' });
            setTimeout(() => refetch(), 10000);
          },
          onCancel: () => {
            toast({ title: 'Cancelled', status: 'info' });
          },
        });
      }
    } catch (error: unknown) {
      console.error('Error claiming badge:', error);
      toast({ title: 'Claim Failed', description: getContractErrorMessage(error), status: 'error' });
    } finally {
      setClaimingBadge(null);
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Text fontSize="3xl" fontWeight="bold" color="purple.600">
            Achievements
          </Text>
          <Text color="gray.600" mt={2}>
            Earn badges by growing your plants and contributing to the community
          </Text>
        </Box>

        {/* Progress */}
        <Card>
          <CardBody>
            <VStack spacing={3}>
              <HStack justify="space-between" w="full">
                <Text fontWeight="medium">Badge Progress</Text>
                <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
                  {earned}/{total}
                </Badge>
              </HStack>
              <Progress
                value={total > 0 ? (earned / total) * 100 : 0}
                colorScheme="purple"
                size="lg"
                borderRadius="full"
                w="full"
              />
            </VStack>
          </CardBody>
        </Card>

        {/* Badge Grid */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {badges.map((badge) => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              isClaiming={claimingBadge === badge.id}
              onClaim={() => handleClaim(badge.id)}
            />
          ))}
        </SimpleGrid>

        {/* Info */}
        <Card bg="purple.50" borderColor="purple.200" borderWidth={1}>
          <CardBody>
            <VStack spacing={2}>
              <Text fontWeight="bold" color="purple.700">
                How Badges Work
              </Text>
              <Text fontSize="sm" color="purple.600" textAlign="center">
                Badges are soulbound achievements recorded on-chain. Claim them by proving your
                eligibility - the smart contract verifies your plants and progress before granting
                each badge.
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
}

interface BadgeCardProps {
  badge: BadgeInfo;
  isClaiming: boolean;
  onClaim: () => void;
}

function BadgeCard({ badge, isClaiming, onClaim }: BadgeCardProps) {
  const earned = badge.earned;

  return (
    <Card
      opacity={earned ? 1 : 0.7}
      borderWidth={earned ? '2px' : '1px'}
      borderColor={earned ? 'purple.300' : 'gray.200'}
      bg={earned ? 'white' : 'gray.50'}
      transition="all 0.2s"
      _hover={earned ? {} : { borderColor: 'purple.200', opacity: 0.9 }}
    >
      <CardBody>
        <HStack spacing={4} align="start">
          <Box
            w={16}
            h={16}
            borderRadius="xl"
            bg={earned ? 'purple.100' : 'gray.100'}
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="3xl"
            flexShrink={0}
            filter={earned ? 'none' : 'grayscale(100%)'}
          >
            {badge.icon}
          </Box>
          <VStack align="start" spacing={1} flex={1}>
            <HStack>
              <Text fontWeight="bold">{badge.name}</Text>
              {earned && (
                <Badge colorScheme="purple" fontSize="xs">
                  Earned
                </Badge>
              )}
            </HStack>
            <Text fontSize="sm" color="gray.600">
              {badge.description}
            </Text>
            {earned && badge.earnedAt && (
              <Text fontSize="xs" color="gray.400">
                Earned at block {badge.earnedAt}
              </Text>
            )}
            {!earned && (
              <Button
                size="sm"
                colorScheme="purple"
                variant="outline"
                mt={1}
                isLoading={isClaiming}
                loadingText="Claiming..."
                onClick={onClaim}
              >
                Claim Badge
              </Button>
            )}
          </VStack>
        </HStack>
      </CardBody>
    </Card>
  );
}
