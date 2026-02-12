'use client';
import { useContext, useState } from 'react';
import { HiroWalletContext } from './HiroWalletProvider';
import { RiFileCopyLine, RiCloseLine } from 'react-icons/ri';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ConnectWalletButtonProps {
  children?: React.ReactNode;
}

export const ConnectWalletButton = ({ children }: ConnectWalletButtonProps) => {
  const [didCopyAddress, setDidCopyAddress] = useState(false);
  const { authenticate, isWalletConnected, mainnetAddress, testnetAddress, network, disconnect } =
    useContext(HiroWalletContext);

  const currentAddress = network === 'mainnet' ? mainnetAddress : testnetAddress;

  const copyAddress = () => {
    if (currentAddress) {
      navigator.clipboard.writeText(currentAddress);
      setDidCopyAddress(true);
      setTimeout(() => {
        setDidCopyAddress(false);
      }, 1000);
    }
  };

  const truncateMiddle = (str: string | null) => {
    if (!str) return '';
    if (str.length <= 12) return str;
    return `${str.slice(0, 6)}...${str.slice(-4)}`;
  };

  return isWalletConnected ? (
    <div className="flex items-center gap-2 rounded-md bg-gray-200 p-2">
      <span className="text-sm text-gray-800">
        {truncateMiddle(currentAddress)}
      </span>
      <TooltipProvider>
        <Tooltip open={didCopyAddress ? true : undefined}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="Copy address"
              onClick={copyAddress}
            >
              <RiFileCopyLine className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy address</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="Disconnect wallet"
              onClick={disconnect}
              data-testid="disconnect-wallet-address-button"
            >
              <RiCloseLine className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Disconnect wallet</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  ) : (
    <Button size="sm" onClick={authenticate} data-testid="wallet-connect-button">
      {children || 'Connect Wallet'}
    </Button>
  );
};
