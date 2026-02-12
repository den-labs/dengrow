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
    <nav className="bg-white shadow-sm">
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-md border-2 border-gray-700 bg-white text-xl font-bold tracking-tighter text-gray-900">
              /-/
            </div>
            <a href="/" className="no-underline">
              <span className="ml-4 text-lg font-bold text-gray-900">
                DenGrow
              </span>
            </a>
          </div>

          {/* Desktop nav */}
          <div className="hidden items-center gap-4 md:flex">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
            <NetworkSelector />
            {walletButton}
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
                <SheetTitle>DenGrow</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 pt-4">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="py-2 text-lg font-medium"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="border-t pt-4">
                  <NetworkSelector />
                </div>
                <div>
                  {walletButton}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
