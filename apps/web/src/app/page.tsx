'use client';

import { MINT_TIERS, MintTier } from '@/lib/nft/operations';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getColorClasses } from '@/lib/color-variants';
import { cn } from '@/lib/utils';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pb-20 pt-16 lg:pb-32 lg:pt-24">
        <div className="pointer-events-none absolute -right-20 -top-20 h-[500px] w-[500px] rounded-full bg-dengrow-400/20 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-dengrow-500/20 blur-[80px]" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-dengrow-500/20 bg-dengrow-500/10 px-4 py-2 text-sm font-semibold text-dengrow-600">
            <span className="h-2 w-2 animate-pulse rounded-full bg-dengrow-500" />
            Running on Stacks (Bitcoin L2)
          </div>
          <h1 className="mb-6 font-display text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            Grow your{' '}
            <span className="text-gradient-primary">digital garden</span>
            <br className="hidden md:block" /> on the Bitcoin blockchain.
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Mint unique plant NFTs, water them daily, and watch them thrive. Earn
            rewards and make a real-world impact as you cultivate your collection.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="w-full rounded-xl bg-dengrow-500 px-8 py-6 text-lg font-bold text-white shadow-xl shadow-dengrow-500/20 transition-all hover:-translate-y-0.5 hover:bg-dengrow-600 sm:w-auto"
            >
              <a href="/my-plants">View My Plants</a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full rounded-xl border-2 border-dengrow-500 px-8 py-6 text-lg font-bold text-dengrow-600 hover:bg-dengrow-50 sm:w-auto"
            >
              <a href="/my-plants">Mint a Plant</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Choose Your Seed */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-display text-3xl font-bold md:text-4xl">
              Choose Your Seed
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              Start your journey with a seed tier that fits your goals. Higher
              tiers yield rarer traits and boosted growth rates.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {([1, 2, 3] as MintTier[]).map((tier) => {
              const t = MINT_TIERS[tier];
              const colors = getColorClasses(t.colorScheme);
              const isPopular = tier === 2;
              return (
                <a
                  key={tier}
                  href="/my-plants"
                  className={cn(
                    'group relative flex flex-col rounded-2xl border bg-white p-8 no-underline transition-all duration-300 hover:shadow-xl',
                    isPopular
                      ? 'border-2 border-dengrow-500 shadow-2xl shadow-dengrow-500/10 md:-translate-y-4'
                      : 'border-gray-200 hover:border-dengrow-500/30'
                  )}
                >
                  {isPopular && (
                    <div className="absolute right-0 top-0 rounded-bl-xl rounded-tr-2xl bg-dengrow-500 px-4 py-1 text-xs font-bold text-white">
                      POPULAR
                    </div>
                  )}
                  {tier === 1 && (
                    <div className="absolute right-0 top-0 rounded-bl-xl rounded-tr-2xl bg-gray-100 px-4 py-1 text-xs font-bold text-gray-600">
                      COMMON
                    </div>
                  )}
                  {tier === 3 && (
                    <div className="absolute right-0 top-0 rounded-bl-xl rounded-tr-2xl bg-dengrow-800/10 px-4 py-1 text-xs font-bold text-dengrow-800">
                      LEGENDARY
                    </div>
                  )}
                  <div
                    className={cn(
                      'mb-6 flex h-16 w-16 items-center justify-center rounded-full transition-transform group-hover:scale-110',
                      isPopular ? 'bg-dengrow-500/10' : 'bg-gray-100'
                    )}
                  >
                    <svg
                      className={cn('h-8 w-8', isPopular ? 'text-dengrow-500' : 'text-gray-500')}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M7 20h10" />
                      <path d="M10 20c5.5-2.5.8-6.4 3-10" />
                      <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
                      <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-2xl font-bold">{t.name}</h3>
                  <div className="mb-6 flex items-baseline">
                    <span className="text-4xl font-bold text-dengrow-500">
                      {t.priceSTX}
                    </span>
                    <span className="ml-1 text-lg font-medium text-muted-foreground">
                      STX
                    </span>
                  </div>
                  <p className="mb-6 text-sm text-muted-foreground">
                    {t.description}
                  </p>
                  <div className="mt-auto">
                    <span
                      className={cn(
                        'inline-block w-full rounded-xl py-3 text-center font-semibold transition-colors',
                        isPopular
                          ? 'bg-dengrow-500 text-white shadow-lg shadow-dengrow-500/20'
                          : 'border border-gray-300 text-foreground hover:border-dengrow-500 hover:text-dengrow-500'
                      )}
                    >
                      {isPopular ? `Mint ${t.name}` : `Select ${t.name}`}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Daily Care Loop */}
      <section className="relative overflow-hidden py-20">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-dengrow-500/5" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 font-display text-3xl font-bold md:text-4xl">
                The Daily Care Loop
              </h2>
              <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                DenGrow rewards consistency. Your plants follow a 7-day growth
                cycle that requires daily interaction to maximize health and yield.
              </p>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-dengrow-500/10">
                    <svg className="h-5 w-5 text-dengrow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-bold">Water Daily</h3>
                    <p className="text-muted-foreground">
                      Log in once every 24 hours to water your plant. Miss a day,
                      and its health decreases.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100">
                    <svg className="h-5 w-5 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-bold">Budget Review</h3>
                    <p className="text-muted-foreground">
                      Track your growth points and see how your plant compares on
                      the global leaderboard.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                    <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-bold">7-Day Graduation</h3>
                    <p className="text-muted-foreground">
                      After 7 days of perfect care, your plant evolves to the next
                      stage, revealing new artwork.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-dengrow-500/20 blur-[100px]" />
              <div className="relative rounded-2xl border bg-white p-8 shadow-2xl">
                <div className="mb-8 flex items-center justify-between">
                  <h4 className="font-bold">Care Schedule</h4>
                  <span className="text-sm font-medium text-dengrow-500">Week 1</span>
                </div>
                <div className="space-y-4">
                  {['MON', 'TUE'].map((day) => (
                    <div key={day} className="flex items-center gap-4 opacity-50">
                      <div className="w-10 text-sm font-bold text-muted-foreground">{day}</div>
                      <div className="relative flex h-10 w-full items-center overflow-hidden rounded-lg bg-dengrow-50 px-3">
                        <div className="absolute inset-y-0 left-0 w-full bg-dengrow-500/10" />
                        <span className="relative z-10 flex items-center gap-1 text-xs font-bold text-dengrow-600">
                          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                          Watered
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="flex origin-left scale-105 items-center gap-4 transition-transform">
                    <div className="w-10 text-sm font-bold">WED</div>
                    <div className="flex h-12 w-full items-center justify-between rounded-lg border-2 border-dengrow-500 bg-white px-3 shadow-lg shadow-dengrow-500/10">
                      <span className="text-sm font-bold">Ready to water!</span>
                      <span className="rounded bg-dengrow-500 px-3 py-1.5 text-xs font-bold text-white">Water</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 opacity-40">
                    <div className="w-10 text-sm font-bold text-muted-foreground">THU</div>
                    <div className="flex h-10 w-full items-center rounded-lg border border-dashed px-3">
                      <span className="text-xs text-muted-foreground">Pending</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
