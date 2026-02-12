'use client';

import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { usePoolStats, useBatchInfo } from '@/hooks/useImpactRegistry';
import { useTreasuryStats } from '@/hooks/useTreasury';
import { useCurrentAddress } from '@/hooks/useCurrentAddress';
import { useNetwork } from '@/lib/use-network';
import { useDevnetWallet } from '@/lib/devnet-wallet-context';
import { getContractAddress } from '@/constants/contracts';
import {
  redeemWithPayout,
  depositToTreasury,
  setPartner,
  setPricePerTree,
  sha256,
} from '@/lib/treasury/operations';
import { shouldUseDirectCall, executeContractCall, openContractCall } from '@/lib/contract-utils';
import { getContractErrorMessage } from '@/lib/contract-errors';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Stat, StatLabel, StatNumber, StatHelpText } from '@/components/ui/stat';
import { NumberInput } from '@/components/ui/number-input';
import { getColorClasses } from '@/lib/color-variants';
import { cn } from '@/lib/utils';

export default function ImpactDashboardPage() {
  const network = useNetwork();
  const currentAddress = useCurrentAddress();
  const { currentWallet } = useDevnetWallet();
  const { data: poolStats, isLoading, isError, refetch } = usePoolStats();

  if (!network) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p>Please connect your wallet to view impact data</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          <p className="text-gray-600">Loading impact data...</p>
        </div>
      </div>
    );
  }

  if (isError || !poolStats) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-xl text-red-500">Unable to load impact data</p>
          <p className="text-gray-600">The impact registry contract may not be deployed on this network yet.</p>
        </div>
      </div>
    );
  }

  const { totalGraduated, totalRedeemed, currentPoolSize, totalBatches } = poolStats;
  const progressPercent = totalGraduated > 0 ? (totalRedeemed / totalGraduated) * 100 : 0;
  const deployerAddress = network ? getContractAddress(network) : null;
  const isAdmin = !!currentAddress && !!deployerAddress && currentAddress === deployerAddress;

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-green-600">Impact Dashboard</h1>
          <p className="mt-2 text-gray-600">Track the real-world impact of graduated DenGrow plants</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Graduated" value={totalGraduated} helpText="Plants that reached Tree stage" colorScheme="green" icon="🌳" />
          <StatCard label="Impact Pool" value={currentPoolSize} helpText="Trees awaiting redemption" colorScheme="blue" icon="🌲" />
          <StatCard label="Total Redeemed" value={totalRedeemed} helpText="Trees converted to real impact" colorScheme="purple" icon="🌍" />
          <StatCard label="Redemption Batches" value={totalBatches} helpText="Weekly batch operations" colorScheme="orange" icon="📦" />
        </div>

        {/* Progress Section */}
        <Card>
          <CardHeader>
            <CardTitle>Impact Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Redemption Progress</span>
                <Badge className="bg-green-100 px-3 py-1 text-base text-green-800">
                  {progressPercent.toFixed(1)}% Redeemed
                </Badge>
              </div>
              <Progress value={progressPercent} className="h-3 rounded-full" />
              <div className="flex justify-between text-sm text-gray-500">
                <span>{totalRedeemed} redeemed</span>
                <span>{currentPoolSize} in pool</span>
                <span>{totalGraduated} total</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin: Record Redemption */}
        {isAdmin && currentPoolSize > 0 && (
          <AdminRedemptionCard
            network={network!}
            currentAddress={currentAddress!}
            currentPoolSize={currentPoolSize}
            nextBatchId={totalBatches + 1}
            currentWallet={currentWallet}
            onSuccess={() => refetch()}
          />
        )}

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>How Impact Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <StepCard step={1} title="Grow Your Plant" description="Water your plant daily to progress through 5 growth stages" icon="💧" />
              <StepCard step={2} title="Graduate to Tree" description="After 7 waterings, your plant graduates to Tree stage and enters the Impact Pool" icon="🌳" />
              <StepCard step={3} title="Real Impact" description="Trees in the pool are redeemed weekly for real-world tree planting" icon="🌍" />
            </div>
          </CardContent>
        </Card>

        {/* Mint Tiers */}
        <Card>
          <CardHeader>
            <CardTitle>Mint Tiers & Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-gray-600">
                Every mint directly funds real-world tree planting. Higher tiers contribute more to the Impact Pool.
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <TierCard name="Basic" price="1 STX" color="green" description="Start your plant journey. Covers base tree planting cost." />
                <TierCard name="Premium" price="2 STX" color="purple" description="Priority support. Funds one full tree planting." />
                <TierCard name="Impact" price="3 STX" color="teal" description="2x donation. Plants two trees for maximum impact." />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Redemptions */}
        {totalBatches > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Redemptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <p className="text-sm text-gray-600">
                  {totalBatches} batch{totalBatches !== 1 ? 'es' : ''} recorded with proof of real-world impact.
                </p>
                {Array.from({ length: Math.min(totalBatches, 5) }, (_, i) => totalBatches - i).map(
                  (batchId) => (
                    <BatchRow key={batchId} batchId={batchId} />
                  )
                )}
                {totalBatches > 5 && (
                  <p className="text-center text-sm text-gray-500">
                    Showing latest 5 of {totalBatches} batches
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sponsor CTA */}
        {totalBatches > 0 && (
          <Link href="/impact/sponsor" style={{ textDecoration: 'none' }}>
            <Card className="cursor-pointer border-dashed border-teal-300 transition-all duration-200 hover:border-teal-400 hover:bg-teal-50">
              <CardContent className="py-4">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-xl">🤝</span>
                  <span className="font-medium text-teal-600">
                    Sponsor a batch - fund real-world tree planting with on-chain attribution
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Empty State */}
        {totalGraduated === 0 && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="py-12">
              <div className="flex flex-col items-center gap-4">
                <span className="text-4xl">🌱</span>
                <h2 className="text-xl font-bold text-green-700">No trees graduated yet</h2>
                <p className="text-center text-green-600">
                  Be the first to grow a plant to Tree stage and contribute to the Impact Pool!
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
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
  const colors = getColorClasses(colorScheme);
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <span className="text-3xl">{icon}</span>
          <Stat>
            <StatLabel>{label}</StatLabel>
            <StatNumber className={colors.text600}>{value}</StatNumber>
            <StatHelpText>{helpText}</StatHelpText>
          </Stat>
        </div>
      </CardContent>
    </Card>
  );
}

interface AdminRedemptionCardProps {
  network: NonNullable<ReturnType<typeof useNetwork>>;
  currentAddress: string;
  currentPoolSize: number;
  nextBatchId: number;
  currentWallet: ReturnType<typeof useDevnetWallet>['currentWallet'];
  onSuccess: () => void;
}

function formatStx(microStx: number): string {
  return (microStx / 1_000_000).toFixed(6).replace(/\.?0+$/, '');
}

function AdminRedemptionCard({
  network,
  currentAddress,
  currentPoolSize,
  nextBatchId,
  currentWallet,
  onSuccess,
}: AdminRedemptionCardProps) {
  const { data: treasury, refetch: refetchTreasury } = useTreasuryStats();
  const [quantity, setQuantity] = useState(currentPoolSize);
  const [proofUrl, setProofUrl] = useState(`https://dengrow.app/proof/batch-${nextBatchId}`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const [newPartner, setNewPartner] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [isConfigSubmitting, setIsConfigSubmitting] = useState(false);

  const qty = quantity;
  const pricePerTree = treasury?.pricePerTree ?? 500000;
  const payout = qty * pricePerTree;
  const treasuryBalance = treasury?.balance ?? 0;
  const hasPartner = !!treasury?.partner;
  const hasFunds = treasuryBalance >= payout && payout > 0;
  const isValid = qty > 0 && qty <= currentPoolSize && proofUrl.trim().length > 0 && hasPartner && hasFunds;

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const proofHash = await sha256(proofUrl.trim());
      const txOptions = redeemWithPayout(network, qty, proofHash, proofUrl.trim());

      if (shouldUseDirectCall()) {
        await executeContractCall(txOptions, currentWallet);
        toast.success('Redemption with Payout', {
          description: `${qty} tree(s) redeemed, ${formatStx(payout)} STX sent to partner`,
        });
        onSuccess();
        refetchTreasury();
      } else {
        await openContractCall({
          ...txOptions,
          onFinish: () => {
            toast.info('Redemption Submitted', { description: 'Confirming on-chain...' });
            setTimeout(() => { onSuccess(); refetchTreasury(); }, 10000);
          },
          onCancel: () => { toast.info('Cancelled'); },
        });
      }
    } catch (error: unknown) {
      console.error('Error recording redemption:', error);
      toast.error('Redemption Failed', { description: getContractErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfigAction = async (action: 'deposit' | 'set-partner' | 'set-price') => {
    setIsConfigSubmitting(true);
    try {
      let txOptions;
      let successMsg = '';
      if (action === 'deposit') {
        const amount = Math.floor(parseFloat(depositAmount) * 1_000_000);
        if (amount <= 0) throw new Error('Invalid deposit amount');
        txOptions = depositToTreasury(network, amount, currentAddress);
        successMsg = `Deposited ${depositAmount} STX to treasury`;
      } else if (action === 'set-partner') {
        if (!newPartner.trim()) throw new Error('Invalid partner address');
        txOptions = setPartner(network, newPartner.trim());
        successMsg = `Partner set to ${newPartner.trim()}`;
      } else {
        const price = Math.floor(parseFloat(newPrice) * 1_000_000);
        if (price <= 0) throw new Error('Invalid price');
        txOptions = setPricePerTree(network, price);
        successMsg = `Price set to ${newPrice} STX/tree`;
      }

      if (shouldUseDirectCall()) {
        await executeContractCall(txOptions, currentWallet);
        toast.success(successMsg);
        refetchTreasury();
      } else {
        await openContractCall({
          ...txOptions,
          onFinish: () => {
            toast.info(successMsg, { description: 'Confirming on-chain...' });
            setTimeout(() => refetchTreasury(), 10000);
          },
          onCancel: () => { toast.info('Cancelled'); },
        });
      }
    } catch (error: unknown) {
      toast.error('Action Failed', { description: getContractErrorMessage(error) });
    } finally {
      setIsConfigSubmitting(false);
    }
  };

  return (
    <Card className="border-orange-300">
      <CardHeader>
        <div className="flex items-center gap-3">
          <CardTitle>Redeem with Payout</CardTitle>
          <Badge className="bg-orange-100 text-xs text-orange-800">Admin</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-5">
          {/* Treasury Status */}
          <div className="grid grid-cols-3 gap-2 rounded-md bg-gray-50 p-3">
            <div>
              <span className="block text-xs text-gray-500">Treasury Balance</span>
              <span className="font-bold text-green-600">{formatStx(treasuryBalance)} STX</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500">Partner</span>
              <span className={cn('truncate text-sm font-bold', hasPartner ? 'text-blue-600' : 'text-red-500')}>
                {treasury?.partner ? `${treasury.partner.slice(0, 8)}...` : 'Not set'}
              </span>
            </div>
            <div>
              <span className="block text-xs text-gray-500">Price/Tree</span>
              <span className="font-bold">{formatStx(pricePerTree)} STX</span>
            </div>
          </div>

          {/* Warnings */}
          {!hasPartner && (
            <div className="rounded-md border border-red-200 bg-red-50 p-2">
              <p className="text-sm text-red-600">No partner wallet set. Configure one below before redeeming.</p>
            </div>
          )}
          {hasPartner && qty > 0 && !hasFunds && (
            <div className="rounded-md border border-red-200 bg-red-50 p-2">
              <p className="text-sm text-red-600">
                Insufficient treasury funds. Need {formatStx(payout)} STX, have {formatStx(treasuryBalance)} STX.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label>Quantity</Label>
            <NumberInput value={quantity} onChange={setQuantity} min={1} max={currentPoolSize} />
            <p className="text-sm text-muted-foreground">
              Max: {currentPoolSize} tree{currentPoolSize !== 1 ? 's' : ''} in pool
            </p>
          </div>

          {/* STX Flow Preview */}
          {qty > 0 && hasPartner && (
            <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
              <p className="mb-1 text-sm font-bold text-blue-700">
                Redeem {qty} tree{qty !== 1 ? 's' : ''}:
              </p>
              <div className="flex flex-col gap-1 text-sm text-blue-600">
                <div className="flex items-center justify-between">
                  <span>Partner payout ({qty} x {formatStx(pricePerTree)} STX)</span>
                  <span className="font-bold">{formatStx(payout)} STX</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Stays in treasury</span>
                  <span className="font-bold">{formatStx(Math.max(0, treasuryBalance - payout))} STX</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label>Proof URL</Label>
            <Input value={proofUrl} onChange={(e) => setProofUrl(e.target.value)} placeholder="https://dengrow.app/proof/batch-1" />
            <p className="text-sm text-muted-foreground">URL to the proof document (SHA-256 hash computed automatically)</p>
          </div>

          <Button
            className="w-full bg-orange-600 text-white hover:bg-orange-700"
            size="lg"
            disabled={!isValid || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Recording...' : `Redeem & Pay (${qty} tree${qty !== 1 ? 's' : ''} = ${formatStx(payout)} STX)`}
          </Button>

          <Separator />
          <Button variant="ghost" size="sm" className="w-full" onClick={() => setShowConfig(!showConfig)}>
            {showConfig ? 'Hide' : 'Show'} Treasury Config
          </Button>

          {showConfig && (
            <div className="flex flex-col gap-4 rounded-md bg-gray-50 p-3">
              {/* Set Partner */}
              <div className="flex flex-col gap-1">
                <Label className="text-sm">Partner Wallet</Label>
                <div className="flex items-center gap-2">
                  <Input className="h-8" value={newPartner} onChange={(e) => setNewPartner(e.target.value)} placeholder="ST..." />
                  <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700" disabled={isConfigSubmitting || !newPartner.trim()} onClick={() => handleConfigAction('set-partner')}>
                    {isConfigSubmitting && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                    Set
                  </Button>
                </div>
              </div>

              {/* Set Price */}
              <div className="flex flex-col gap-1">
                <Label className="text-sm">Price per Tree (STX)</Label>
                <div className="flex items-center gap-2">
                  <Input className="h-8" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="0.5" type="number" step="0.1" />
                  <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700" disabled={isConfigSubmitting || !newPrice || parseFloat(newPrice) <= 0} onClick={() => handleConfigAction('set-price')}>
                    {isConfigSubmitting && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                    Set
                  </Button>
                </div>
              </div>

              {/* Deposit */}
              <div className="flex flex-col gap-1">
                <Label className="text-sm">Deposit STX to Treasury</Label>
                <div className="flex items-center gap-2">
                  <Input className="h-8" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="1.0" type="number" step="0.5" />
                  <Button size="sm" className="bg-green-600 text-white hover:bg-green-700" disabled={isConfigSubmitting || !depositAmount || parseFloat(depositAmount) <= 0} onClick={() => handleConfigAction('deposit')}>
                    {isConfigSubmitting && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                    Deposit
                  </Button>
                </div>
              </div>

              {/* Stats */}
              {treasury && (
                <div className="text-xs text-gray-500">
                  <p>Total deposited: {formatStx(treasury.totalDeposited)} STX</p>
                  <p>Total paid out: {formatStx(treasury.totalPaidOut)} STX</p>
                  <p>Total withdrawn: {formatStx(treasury.totalWithdrawn)} STX</p>
                  <p>Redemptions via treasury: {treasury.totalRedemptions}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
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
  const colors = getColorClasses(color);
  return (
    <div className={cn('rounded-lg border p-4', colors.border200, colors.bg50)}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Badge className={colors.badge}>{name}</Badge>
          <span className={cn('font-bold', colors.text600)}>{price}</span>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}

function BatchRow({ batchId }: { batchId: number }) {
  const { data: batch, isLoading } = useBatchInfo(batchId);

  return (
    <Link href={`/impact/batch/${batchId}`} style={{ textDecoration: 'none' }}>
      <div className="flex cursor-pointer items-center justify-between rounded-md border p-3 transition-all duration-200 hover:border-orange-300 hover:bg-gray-50">
        <div className="flex items-center gap-3">
          <Badge className="bg-orange-100 text-orange-800">#{batchId}</Badge>
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : batch ? (
            <span className="text-sm text-gray-700">
              {batch.quantity} tree{batch.quantity !== 1 ? 's' : ''} redeemed
            </span>
          ) : (
            <span className="text-sm text-gray-400">No data</span>
          )}
        </div>
        <span className="text-sm text-gray-400">View details</span>
      </div>
    </Link>
  );
}

function StepCard({ step, title, description, icon }: StepCardProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg bg-gray-50 p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl">
        {icon}
      </div>
      <Badge className="bg-green-100 text-green-800">Step {step}</Badge>
      <span className="font-bold">{title}</span>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
