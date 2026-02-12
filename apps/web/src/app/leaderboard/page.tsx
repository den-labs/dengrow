'use client';

import { useLeaderboard, LeaderboardEntry } from '@/hooks/useLeaderboard';
import { usePoolStats } from '@/hooks/useImpactRegistry';
import { useNetwork } from '@/lib/use-network';
import { getStageName, getStageColor } from '@/hooks/useGetPlant';
import { getColorClasses } from '@/lib/color-variants';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Stat, StatLabel, StatNumber, StatHelpText } from '@/components/ui/stat';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

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
  if (rank === 1) return 'text-yellow-400';
  if (rank === 2) return 'text-gray-400';
  if (rank === 3) return 'text-orange-400';
  return 'text-gray-200';
}

export default function LeaderboardPage() {
  const network = useNetwork();
  const { data: leaderboard, isLoading, isError } = useLeaderboard();
  const { data: poolStats } = usePoolStats();

  if (!network) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p>Please connect your wallet to view the leaderboard</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-green-500" />
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (isError || !leaderboard) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center space-y-4">
          <p className="text-xl text-red-500">Unable to load leaderboard</p>
          <p className="text-gray-600">
            The contracts may not be deployed on this network yet.
          </p>
        </div>
      </div>
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
    <div className="container mx-auto max-w-7xl py-8">
      <div className="flex flex-col space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-green-600">Leaderboard</h1>
          <p className="text-gray-600 mt-2">
            See who's growing the most impact in the DenGrow community
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="py-4">
              <Stat>
                <StatLabel>Total Minted</StatLabel>
                <StatNumber className="text-green-600">{totalMinted}</StatNumber>
                <StatHelpText>plants</StatHelpText>
              </Stat>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <Stat>
                <StatLabel>Graduated</StatLabel>
                <StatNumber className="text-orange-500">{graduated.length}</StatNumber>
                <StatHelpText>trees</StatHelpText>
              </Stat>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <Stat>
                <StatLabel>Active Growers</StatLabel>
                <StatNumber className="text-blue-500">{active.length}</StatNumber>
                <StatHelpText>in progress</StatHelpText>
              </Stat>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <Stat>
                <StatLabel>Unique Growers</StatLabel>
                <StatNumber className="text-purple-500">{topGrowers.length}</StatNumber>
                <StatHelpText>addresses</StatHelpText>
              </Stat>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="top-plants">
          <TabsList>
            <TabsTrigger value="top-plants">Top Plants</TabsTrigger>
            <TabsTrigger value="top-growers">Top Growers</TabsTrigger>
            <TabsTrigger value="recent-activity">Recent Activity</TabsTrigger>
          </TabsList>

          {/* Top Plants Tab */}
          <TabsContent value="top-plants">
            <Card>
              <CardContent className="p-0">
                {entries.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center space-y-3">
                      <span className="text-3xl">🌱</span>
                      <p className="text-gray-500">No plants minted yet</p>
                    </div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px]">Rank</TableHead>
                        <TableHead>Plant</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead className="text-right">Growth</TableHead>
                        <TableHead className="w-[120px]">Progress</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entries.map((entry, index) => (
                        <PlantRow key={entry.tokenId} entry={entry} rank={index + 1} />
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Growers Tab */}
          <TabsContent value="top-growers">
            <Card>
              <CardContent className="p-0">
                {topGrowers.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center space-y-3">
                      <span className="text-3xl">🌱</span>
                      <p className="text-gray-500">No growers yet</p>
                    </div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px]">Rank</TableHead>
                        <TableHead>Grower</TableHead>
                        <TableHead className="text-right">Plants</TableHead>
                        <TableHead className="text-right">Trees</TableHead>
                        <TableHead className="text-right">Total Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topGrowers.map((grower, index) => (
                        <TableRow key={grower.owner}>
                          <TableCell>
                            <span
                              className={`${index < 3 ? 'font-bold' : 'font-normal'} ${getRankColor(index + 1)}`}
                            >
                              {getRankDisplay(index + 1)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm" title={grower.owner}>
                              {truncateAddress(grower.owner)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">{grower.plantCount}</TableCell>
                          <TableCell className="text-right">
                            {grower.trees > 0 && (
                              <Badge className={getColorClasses('orange').badge}>
                                {grower.trees}
                              </Badge>
                            )}
                            {grower.trees === 0 && (
                              <span className="text-gray-400">0</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {grower.totalPoints}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recent Activity Tab */}
          <TabsContent value="recent-activity">
            <Card>
              <CardContent className="p-0">
                {entries.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center space-y-3">
                      <span className="text-3xl">🌱</span>
                      <p className="text-gray-500">No activity yet</p>
                    </div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Plant</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead className="text-right">Last Watered</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...entries]
                        .filter((e) => e.lastWaterBlock > 0)
                        .sort((a, b) => b.lastWaterBlock - a.lastWaterBlock)
                        .slice(0, 20)
                        .map((entry) => (
                          <TableRow key={entry.tokenId}>
                            <TableCell>
                              <Link
                                href={`/my-plants/${entry.tokenId}`}
                                className="text-green-500 font-medium hover:underline"
                              >
                                Plant #{entry.tokenId}
                              </Link>
                            </TableCell>
                            <TableCell>
                              <span className="font-mono text-sm" title={entry.owner}>
                                {truncateAddress(entry.owner)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge className={getColorClasses(getStageColor(entry.stage)).badge}>
                                {getStageName(entry.stage)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="text-sm text-gray-600">
                                Block {entry.lastWaterBlock}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {totalMinted > 50 && (
          <p className="text-sm text-gray-500 text-center">
            Showing top 50 of {totalMinted} minted plants
          </p>
        )}
      </div>
    </div>
  );
}

interface PlantRowProps {
  entry: LeaderboardEntry;
  rank: number;
}

function PlantRow({ entry, rank }: PlantRowProps) {
  const stageColorScheme = getStageColor(entry.stage);
  const colorClasses = getColorClasses(stageColorScheme);

  return (
    <TableRow>
      <TableCell>
        <span className={`${rank <= 3 ? 'font-bold' : 'font-normal'} ${getRankColor(rank)}`}>
          {getRankDisplay(rank)}
        </span>
      </TableCell>
      <TableCell>
        <Link
          href={`/my-plants/${entry.tokenId}`}
          className="text-green-500 font-medium hover:underline"
        >
          Plant #{entry.tokenId}
        </Link>
      </TableCell>
      <TableCell>
        <span className="font-mono text-sm" title={entry.owner}>
          {truncateAddress(entry.owner)}
        </span>
      </TableCell>
      <TableCell>
        <Badge className={colorClasses.badge}>{getStageName(entry.stage)}</Badge>
      </TableCell>
      <TableCell className="text-right font-medium">
        {entry.growthPoints}/7
      </TableCell>
      <TableCell>
        <Progress
          value={(entry.growthPoints / 7) * 100}
          className={`h-2 rounded-full ${colorClasses.bg50}`}
        />
      </TableCell>
    </TableRow>
  );
}
