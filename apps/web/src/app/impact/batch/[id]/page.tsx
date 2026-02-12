'use client';

import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useBatchInfo, usePoolStats, useBatchSponsor } from '@/hooks/useImpactRegistry';
import { useNetwork } from '@/lib/use-network';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

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
  const { data: sponsor } = useBatchSponsor(batchId);

  if (!network) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p>Please connect your wallet to view batch data</p>
      </div>
    );
  }

  if (isNaN(batchId) || batchId < 1) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-xl text-red-500">Invalid batch ID</p>
          <Link href="/impact">
            <Button variant="outline" className="border-dengrow-500 text-dengrow-600 hover:bg-dengrow-50">Back to Impact Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-dengrow-500" />
          <p className="text-muted-foreground">Loading batch #{batchId}...</p>
        </div>
      </div>
    );
  }

  if (isError || !batch) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-xl text-red-500">Batch #{batchId} not found</p>
          <p className="text-muted-foreground">
            This batch may not exist yet or the contract is not deployed on this network.
          </p>
          <Link href="/impact">
            <Button variant="outline" className="border-dengrow-500 text-dengrow-600 hover:bg-dengrow-50">Back to Impact Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalBatches = poolStats?.totalBatches ?? 0;
  const hasPrev = batchId > 1;
  const hasNext = batchId < totalBatches;

  return (
    <div className="relative mx-auto max-w-screen-md px-4 py-8 sm:px-6">
      {/* Gradient background */}
      <div className="absolute left-0 top-0 h-64 w-full bg-gradient-to-b from-dengrow-500/10 to-transparent pointer-events-none" />

      <div className="relative flex flex-col gap-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/impact" className="text-dengrow-500 hover:underline">
            Impact Dashboard
          </Link>
          <span>/</span>
          <span>Batch #{batchId}</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight">Batch #{batchId}</h1>
              <Badge className="bg-orange-50 text-orange-700 border border-orange-200 px-2 py-1 text-sm">
                Verified
              </Badge>
              {sponsor && (
                <Badge className="bg-teal-50 text-teal-700 border border-teal-200 px-2 py-1 text-sm">
                  Sponsored
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Redemption proof recorded on-chain
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-dengrow-50 text-2xl">
            <svg className="h-6 w-6 text-dengrow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
        </div>

        {/* Main Details Card */}
        <Card className="rounded-xl shadow-card">
          <CardHeader>
            <CardTitle className="font-display">Batch Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <DetailRow
                label="Trees Redeemed"
                value={
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-dengrow-600">
                      {batch.quantity}
                    </span>
                    <span className="text-muted-foreground">trees</span>
                  </div>
                }
              />
              <Separator />
              <DetailRow
                label="Block Height"
                value={
                  <code className="rounded bg-muted px-2 py-1 font-mono text-sm">
                    {batch.timestamp}
                  </code>
                }
              />
              <Separator />
              <DetailRow
                label="Recorded By"
                value={
                  <span className="font-mono-addr text-sm" title={batch.recordedBy}>
                    {truncateAddress(batch.recordedBy)}
                  </span>
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Proof Card */}
        <Card className="rounded-xl shadow-card">
          <CardHeader>
            <CardTitle className="font-display">Proof of Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {batch.proofUrl && (
                <>
                  <DetailRow
                    label="Proof URL"
                    value={
                      <a
                        href={batch.proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all text-sm text-dengrow-500 hover:underline"
                      >
                        {batch.proofUrl}
                      </a>
                    }
                  />
                  <Separator />
                </>
              )}
              {batch.proofHash && (
                <DetailRow
                  label="Proof Hash (SHA-256)"
                  value={
                    <code
                      className="break-all rounded bg-muted px-2 py-1 font-mono text-xs"
                      title={batch.proofHash}
                    >
                      {truncateHash(batch.proofHash)}
                    </code>
                  }
                />
              )}
              {!batch.proofUrl && !batch.proofHash && (
                <p className="text-sm text-muted-foreground">
                  No proof data attached to this batch.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sponsor Card */}
        {sponsor && (
          <Card className="rounded-xl border-teal-200 bg-teal-50 shadow-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="font-display text-teal-700">Sponsored By</CardTitle>
                <Badge className="bg-teal-100 text-teal-800 border border-teal-200">Verified</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <DetailRow
                  label="Sponsor"
                  value={
                    <span className="font-bold text-teal-700">
                      {sponsor.sponsorName}
                    </span>
                  }
                />
                <Separator className="bg-teal-200" />
                <DetailRow
                  label="Amount"
                  value={
                    <span className="font-bold text-teal-600">
                      {(sponsor.amount / 1_000_000).toFixed(1)} STX
                    </span>
                  }
                />
                <Separator className="bg-teal-200" />
                <DetailRow
                  label="Address"
                  value={
                    <span className="font-mono-addr text-sm" title={sponsor.sponsor}>
                      {truncateAddress(sponsor.sponsor)}
                    </span>
                  }
                />
                <Separator className="bg-teal-200" />
                <DetailRow
                  label="Block"
                  value={
                    <code className="rounded bg-muted px-2 py-1 font-mono text-sm">
                      {sponsor.sponsoredAt}
                    </code>
                  }
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sponsor CTA if not sponsored */}
        {!sponsor && (
          <Link href="/impact/sponsor">
            <Card className="cursor-pointer rounded-xl border-2 border-dashed border-dengrow-300 transition-all duration-200 hover:border-dengrow-500 hover:bg-dengrow-50 hover:shadow-glow">
              <CardContent className="py-5">
                <div className="flex items-center justify-center gap-3">
                  <span className="font-semibold text-dengrow-600">
                    Sponsor this batch
                  </span>
                  <Badge className="border-dengrow-300 text-dengrow-700" variant="outline">
                    Min 1 STX
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          {hasPrev ? (
            <Link href={`/impact/batch/${batchId - 1}`}>
              <Button variant="outline" size="sm">
                Batch #{batchId - 1}
              </Button>
            </Link>
          ) : (
            <div />
          )}
          <Link href="/impact">
            <Button variant="ghost" size="sm" className="text-dengrow-600 hover:bg-dengrow-50">
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
            <div />
          )}
        </div>
      </div>
    </div>
  );
}

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="shrink-0 text-sm text-muted-foreground">
        {label}
      </span>
      <div>{value}</div>
    </div>
  );
}
