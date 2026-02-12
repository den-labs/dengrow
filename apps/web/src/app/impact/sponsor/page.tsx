'use client';

import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import Link from 'next/link';
import { usePoolStats, useSponsorshipStats } from '@/hooks/useImpactRegistry';
import { useCurrentAddress } from '@/hooks/useCurrentAddress';
import { useNetwork } from '@/lib/use-network';
import { useDevnetWallet } from '@/lib/devnet-wallet-context';
import { sponsorBatch, MIN_SPONSORSHIP_STX } from '@/lib/game/sponsor-operations';
import { shouldUseDirectCall, executeContractCall, openContractCall } from '@/lib/contract-utils';
import { getContractErrorMessage } from '@/lib/contract-errors';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/ui/number-input';
import { Stat, StatLabel, StatNumber, StatHelpText } from '@/components/ui/stat';

export default function SponsorPage() {
  const currentAddress = useCurrentAddress();
  const network = useNetwork();
  const { currentWallet } = useDevnetWallet();
  const { data: poolStats, isLoading: poolLoading } = usePoolStats();
  const { data: sponsorStats, isLoading: statsLoading, refetch } = useSponsorshipStats();

  const [batchId, setBatchId] = useState('');
  const [sponsorName, setSponsorName] = useState('');
  const [amount, setAmount] = useState(MIN_SPONSORSHIP_STX.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentAddress) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="text-3xl">🤝</span>
          <p>Connect your wallet to sponsor a batch</p>
        </div>
      </div>
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
        toast.success('Sponsorship Submitted!', { description: 'Transaction confirmed' });
        refetch();
      } else {
        await openContractCall({
          ...txOptions,
          onFinish: () => {
            toast.info('Sponsorship Submitted!', { description: 'Confirming on-chain...' });
            setTimeout(() => refetch(), 10000);
          },
          onCancel: () => {
            toast.info('Cancelled');
          },
        });
      }
    } catch (error: unknown) {
      console.error('Error sponsoring batch:', error);
      toast.error('Sponsorship Failed', { description: getContractErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-screen-md px-4 py-8">
      <div className="flex flex-col gap-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/impact" className="text-green-500 hover:underline">
            Impact Dashboard
          </Link>
          <span>/</span>
          <span>Sponsor a Batch</span>
        </div>

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-teal-600">
            Sponsor a Batch
          </h1>
          <p className="mt-2 text-gray-600">
            Fund real-world tree planting with on-chain attribution
          </p>
        </div>

        {/* Stats */}
        {!isLoading && sponsorStats && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="py-4">
                <Stat>
                  <StatLabel>Total Sponsored</StatLabel>
                  <StatNumber className="text-teal-600">
                    {(sponsorStats.totalSponsoredAmount / 1_000_000).toFixed(1)} STX
                  </StatNumber>
                  <StatHelpText>from {sponsorStats.totalSponsorships} sponsors</StatHelpText>
                </Stat>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <Stat>
                  <StatLabel>Available Batches</StatLabel>
                  <StatNumber className="text-orange-500">{totalBatches}</StatNumber>
                  <StatHelpText>recorded on-chain</StatHelpText>
                </Stat>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <Stat>
                  <StatLabel>Minimum</StatLabel>
                  <StatNumber className="text-blue-500">{MIN_SPONSORSHIP_STX} STX</StatNumber>
                  <StatHelpText>per sponsorship</StatHelpText>
                </Stat>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sponsor Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sponsorship Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label>Batch ID *</Label>
                <NumberInput
                  min={1}
                  max={totalBatches}
                  value={batchId ? Number(batchId) : 0}
                  onChange={(val) => setBatchId(val.toString())}
                />
                <p className="text-sm text-muted-foreground">
                  Select a batch to sponsor (1 to {totalBatches}).{' '}
                  <Link href="/impact" className="text-green-500 hover:underline">
                    View batches
                  </Link>
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Sponsor Name *</Label>
                <Input
                  placeholder="Your name or organization"
                  value={sponsorName}
                  onChange={(e) => setSponsorName(e.target.value.slice(0, 64))}
                  maxLength={64}
                />
                <p className="text-sm text-muted-foreground">
                  Displayed on the batch proof page (max 64 characters)
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Amount (STX) *</Label>
                <NumberInput
                  min={MIN_SPONSORSHIP_STX}
                  step={1}
                  value={parseFloat(amount) || 0}
                  onChange={(val) => setAmount(val.toString())}
                />
                <p className="text-sm text-muted-foreground">
                  Minimum {MIN_SPONSORSHIP_STX} STX. Funds go directly to the Impact Pool treasury.
                </p>
              </div>

              <Button
                className="w-full bg-teal-600 text-white hover:bg-teal-700"
                size="lg"
                disabled={!isValid || isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting
                  ? 'Submitting...'
                  : `Sponsor Batch #${batchId || '...'} for ${stxAmount} STX`}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* How it works */}
        <Card className="border-teal-200 bg-teal-50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-2">
              <span className="font-bold text-teal-700">
                How Sponsorship Works
              </span>
              <p className="text-center text-sm text-teal-600">
                Your STX is transferred to the Impact Pool treasury and your name is permanently
                recorded on-chain alongside the batch. The batch proof page will display your
                sponsorship for anyone to verify.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
