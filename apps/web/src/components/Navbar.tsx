'use client';

import { useState, useContext } from 'react';
import { Menu } from 'lucide-react';
import { HiroWalletContext } from './HiroWalletProvider';
import { useDevnetWallet } from '@/lib/devnet-wallet-context';
import { DevnetWalletButton } from './DevnetWalletButton';
import { ConnectWalletButton } from './ConnectWallet';
import { NetworkSelector } from './NetworkSelector';
import { isDevnetEnvironment, useNetwork } from '@/lib/use-network';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const NAV_LINKS = [
  { href: '/my-plants', label: 'My Plants' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/achievements', label: 'Badges' },
  { href: '/impact', label: 'Impact' },
];

export const Navbar = () => {
  const { isWalletConnected } = useContext(HiroWalletContext);
  const { currentWallet, wallets, setCurrentWallet } = useDevnetWallet();
  const network = useNetwork();
  const [isOpen, setIsOpen] = useState(false);

  const walletButton = isDevnetEnvironment() ? (
    <DevnetWalletButton
      currentWallet={currentWallet}
      wallets={wallets}
      onWalletSelect={setCurrentWallet}
    />
  ) : (
    <ConnectWalletButton />
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-white/80 glass-panel">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 no-underline">
            <svg
              className="h-7 w-7 text-dengrow-500"
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
            <span className="font-display text-xl font-bold tracking-tight text-foreground">
              DenGrow
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-dengrow-50 hover:text-dengrow-600"
              >
                {link.label}
              </a>
            ))}
            <div className="ml-2">
              <NetworkSelector />
            </div>
            <div className="ml-2">{walletButton}</div>
          </div>

          {/* Mobile hamburger */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-dengrow-500"
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
                  DenGrow
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 pt-6">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg px-3 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-dengrow-50 hover:text-dengrow-600"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="mt-4 border-t pt-4">
                  <NetworkSelector />
                </div>
                <div className="mt-2">{walletButton}</div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
