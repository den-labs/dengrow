'use client';

import {
  Container,
  VStack,
  Text,
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Spinner,
  Center,
  Divider,
  Badge,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Icon,
} from '@chakra-ui/react';
import { usePoolStats, useBatchInfo } from '@/hooks/useImpactRegistry';
import { useNetwork } from '@/lib/use-network';
import Link from 'next/link';

export default function ImpactDashboardPage() {
  const network = useNetwork();
  const { data: poolStats, isLoading, isError } = usePoolStats();

  if (!network) {
    return (
      <Center h="50vh">
        <Text>Please connect your wallet to view impact data</Text>
      </Center>
    );
  }

  if (isLoading) {
    return (
      <Center h="50vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="green.500" />
          <Text color="gray.600">Loading impact data...</Text>
        </VStack>
      </Center>
    );
  }

  if (isError || !poolStats) {
    return (
      <Center h="50vh">
        <VStack spacing={4}>
          <Text fontSize="xl" color="red.500">
            Unable to load impact data
          </Text>
          <Text color="gray.600">
            The impact registry contract may not be deployed on this network yet.
          </Text>
        </VStack>
      </Center>
    );
  }

  const { totalGraduated, totalRedeemed, currentPoolSize, totalBatches } = poolStats;

  // Calculate progress percentage for the visual
  const progressPercent = totalGraduated > 0 ? (totalRedeemed / totalGraduated) * 100 : 0;

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Text fontSize="3xl" fontWeight="bold" color="green.600">
            Impact Dashboard
          </Text>
          <Text color="gray.600" mt={2}>
            Track the real-world impact of graduated DenGrow plants
          </Text>
        </Box>

        {/* Main Stats Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <StatCard
            label="Total Graduated"
            value={totalGraduated}
            helpText="Plants that reached Tree stage"
            colorScheme="green"
            icon="🌳"
          />
          <StatCard
            label="Impact Pool"
            value={currentPoolSize}
            helpText="Trees awaiting redemption"
            colorScheme="blue"
            icon="🌲"
          />
          <StatCard
            label="Total Redeemed"
            value={totalRedeemed}
            helpText="Trees converted to real impact"
            colorScheme="purple"
            icon="🌍"
          />
          <StatCard
            label="Redemption Batches"
            value={totalBatches}
            helpText="Weekly batch operations"
            colorScheme="orange"
            icon="📦"
          />
        </SimpleGrid>

        {/* Progress Section */}
        <Card>
          <CardHeader>
            <Heading size="md">Impact Progress</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Text color="gray.600">Redemption Progress</Text>
                <Badge colorScheme="green" fontSize="md" px={3} py={1}>
                  {progressPercent.toFixed(1)}% Redeemed
                </Badge>
              </HStack>
              <Progress
                value={progressPercent}
                colorScheme="green"
                size="lg"
                borderRadius="full"
                hasStripe
                isAnimated={currentPoolSize > 0}
              />
              <HStack justify="space-between" fontSize="sm" color="gray.500">
                <Text>{totalRedeemed} redeemed</Text>
                <Text>{currentPoolSize} in pool</Text>
                <Text>{totalGraduated} total</Text>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* How It Works Section */}
        <Card>
          <CardHeader>
            <Heading size="md">How Impact Works</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              <StepCard
                step={1}
                title="Grow Your Plant"
                description="Water your plant daily to progress through 5 growth stages"
                icon="💧"
              />
              <StepCard
                step={2}
                title="Graduate to Tree"
                description="After 7 waterings, your plant graduates to Tree stage and enters the Impact Pool"
                icon="🌳"
              />
              <StepCard
                step={3}
                title="Real Impact"
                description="Trees in the pool are redeemed weekly for real-world tree planting"
                icon="🌍"
              />
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Mint Tiers & Revenue */}
        <Card>
          <CardHeader>
            <Heading size="md">Mint Tiers & Impact</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Text color="gray.600" fontSize="sm">
                Every mint directly funds real-world tree planting. Higher tiers contribute more to
                the Impact Pool.
              </Text>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <TierCard name="Basic" price="1 STX" color="green" description="Start your plant journey. Covers base tree planting cost." />
                <TierCard name="Premium" price="2 STX" color="purple" description="Priority support. Funds one full tree planting." />
                <TierCard name="Impact" price="3 STX" color="teal" description="2x donation. Plants two trees for maximum impact." />
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>

        {/* Recent Redemptions */}
        {totalBatches > 0 && (
          <Card>
            <CardHeader>
              <Heading size="md">Recent Redemptions</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={3} align="stretch">
                <Text color="gray.600" fontSize="sm">
                  {totalBatches} batch{totalBatches !== 1 ? 'es' : ''} recorded with proof of real-world impact.
                </Text>
                {Array.from({ length: Math.min(totalBatches, 5) }, (_, i) => totalBatches - i).map(
                  (batchId) => (
                    <BatchRow key={batchId} batchId={batchId} />
                  )
                )}
                {totalBatches > 5 && (
                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    Showing latest 5 of {totalBatches} batches
                  </Text>
                )}
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Empty State */}
        {totalGraduated === 0 && (
          <Card bg="green.50" borderColor="green.200" borderWidth={1}>
            <CardBody>
              <VStack spacing={4} py={8}>
                <Text fontSize="4xl">🌱</Text>
                <Text fontSize="xl" fontWeight="bold" color="green.700">
                  No trees graduated yet
                </Text>
                <Text color="green.600" textAlign="center">
                  Be the first to grow a plant to Tree stage and contribute to the Impact Pool!
                </Text>
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Container>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  helpText: string;
  colorScheme: string;
  icon: string;
}

function StatCard({ label, value, helpText, colorScheme, icon }: StatCardProps) {
  return (
    <Card>
      <CardBody>
        <HStack spacing={4}>
          <Box fontSize="3xl">{icon}</Box>
          <Stat>
            <StatLabel color="gray.600">{label}</StatLabel>
            <StatNumber color={`${colorScheme}.600`}>{value}</StatNumber>
            <StatHelpText>{helpText}</StatHelpText>
          </Stat>
        </HStack>
      </CardBody>
    </Card>
  );
}

interface StepCardProps {
  step: number;
  title: string;
  description: string;
  icon: string;
}

interface TierCardProps {
  name: string;
  price: string;
  color: string;
  description: string;
}

function TierCard({ name, price, color, description }: TierCardProps) {
  return (
    <Box
      p={4}
      borderWidth="1px"
      borderColor={`${color}.200`}
      borderRadius="lg"
      bg={`${color}.50`}
    >
      <VStack spacing={2} align="start">
        <HStack justify="space-between" w="full">
          <Badge colorScheme={color} fontSize="xs">{name}</Badge>
          <Text fontWeight="bold" color={`${color}.600`}>{price}</Text>
        </HStack>
        <Text fontSize="sm" color="gray.600">{description}</Text>
      </VStack>
    </Box>
  );
}

function BatchRow({ batchId }: { batchId: number }) {
  const { data: batch, isLoading } = useBatchInfo(batchId);

  return (
    <Link href={`/impact/batch/${batchId}`} style={{ textDecoration: 'none' }}>
      <HStack
        justify="space-between"
        p={3}
        borderWidth="1px"
        borderRadius="md"
        _hover={{ bg: 'gray.50', borderColor: 'orange.300' }}
        transition="all 0.2s"
        cursor="pointer"
      >
        <HStack spacing={3}>
          <Badge colorScheme="orange">#{batchId}</Badge>
          {isLoading ? (
            <Spinner size="xs" />
          ) : batch ? (
            <Text fontSize="sm" color="gray.700">
              {batch.quantity} tree{batch.quantity !== 1 ? 's' : ''} redeemed
            </Text>
          ) : (
            <Text fontSize="sm" color="gray.400">No data</Text>
          )}
        </HStack>
        <Text color="gray.400" fontSize="sm">View details</Text>
      </HStack>
    </Link>
  );
}

function StepCard({ step, title, description, icon }: StepCardProps) {
  return (
    <VStack
      p={6}
      bg="gray.50"
      borderRadius="lg"
      spacing={3}
      align="center"
      textAlign="center"
    >
      <Box
        w={12}
        h={12}
        borderRadius="full"
        bg="green.100"
        display="flex"
        alignItems="center"
        justifyContent="center"
        fontSize="xl"
      >
        {icon}
      </Box>
      <Badge colorScheme="green">Step {step}</Badge>
      <Text fontWeight="bold">{title}</Text>
      <Text fontSize="sm" color="gray.600">
        {description}
      </Text>
    </VStack>
  );
}
