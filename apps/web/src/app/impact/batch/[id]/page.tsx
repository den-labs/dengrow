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
  Link as ChakraLink,
  Divider,
  Code,
  Button,
} from '@chakra-ui/react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useBatchInfo, usePoolStats } from '@/hooks/useImpactRegistry';
import { useNetwork } from '@/lib/use-network';
import { getContractAddress } from '@/constants/contracts';
import { isTestnetEnvironment } from '@/lib/use-network';

function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function truncateHash(hash: string): string {
  if (hash.length <= 16) return hash;
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
}

export default function BatchDetailPage() {
  const params = useParams();
  const batchId = Number(params.id);
  const network = useNetwork();
  const { data: batch, isLoading, isError } = useBatchInfo(batchId);
  const { data: poolStats } = usePoolStats();

  if (!network) {
    return (
      <Center h="50vh">
        <Text>Please connect your wallet to view batch data</Text>
      </Center>
    );
  }

  if (isNaN(batchId) || batchId < 1) {
    return (
      <Center h="50vh">
        <VStack spacing={4}>
          <Text fontSize="xl" color="red.500">Invalid batch ID</Text>
          <Link href="/impact">
            <Button colorScheme="green" variant="outline">Back to Impact Dashboard</Button>
          </Link>
        </VStack>
      </Center>
    );
  }

  if (isLoading) {
    return (
      <Center h="50vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="orange.500" />
          <Text color="gray.600">Loading batch #{batchId}...</Text>
        </VStack>
      </Center>
    );
  }

  if (isError || !batch) {
    return (
      <Center h="50vh">
        <VStack spacing={4}>
          <Text fontSize="xl" color="red.500">Batch #{batchId} not found</Text>
          <Text color="gray.600">
            This batch may not exist yet or the contract is not deployed on this network.
          </Text>
          <Link href="/impact">
            <Button colorScheme="green" variant="outline">Back to Impact Dashboard</Button>
          </Link>
        </VStack>
      </Center>
    );
  }

  const totalBatches = poolStats?.totalBatches ?? 0;
  const hasPrev = batchId > 1;
  const hasNext = batchId < totalBatches;

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Breadcrumb */}
        <HStack spacing={2} fontSize="sm" color="gray.500">
          <Link href="/impact">
            <ChakraLink color="green.500">Impact Dashboard</ChakraLink>
          </Link>
          <Text>/</Text>
          <Text>Batch #{batchId}</Text>
        </HStack>

        {/* Header */}
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <HStack>
              <Heading size="lg">Batch #{batchId}</Heading>
              <Badge colorScheme="orange" fontSize="sm" px={2} py={1}>
                Verified
              </Badge>
            </HStack>
            <Text color="gray.600" fontSize="sm">
              Redemption proof recorded on-chain
            </Text>
          </VStack>
          <Text fontSize="3xl">📦</Text>
        </HStack>

        {/* Main Details Card */}
        <Card>
          <CardHeader>
            <Heading size="md">Batch Details</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <DetailRow
                label="Trees Redeemed"
                value={
                  <HStack>
                    <Text fontWeight="bold" fontSize="lg" color="green.600">
                      {batch.quantity}
                    </Text>
                    <Text color="gray.500">trees</Text>
                  </HStack>
                }
              />
              <Divider />
              <DetailRow
                label="Block Height"
                value={
                  <Code px={2} py={1} borderRadius="md">
                    {batch.timestamp}
                  </Code>
                }
              />
              <Divider />
              <DetailRow
                label="Recorded By"
                value={
                  <Text fontFamily="mono" fontSize="sm" title={batch.recordedBy}>
                    {truncateAddress(batch.recordedBy)}
                  </Text>
                }
              />
            </VStack>
          </CardBody>
        </Card>

        {/* Proof Card */}
        <Card>
          <CardHeader>
            <Heading size="md">Proof of Impact</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {batch.proofUrl && (
                <>
                  <DetailRow
                    label="Proof URL"
                    value={
                      <ChakraLink
                        href={batch.proofUrl}
                        isExternal
                        color="blue.500"
                        fontSize="sm"
                        wordBreak="break-all"
                      >
                        {batch.proofUrl}
                      </ChakraLink>
                    }
                  />
                  <Divider />
                </>
              )}
              {batch.proofHash && (
                <DetailRow
                  label="Proof Hash (SHA-256)"
                  value={
                    <Code
                      px={2}
                      py={1}
                      borderRadius="md"
                      fontSize="xs"
                      wordBreak="break-all"
                      title={batch.proofHash}
                    >
                      {truncateHash(batch.proofHash)}
                    </Code>
                  }
                />
              )}
              {!batch.proofUrl && !batch.proofHash && (
                <Text color="gray.500" fontSize="sm">
                  No proof data attached to this batch.
                </Text>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Navigation */}
        <HStack justify="space-between">
          {hasPrev ? (
            <Link href={`/impact/batch/${batchId - 1}`}>
              <Button variant="outline" size="sm">
                Batch #{batchId - 1}
              </Button>
            </Link>
          ) : (
            <Box />
          )}
          <Link href="/impact">
            <Button colorScheme="green" variant="ghost" size="sm">
              All Batches
            </Button>
          </Link>
          {hasNext ? (
            <Link href={`/impact/batch/${batchId + 1}`}>
              <Button variant="outline" size="sm">
                Batch #{batchId + 1}
              </Button>
            </Link>
          ) : (
            <Box />
          )}
        </HStack>
      </VStack>
    </Container>
  );
}

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <HStack justify="space-between" align="center">
      <Text color="gray.600" fontSize="sm" flexShrink={0}>
        {label}
      </Text>
      <Box>{value}</Box>
    </HStack>
  );
}
