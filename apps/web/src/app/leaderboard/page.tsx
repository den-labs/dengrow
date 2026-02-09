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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Progress,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { useLeaderboard, LeaderboardEntry } from '@/hooks/useLeaderboard';
import { usePoolStats } from '@/hooks/useImpactRegistry';
import { useNetwork } from '@/lib/use-network';
import { getStageName, getStageColor } from '@/hooks/useGetPlant';
import Link from 'next/link';

function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getRankDisplay(rank: number): string {
  if (rank === 1) return '1st';
  if (rank === 2) return '2nd';
  if (rank === 3) return '3rd';
  return `${rank}th`;
}

function getRankColor(rank: number): string {
  if (rank === 1) return 'yellow.400';
  if (rank === 2) return 'gray.400';
  if (rank === 3) return 'orange.400';
  return 'gray.200';
}

export default function LeaderboardPage() {
  const network = useNetwork();
  const { data: leaderboard, isLoading, isError } = useLeaderboard();
  const { data: poolStats } = usePoolStats();

  if (!network) {
    return (
      <Center h="50vh">
        <Text>Please connect your wallet to view the leaderboard</Text>
      </Center>
    );
  }

  if (isLoading) {
    return (
      <Center h="50vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="green.500" />
          <Text color="gray.600">Loading leaderboard...</Text>
        </VStack>
      </Center>
    );
  }

  if (isError || !leaderboard) {
    return (
      <Center h="50vh">
        <VStack spacing={4}>
          <Text fontSize="xl" color="red.500">
            Unable to load leaderboard
          </Text>
          <Text color="gray.600">
            The contracts may not be deployed on this network yet.
          </Text>
        </VStack>
      </Center>
    );
  }

  const { entries, totalMinted } = leaderboard;
  const graduated = entries.filter((e) => e.stage >= 4);
  const active = entries.filter((e) => e.stage < 4 && e.growthPoints > 0);
  const seeds = entries.filter((e) => e.growthPoints === 0);

  // Aggregate by owner for top growers
  const ownerMap = new Map<string, { totalPoints: number; plantCount: number; trees: number }>();
  for (const entry of entries) {
    const existing = ownerMap.get(entry.owner) || { totalPoints: 0, plantCount: 0, trees: 0 };
    existing.totalPoints += entry.growthPoints;
    existing.plantCount += 1;
    if (entry.stage >= 4) existing.trees += 1;
    ownerMap.set(entry.owner, existing);
  }

  const topGrowers = Array.from(ownerMap.entries())
    .map(([owner, stats]) => ({ owner, ...stats }))
    .sort((a, b) => {
      if (b.trees !== a.trees) return b.trees - a.trees;
      return b.totalPoints - a.totalPoints;
    });

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Text fontSize="3xl" fontWeight="bold" color="green.600">
            Leaderboard
          </Text>
          <Text color="gray.600" mt={2}>
            See who's growing the most impact in the DenGrow community
          </Text>
        </Box>

        {/* Summary Stats */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Card>
            <CardBody py={4}>
              <Stat size="sm">
                <StatLabel>Total Minted</StatLabel>
                <StatNumber color="green.600">{totalMinted}</StatNumber>
                <StatHelpText>plants</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody py={4}>
              <Stat size="sm">
                <StatLabel>Graduated</StatLabel>
                <StatNumber color="orange.500">{graduated.length}</StatNumber>
                <StatHelpText>trees</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody py={4}>
              <Stat size="sm">
                <StatLabel>Active Growers</StatLabel>
                <StatNumber color="blue.500">{active.length}</StatNumber>
                <StatHelpText>in progress</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody py={4}>
              <Stat size="sm">
                <StatLabel>Unique Growers</StatLabel>
                <StatNumber color="purple.500">{topGrowers.length}</StatNumber>
                <StatHelpText>addresses</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Tabs */}
        <Tabs colorScheme="green" variant="enclosed">
          <TabList>
            <Tab>Top Plants</Tab>
            <Tab>Top Growers</Tab>
            <Tab>Recent Activity</Tab>
          </TabList>

          <TabPanels>
            {/* Top Plants Tab */}
            <TabPanel px={0}>
              <Card>
                <CardBody p={0}>
                  {entries.length === 0 ? (
                    <Center py={12}>
                      <VStack spacing={3}>
                        <Text fontSize="3xl">🌱</Text>
                        <Text color="gray.500">No plants minted yet</Text>
                      </VStack>
                    </Center>
                  ) : (
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th w="60px">Rank</Th>
                          <Th>Plant</Th>
                          <Th>Owner</Th>
                          <Th>Stage</Th>
                          <Th isNumeric>Growth</Th>
                          <Th w="120px">Progress</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {entries.map((entry, index) => (
                          <PlantRow key={entry.tokenId} entry={entry} rank={index + 1} />
                        ))}
                      </Tbody>
                    </Table>
                  )}
                </CardBody>
              </Card>
            </TabPanel>

            {/* Top Growers Tab */}
            <TabPanel px={0}>
              <Card>
                <CardBody p={0}>
                  {topGrowers.length === 0 ? (
                    <Center py={12}>
                      <VStack spacing={3}>
                        <Text fontSize="3xl">🌱</Text>
                        <Text color="gray.500">No growers yet</Text>
                      </VStack>
                    </Center>
                  ) : (
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th w="60px">Rank</Th>
                          <Th>Grower</Th>
                          <Th isNumeric>Plants</Th>
                          <Th isNumeric>Trees</Th>
                          <Th isNumeric>Total Points</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {topGrowers.map((grower, index) => (
                          <Tr key={grower.owner}>
                            <Td>
                              <Text
                                fontWeight={index < 3 ? 'bold' : 'normal'}
                                color={getRankColor(index + 1)}
                              >
                                {getRankDisplay(index + 1)}
                              </Text>
                            </Td>
                            <Td>
                              <Text fontFamily="mono" fontSize="sm" title={grower.owner}>
                                {truncateAddress(grower.owner)}
                              </Text>
                            </Td>
                            <Td isNumeric>{grower.plantCount}</Td>
                            <Td isNumeric>
                              {grower.trees > 0 && (
                                <Badge colorScheme="orange">{grower.trees}</Badge>
                              )}
                              {grower.trees === 0 && (
                                <Text color="gray.400">0</Text>
                              )}
                            </Td>
                            <Td isNumeric fontWeight="medium">{grower.totalPoints}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  )}
                </CardBody>
              </Card>
            </TabPanel>

            {/* Recent Activity Tab */}
            <TabPanel px={0}>
              <Card>
                <CardBody p={0}>
                  {entries.length === 0 ? (
                    <Center py={12}>
                      <VStack spacing={3}>
                        <Text fontSize="3xl">🌱</Text>
                        <Text color="gray.500">No activity yet</Text>
                      </VStack>
                    </Center>
                  ) : (
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Plant</Th>
                          <Th>Owner</Th>
                          <Th>Stage</Th>
                          <Th isNumeric>Last Watered</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {[...entries]
                          .filter((e) => e.lastWaterBlock > 0)
                          .sort((a, b) => b.lastWaterBlock - a.lastWaterBlock)
                          .slice(0, 20)
                          .map((entry) => (
                            <Tr key={entry.tokenId}>
                              <Td>
                                <Link
                                  href={`/my-plants/${entry.tokenId}`}
                                  style={{ textDecoration: 'none' }}
                                >
                                  <Text color="green.500" fontWeight="medium" _hover={{ textDecoration: 'underline' }}>
                                    Plant #{entry.tokenId}
                                  </Text>
                                </Link>
                              </Td>
                              <Td>
                                <Text fontFamily="mono" fontSize="sm" title={entry.owner}>
                                  {truncateAddress(entry.owner)}
                                </Text>
                              </Td>
                              <Td>
                                <Badge colorScheme={getStageColor(entry.stage)}>
                                  {getStageName(entry.stage)}
                                </Badge>
                              </Td>
                              <Td isNumeric>
                                <Text fontSize="sm" color="gray.600">
                                  Block {entry.lastWaterBlock}
                                </Text>
                              </Td>
                            </Tr>
                          ))}
                      </Tbody>
                    </Table>
                  )}
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {totalMinted > 50 && (
          <Text fontSize="sm" color="gray.500" textAlign="center">
            Showing top 50 of {totalMinted} minted plants
          </Text>
        )}
      </VStack>
    </Container>
  );
}

interface PlantRowProps {
  entry: LeaderboardEntry;
  rank: number;
}

function PlantRow({ entry, rank }: PlantRowProps) {
  return (
    <Tr>
      <Td>
        <Text fontWeight={rank <= 3 ? 'bold' : 'normal'} color={getRankColor(rank)}>
          {getRankDisplay(rank)}
        </Text>
      </Td>
      <Td>
        <Link href={`/my-plants/${entry.tokenId}`} style={{ textDecoration: 'none' }}>
          <Text color="green.500" fontWeight="medium" _hover={{ textDecoration: 'underline' }}>
            Plant #{entry.tokenId}
          </Text>
        </Link>
      </Td>
      <Td>
        <Text fontFamily="mono" fontSize="sm" title={entry.owner}>
          {truncateAddress(entry.owner)}
        </Text>
      </Td>
      <Td>
        <Badge colorScheme={getStageColor(entry.stage)}>{getStageName(entry.stage)}</Badge>
      </Td>
      <Td isNumeric fontWeight="medium">
        {entry.growthPoints}/7
      </Td>
      <Td>
        <Progress
          value={(entry.growthPoints / 7) * 100}
          size="sm"
          colorScheme={getStageColor(entry.stage)}
          borderRadius="full"
        />
      </Td>
    </Tr>
  );
}
