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
  Button,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormLabel,
  FormHelperText,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useToast,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { useState } from 'react';
import Link from 'next/link';
import { usePoolStats, useSponsorshipStats } from '@/hooks/useImpactRegistry';
import { useCurrentAddress } from '@/hooks/useCurrentAddress';
import { useNetwork } from '@/lib/use-network';
import { useDevnetWallet } from '@/lib/devnet-wallet-context';
import { sponsorBatch, MIN_SPONSORSHIP_STX } from '@/lib/game/sponsor-operations';
import { shouldUseDirectCall, executeContractCall, openContractCall } from '@/lib/contract-utils';
import { getContractErrorMessage } from '@/lib/contract-errors';

export default function SponsorPage() {
  const currentAddress = useCurrentAddress();
  const network = useNetwork();
  const { currentWallet } = useDevnetWallet();
  const toast = useToast();
  const { data: poolStats, isLoading: poolLoading } = usePoolStats();
  const { data: sponsorStats, isLoading: statsLoading, refetch } = useSponsorshipStats();

  const [batchId, setBatchId] = useState('');
  const [sponsorName, setSponsorName] = useState('');
  const [amount, setAmount] = useState(MIN_SPONSORSHIP_STX.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentAddress) {
    return (
      <Center h="50vh">
        <VStack spacing={4}>
          <Text fontSize="3xl">🤝</Text>
          <Text>Connect your wallet to sponsor a batch</Text>
        </VStack>
      </Center>
    );
  }

  const isLoading = poolLoading || statsLoading;
  const totalBatches = poolStats?.totalBatches ?? 0;
  const stxAmount = parseFloat(amount) || 0;
  const microStxAmount = Math.round(stxAmount * 1_000_000);
  const isValid = batchId && sponsorName.trim() && stxAmount >= MIN_SPONSORSHIP_STX && Number(batchId) >= 1 && Number(batchId) <= totalBatches;

  const handleSubmit = async () => {
    if (!network || !currentAddress || !isValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const txOptions = sponsorBatch(
        network,
        Number(batchId),
        sponsorName.trim(),
        microStxAmount,
        currentAddress
      );

      if (shouldUseDirectCall()) {
        await executeContractCall(txOptions, currentWallet);
        toast({ title: 'Sponsorship Submitted!', description: 'Transaction confirmed', status: 'success' });
        refetch();
      } else {
        await openContractCall({
          ...txOptions,
          onFinish: () => {
            toast({ title: 'Sponsorship Submitted!', description: 'Confirming on-chain...', status: 'info' });
            setTimeout(() => refetch(), 10000);
          },
          onCancel: () => {
            toast({ title: 'Cancelled', status: 'info' });
          },
        });
      }
    } catch (error: unknown) {
      console.error('Error sponsoring batch:', error);
      toast({ title: 'Sponsorship Failed', description: getContractErrorMessage(error), status: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Breadcrumb */}
        <HStack spacing={2} fontSize="sm" color="gray.500">
          <Link href="/impact">
            <ChakraLink color="green.500">Impact Dashboard</ChakraLink>
          </Link>
          <Text>/</Text>
          <Text>Sponsor a Batch</Text>
        </HStack>

        {/* Header */}
        <Box textAlign="center">
          <Text fontSize="3xl" fontWeight="bold" color="teal.600">
            Sponsor a Batch
          </Text>
          <Text color="gray.600" mt={2}>
            Fund real-world tree planting with on-chain attribution
          </Text>
        </Box>

        {/* Stats */}
        {!isLoading && sponsorStats && (
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <Card>
              <CardBody py={4}>
                <Stat size="sm">
                  <StatLabel>Total Sponsored</StatLabel>
                  <StatNumber color="teal.600">
                    {(sponsorStats.totalSponsoredAmount / 1_000_000).toFixed(1)} STX
                  </StatNumber>
                  <StatHelpText>from {sponsorStats.totalSponsorships} sponsors</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card>
              <CardBody py={4}>
                <Stat size="sm">
                  <StatLabel>Available Batches</StatLabel>
                  <StatNumber color="orange.500">{totalBatches}</StatNumber>
                  <StatHelpText>recorded on-chain</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card>
              <CardBody py={4}>
                <Stat size="sm">
                  <StatLabel>Minimum</StatLabel>
                  <StatNumber color="blue.500">{MIN_SPONSORSHIP_STX} STX</StatNumber>
                  <StatHelpText>per sponsorship</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
        )}

        {/* Sponsor Form */}
        <Card>
          <CardHeader>
            <Heading size="md">Sponsorship Details</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={5}>
              <FormControl isRequired>
                <FormLabel>Batch ID</FormLabel>
                <NumberInput
                  min={1}
                  max={totalBatches}
                  value={batchId}
                  onChange={(val) => setBatchId(val)}
                >
                  <NumberInputField placeholder={`1 - ${totalBatches}`} />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormHelperText>
                  Select a batch to sponsor (1 to {totalBatches}).{' '}
                  <Link href="/impact">
                    <ChakraLink color="green.500">View batches</ChakraLink>
                  </Link>
                </FormHelperText>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Sponsor Name</FormLabel>
                <Input
                  placeholder="Your name or organization"
                  value={sponsorName}
                  onChange={(e) => setSponsorName(e.target.value.slice(0, 64))}
                  maxLength={64}
                />
                <FormHelperText>
                  Displayed on the batch proof page (max 64 characters)
                </FormHelperText>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Amount (STX)</FormLabel>
                <NumberInput
                  min={MIN_SPONSORSHIP_STX}
                  step={1}
                  value={amount}
                  onChange={(val) => setAmount(val)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormHelperText>
                  Minimum {MIN_SPONSORSHIP_STX} STX. Funds go directly to the Impact Pool treasury.
                </FormHelperText>
              </FormControl>

              <Button
                colorScheme="teal"
                size="lg"
                w="full"
                isDisabled={!isValid}
                isLoading={isSubmitting}
                loadingText="Submitting..."
                onClick={handleSubmit}
              >
                Sponsor Batch #{batchId || '...'} for {stxAmount} STX
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {/* How it works */}
        <Card bg="teal.50" borderColor="teal.200" borderWidth={1}>
          <CardBody>
            <VStack spacing={2}>
              <Text fontWeight="bold" color="teal.700">
                How Sponsorship Works
              </Text>
              <Text fontSize="sm" color="teal.600" textAlign="center">
                Your STX is transferred to the Impact Pool treasury and your name is permanently
                recorded on-chain alongside the batch. The batch proof page will display your
                sponsorship for anyone to verify.
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
}
