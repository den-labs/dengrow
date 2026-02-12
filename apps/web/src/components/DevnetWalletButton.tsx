'use client';

import { ChevronDown } from 'lucide-react';
import { DevnetWallet } from '@/lib/devnet-wallet-context';
import { formatStxAddress } from '@/lib/address-utils';
import { DEVNET_STACKS_BLOCKCHAIN_API_URL } from '@/constants/devnet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DevnetWalletButtonProps {
  currentWallet: DevnetWallet | null;
  wallets: DevnetWallet[];
  onWalletSelect: (wallet: DevnetWallet) => void;
}

export const DevnetWalletButton = ({
  currentWallet,
  wallets,
  onWalletSelect,
}: DevnetWalletButtonProps) => {
  return (
    <DropdownMenu>
      <div className="flex items-center">
        <a
          href={`https://explorer.hiro.so/address/${currentWallet?.stxAddress}?chain=testnet&api=${DEVNET_STACKS_BLOCKCHAIN_API_URL}`}
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline"
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost">
                  <div className="flex items-center gap-2">
                    <span className="w-[140px] overflow-hidden text-ellipsis font-mono text-sm">
                      {formatStxAddress(currentWallet?.stxAddress || '')}
                    </span>
                    <Badge className="rounded-full bg-purple-100 text-purple-800">
                      devnet
                    </Badge>
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Devnet connection detected, click to view in explorer</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </a>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Select wallet">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
      </div>
      <DropdownMenuContent className="w-full">
        {wallets.map((wallet) => (
          <DropdownMenuItem key={wallet.stxAddress} onClick={() => onWalletSelect(wallet)}>
            <div className="flex items-center gap-2">
              <span className="w-[140px] overflow-hidden text-ellipsis font-mono text-sm">
                {formatStxAddress(wallet.stxAddress)}
              </span>
              {wallet.label && (
                <Badge variant="secondary" className="rounded-full">
                  {wallet.label}
                </Badge>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
