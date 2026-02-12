'use client';

import { MINT_TIERS, MintTier } from '@/lib/nft/operations';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getColorClasses } from '@/lib/color-variants';
import { cn } from '@/lib/utils';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-screen-xl px-4 py-10 md:py-16">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            <Badge className="bg-green-100 text-green-800">
              On-chain growth
            </Badge>
            <Badge className="bg-teal-100 text-teal-800">
              Weekly impact batches
            </Badge>
          </div>
          <h1 className="text-3xl font-bold md:text-5xl">
            DenGrow
          </h1>
          <p className="max-w-2xl text-lg text-gray-600 md:text-xl">
            Mint a plant NFT, water it daily, and graduate it into the Impact Pool. DenGrow
            prioritizes verifiable care and transparent weekly redemptions.
          </p>
          <div className="flex gap-4">
            <Button asChild className="bg-green-600 text-white hover:bg-green-700" size="lg">
              <a href="/my-plants">View My Plants</a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="/my-plants">Mint a Plant</a>
            </Button>
          </div>
        </div>

        {/* Mint Tiers */}
        <div>
          <h2 className="mb-4 text-xl font-bold">
            Choose Your Tier
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {([1, 2, 3] as MintTier[]).map((tier) => {
              const t = MINT_TIERS[tier];
              const colors = getColorClasses(t.colorScheme);
              return (
                <a
                  key={tier}
                  href="/my-plants"
                  className={cn(
                    'rounded-lg border bg-white p-6 shadow-sm transition-all duration-200 no-underline',
                    colors.border200,
                    `hover:shadow-md hover:${colors.border400}`
                  )}
                >
                  <div className="flex flex-col items-center gap-3">
                    <Badge className={colors.badge}>
                      {t.name}
                    </Badge>
                    <span className={cn('text-3xl font-bold', colors.text600)}>
                      {t.priceSTX} STX
                    </span>
                    <span className="text-center text-sm text-gray-600">
                      {t.description}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold">
              Daily Care Loop
            </h3>
            <p className="text-gray-600">
              Water once per day to grow your plant. After 7 successful days, it becomes a Tree and
              joins the global Impact Pool for weekly batch redemption.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
