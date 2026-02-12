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
            <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">Back to Impact Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-gray-600">Loading batch #{batchId}...</p>
        </div>
      </div>
    );
  }

  if (isError || !batch) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-xl text-red-500">Batch #{batchId} not found</p>
          <p className="text-gray-600">
            This batch may not exist yet or the contract is not deployed on this network.
          </p>
          <Link href="/impact">
            <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">Back to Impact Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalBatches = poolStats?.totalBatches ?? 0;
  const hasPrev = batchId > 1;
  const hasNext = batchId < totalBatches;

  return (
    <div className="mx-auto max-w-screen-md px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/impact" className="text-green-500 hover:underline">
            Impact Dashboard
          </Link>
          <span>/</span>
          <span>Batch #{batchId}</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">Batch #{batchId}</h1>
              <Badge className="bg-orange-100 text-orange-800 px-2 py-1 text-sm">
                Verified
              </Badge>
              {sponsor && (
                <Badge className="bg-teal-100 text-teal-800 px-2 py-1 text-sm">
                  Sponsored
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600">
              Redemption proof recorded on-chain
            </p>
          </div>
          <span className="text-3xl">📦</span>
        </div>

        {/* Main Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Batch Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <DetailRow
                label="Trees Redeemed"
                value={
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-green-600">
                      {batch.quantity}
                    </span>
                    <span className="text-gray-500">trees</span>
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
                  <span className="font-mono text-sm" title={batch.recordedBy}>
                    {truncateAddress(batch.recordedBy)}
                  </span>
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Proof Card */}
        <Card>
          <CardHeader>
            <CardTitle>Proof of Impact</CardTitle>
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
                        className="break-all text-sm text-blue-500 hover:underline"
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
                <p className="text-sm text-gray-500">
                  No proof data attached to this batch.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sponsor Card */}
        {sponsor && (
          <Card className="border-teal-200 bg-teal-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-teal-700">Sponsored By</CardTitle>
                <Badge className="bg-teal-100 text-teal-800">Verified</Badge>
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
                    <span className="font-mono text-sm" title={sponsor.sponsor}>
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
            <Card className="cursor-pointer border-dashed border-teal-300 transition-all duration-200 hover:border-teal-400 hover:bg-teal-50">
              <CardContent className="py-4">
                <div className="flex items-center justify-center gap-3">
                  <span className="font-medium text-teal-600">
                    Sponsor this batch
                  </span>
                  <Badge className="border-teal-300 text-teal-700" variant="outline">
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
            <Button variant="ghost" size="sm" className="text-green-600 hover:bg-green-50">
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
      <span className="shrink-0 text-sm text-gray-600">
        {label}
      </span>
      <div>{value}</div>
    </div>
  );
}
