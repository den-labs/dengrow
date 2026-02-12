'use client';
import { FC, useContext } from 'react';
import { HiroWalletContext } from './HiroWalletProvider';
import { ChevronDown } from 'lucide-react';
import { Network } from '@/lib/network';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const NetworkSelector: FC = () => {
  const { network, setNetwork } = useContext(HiroWalletContext);

  const networks = [
    {
      name: 'Stacks Mainnet',
      value: 'mainnet' as Network,
      endpoint: 'api.hiro.so',
      status: 'online',
    },
    {
      name: 'Stacks Testnet',
      value: 'testnet' as Network,
      endpoint: 'api.testnet.hiro.so',
      status: 'online',
    },
    {
      name: 'Devnet',
      value: 'devnet' as Network,
      endpoint: '',
      status: 'offline',
    },
  ];

  if (!network) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
          {network.charAt(0).toUpperCase() + network.slice(1)}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {networks.map((net) => (
          <DropdownMenuItem
            key={net.value}
            onClick={() => setNetwork(net.value)}
            className="flex flex-col items-start"
          >
            <span className="font-medium">{net.name}</span>
            <div className="flex w-full items-center justify-between">
              <span className="text-sm text-gray-500">
                {net.endpoint}
              </span>
              {net.status === 'offline' && (
                <Badge className="ml-2 bg-red-100 text-red-800">
                  Offline
                </Badge>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
