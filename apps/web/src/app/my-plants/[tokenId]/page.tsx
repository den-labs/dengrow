'use client';

import {
  Container,
  VStack,
  HStack,
  Text,
  Image,
  Center,
  Badge,
  Button,
  Box,
  Progress,
  Spinner,
  useToast,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Card,
  CardBody,
  Icon,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

import { useNetwork } from '@/lib/use-network';
import { isTestnetEnvironment } from '@/lib/use-network';
import { useGetPlant, getStageName, getStageColor, getCooldownBlocks } from '@/hooks/useGetPlant';
import { useCurrentAddress } from '@/hooks/useCurrentAddress';
import { getPlantImage } from '@/utils/nft-utils';
import { waterPlant } from '@/lib/game/operations';
import { shouldUseDirectCall, executeContractCall, openContractCall } from '@/lib/contract-utils';
import { useDevnetWallet } from '@/lib/devnet-wallet-context';
import { getExplorerLink } from '@/utils/explorer-links';
import { generateTraits, calculateRarityScore } from '@/lib/traits';

// Stage descriptions for the journey
const stageDescriptions: Record<number, { title: string; description: string; icon: string }> = {
  0: {
    title: 'Seed',
    description: 'Your journey begins! Water daily to help your seed sprout.',
    icon: '🌱',
  },
  1: {
    title: 'Sprout',
    description: 'A tiny sprout emerges! Keep watering to grow stronger.',
    icon: '🌿',
  },
  2: {
    title: 'Seedling',
    description: 'Your plant is growing nicely. Continue the daily care.',
    icon: '🪴',
  },
  3: {
    title: 'Vegetative',
    description: 'Almost there! Your plant is thriving.',
    icon: '🌳',
  },
  4: {
    title: 'Tree',
    description: 'Congratulations! Your plant has graduated to the Impact Pool.',
    icon: '🎄',
  },
};

// Growth milestones
const growthMilestones = [
  { points: 0, stage: 0, label: 'Seed' },
  { points: 2, stage: 1, label: 'Sprout' },
  { points: 4, stage: 2, label: 'Seedling' },
  { points: 5, stage: 3, label: 'Vegetative' },
  { points: 7, stage: 4, label: 'Tree' },
];

export default function PlantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tokenId = Number(params.tokenId);

  const network = useNetwork();
  const currentAddress = useCurrentAddress();
  const { currentWallet } = useDevnetWallet();
  const toast = useToast();

  const [isWatering, setIsWatering] = useState(false);
  const [lastTxId, setLastTxId] = useState<string | null>(null);

  const { data: plantData, isLoading, refetch } = useGetPlant(tokenId);

  const plantState = plantData?.plant;
  const stage = plantState?.stage ?? 0;

  // Get dynamic image URL with current stage
  const imageSrc = getPlantImage(tokenId, stage);

  // Generate deterministic traits for this plant
  const traits = generateTraits(tokenId);
  const rarityScore = calculateRarityScore(traits);
  const growthPoints = plantState?.['growth-points'] ?? 0;
  const lastWaterBlock = plantState?.['last-water-block'] ?? 0;
  const isTree = stage >= 4;

  // Check if watering is allowed
  const isTestnet = network ? isTestnetEnvironment(network) : false;
  const cooldownBlocks = getCooldownBlocks(isTestnet);
  const canWater = plantState && !isTree && (cooldownBlocks === 0 || lastWaterBlock === 0);

  // Calculate progress to next stage
  const currentMilestone = growthMilestones.find((m) => m.stage === stage);
  const nextMilestone = growthMilestones.find((m) => m.stage === stage + 1);
  const pointsToNextStage = nextMilestone ? nextMilestone.points - growthPoints : 0;

  const stageInfo = stageDescriptions[stage] || stageDescriptions[0];

  const handleWater = async () => {
    if (!network) return;

    setIsWatering(true);
    try {
      const txOptions = waterPlant(network, tokenId);

      if (shouldUseDirectCall()) {
        const { txid } = await executeContractCall(txOptions, currentWallet);
        setLastTxId(txid);
        toast({
          title: 'Watering Submitted',
          description: `Transaction broadcast with ID: ${txid.slice(0, 10)}...`,
          status: 'info',
        });
        // Refetch plant data after a delay
        setTimeout(() => refetch(), 3000);
      } else {
        await openContractCall({
          ...txOptions,
          onFinish: (data) => {
            setLastTxId(data.txId);
            toast({
              title: 'Success',
              description: 'Plant watered successfully!',
              status: 'success',
            });
            setTimeout(() => refetch(), 3000);
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

  if (!currentAddress) {
    return (
      <Center h="50vh">
        <Text>Please connect your wallet to view this plant</Text>
      </Center>
    );
  }

  if (isLoading) {
    return (
      <Center h="50vh">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading plant data...</Text>
        </VStack>
      </Center>
    );
  }

  if (!plantData?.exists) {
    return (
      <Center h="50vh">
        <VStack spacing={4}>
          <Text fontSize="xl">Plant #{tokenId} not found</Text>
          <Button as={Link} href="/my-plants" leftIcon={<ArrowBackIcon />}>
            Back to My Plants
          </Button>
        </VStack>
      </Center>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header with back button */}
        <HStack>
          <Button
            as={Link}
            href="/my-plants"
            variant="ghost"
            leftIcon={<ArrowBackIcon />}
            size="sm"
          >
            Back to My Plants
          </Button>
        </HStack>

        {/* Main content */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          {/* Left: Plant Image */}
          <Card>
            <CardBody>
              <VStack spacing={4}>
                <Box
                  position="relative"
                  w="full"
                  paddingTop="100%"
                  borderRadius="lg"
                  overflow="hidden"
                  bg="gray.100"
                >
                  <Center position="absolute" top={0} left={0} right={0} bottom={0}>
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt={`Plant #${tokenId}`}
                        objectFit="cover"
                        w="full"
                        h="full"
                      />
                    ) : (
                      <VStack>
                        <Text fontSize="6xl">{stageInfo.icon}</Text>
                        <Text color="gray.500">Plant #{tokenId}</Text>
                      </VStack>
                    )}
                  </Center>
                  {/* Stage badge overlay */}
                  <Badge
                    position="absolute"
                    top={4}
                    right={4}
                    colorScheme={getStageColor(stage)}
                    fontSize="md"
                    px={3}
                    py={1}
                  >
                    {stageInfo.icon} {getStageName(stage)}
                  </Badge>
                </Box>

                {/* Water button */}
                <Button
                  colorScheme={isTree ? 'orange' : canWater ? 'blue' : 'gray'}
                  size="lg"
                  width="full"
                  isDisabled={isTree || !canWater}
                  isLoading={isWatering}
                  onClick={handleWater}
                >
                  {isTree ? 'Graduated to Impact Pool 🌳' : canWater ? 'Water Plant 💧' : 'Cooldown Active ⏳'}
                </Button>

                {lastTxId && (
                  <Button
                    as="a"
                    href={getExplorerLink(lastTxId, network)}
                    target="_blank"
                    variant="link"
                    colorScheme="blue"
                    size="sm"
                  >
                    View transaction in explorer
                  </Button>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Right: Plant Info */}
          <VStack spacing={6} align="stretch">
            {/* Title and description */}
            <Box>
              <HStack justify="space-between" align="start">
                <VStack align="start" spacing={1}>
                  <Text fontSize="3xl" fontWeight="bold">
                    Plant #{tokenId}
                  </Text>
                  <Text color="gray.600">{stageInfo.description}</Text>
                </VStack>
              </HStack>
            </Box>

            <Divider />

            {/* Stats */}
            <SimpleGrid columns={2} spacing={4}>
              <Stat>
                <StatLabel>Current Stage</StatLabel>
                <StatNumber>
                  {stageInfo.icon} {stageInfo.title}
                </StatNumber>
                <StatHelpText>Stage {stage + 1} of 5</StatHelpText>
              </Stat>

              <Stat>
                <StatLabel>Growth Points</StatLabel>
                <StatNumber>{growthPoints}/7</StatNumber>
                <StatHelpText>
                  {isTree ? 'Fully grown!' : `${pointsToNextStage} more to evolve`}
                </StatHelpText>
              </Stat>
            </SimpleGrid>

            {/* Progress bar */}
            <Box>
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm" fontWeight="medium">
                  Growth Progress
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {Math.round((growthPoints / 7) * 100)}%
                </Text>
              </HStack>
              <Progress
                value={(growthPoints / 7) * 100}
                colorScheme={getStageColor(stage)}
                borderRadius="full"
                size="lg"
              />
            </Box>

            {/* Growth Journey */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={3}>
                Growth Journey
              </Text>
              <HStack spacing={2} justify="space-between">
                {growthMilestones.map((milestone, index) => (
                  <VStack key={milestone.stage} spacing={1}>
                    <Box
                      w={8}
                      h={8}
                      borderRadius="full"
                      bg={stage >= milestone.stage ? `${getStageColor(milestone.stage)}.500` : 'gray.200'}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize="xs" color={stage >= milestone.stage ? 'white' : 'gray.500'}>
                        {stageDescriptions[milestone.stage]?.icon}
                      </Text>
                    </Box>
                    <Text fontSize="xs" color={stage >= milestone.stage ? 'gray.700' : 'gray.400'}>
                      {milestone.label}
                    </Text>
                  </VStack>
                ))}
              </HStack>
            </Box>

            <Divider />

            {/* Plant Data */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={3}>
                On-Chain Data
              </Text>
              <VStack align="stretch" spacing={2} fontSize="sm">
                <HStack justify="space-between">
                  <Text color="gray.600">Token ID</Text>
                  <Text fontFamily="mono">#{tokenId}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="gray.600">Owner</Text>
                  <Text fontFamily="mono" isTruncated maxW="200px">
                    {plantState?.owner}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="gray.600">Last Watered</Text>
                  <Text fontFamily="mono">
                    {lastWaterBlock === 0 ? 'Never' : `Block #${lastWaterBlock}`}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="gray.600">Cooldown</Text>
                  <Text fontFamily="mono">
                    {cooldownBlocks === 0 ? 'None (Testnet)' : `${cooldownBlocks} blocks`}
                  </Text>
                </HStack>
              </VStack>
            </Box>

            <Divider />

            {/* Plant Traits */}
            <Box>
              <HStack justify="space-between" mb={3}>
                <Text fontSize="sm" fontWeight="medium">
                  Traits
                </Text>
                <Badge colorScheme={rarityScore >= 50 ? 'purple' : rarityScore >= 25 ? 'blue' : 'gray'}>
                  Rarity Score: {rarityScore}
                </Badge>
              </HStack>
              <SimpleGrid columns={2} spacing={3}>
                <Box p={3} bg="gray.50" borderRadius="md">
                  <Text fontSize="xs" color="gray.500" mb={1}>Pot</Text>
                  <HStack>
                    <Box w={4} h={4} borderRadius="full" bg={traits.pot.color} />
                    <Text fontSize="sm" fontWeight="medium">{traits.pot.name}</Text>
                  </HStack>
                  <Badge size="sm" colorScheme={traits.pot.rarity === 'legendary' ? 'yellow' : traits.pot.rarity === 'rare' ? 'purple' : traits.pot.rarity === 'uncommon' ? 'blue' : 'gray'} mt={1}>
                    {traits.pot.rarity}
                  </Badge>
                </Box>
                <Box p={3} bg="gray.50" borderRadius="md">
                  <Text fontSize="xs" color="gray.500" mb={1}>Background</Text>
                  <HStack>
                    <Box w={4} h={4} borderRadius="full" bg={traits.background.color} />
                    <Text fontSize="sm" fontWeight="medium">{traits.background.name}</Text>
                  </HStack>
                  <Badge size="sm" colorScheme={traits.background.rarity === 'legendary' ? 'yellow' : traits.background.rarity === 'rare' ? 'purple' : traits.background.rarity === 'uncommon' ? 'blue' : 'gray'} mt={1}>
                    {traits.background.rarity}
                  </Badge>
                </Box>
                <Box p={3} bg="gray.50" borderRadius="md">
                  <Text fontSize="xs" color="gray.500" mb={1}>Flower</Text>
                  <HStack>
                    <Text>{traits.flower.emoji}</Text>
                    <Text fontSize="sm" fontWeight="medium">{traits.flower.name}</Text>
                  </HStack>
                  <Badge size="sm" colorScheme={traits.flower.rarity === 'legendary' ? 'yellow' : traits.flower.rarity === 'rare' ? 'purple' : traits.flower.rarity === 'uncommon' ? 'blue' : 'gray'} mt={1}>
                    {traits.flower.rarity}
                  </Badge>
                </Box>
                <Box p={3} bg="gray.50" borderRadius="md">
                  <Text fontSize="xs" color="gray.500" mb={1}>Companion</Text>
                  <HStack>
                    <Text>{traits.companion.emoji || '—'}</Text>
                    <Text fontSize="sm" fontWeight="medium">{traits.companion.name}</Text>
                  </HStack>
                  <Badge size="sm" colorScheme={traits.companion.rarity === 'legendary' ? 'yellow' : traits.companion.rarity === 'rare' ? 'purple' : traits.companion.rarity === 'uncommon' ? 'blue' : 'gray'} mt={1}>
                    {traits.companion.rarity}
                  </Badge>
                </Box>
              </SimpleGrid>
            </Box>

            {/* Impact Pool CTA for graduated plants */}
            {isTree && (
              <Card bg="orange.50" borderColor="orange.200" borderWidth={1}>
                <CardBody>
                  <VStack spacing={3}>
                    <Text fontSize="lg" fontWeight="bold" color="orange.700">
                      🎉 Congratulations!
                    </Text>
                    <Text textAlign="center" color="orange.600">
                      Your plant has graduated and entered the Impact Pool. It will contribute to
                      real-world impact through weekly batch redemptions.
                    </Text>
                    <Button colorScheme="orange" variant="outline" isDisabled>
                      View Impact Dashboard (Coming Soon)
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            )}
          </VStack>
        </SimpleGrid>
      </VStack>
    </Container>
  );
}
