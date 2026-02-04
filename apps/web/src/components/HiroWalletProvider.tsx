'use client';
import { createContext, FC, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { getPersistedNetwork, persistNetwork } from '@/lib/network';
import { Network } from '@/lib/network';
import { connect, disconnect as disconnectWallet, getLocalStorage } from '@stacks/connect';
interface HiroWallet {
  isWalletOpen: boolean;
  isWalletConnected: boolean;
  testnetAddress: string | null;
  mainnetAddress: string | null;
  network: Network | null;
  setNetwork: (network: Network) => void;
  authenticate: () => void;
  disconnect: () => void;
}

const HiroWalletContext = createContext<HiroWallet>({
  isWalletOpen: false,
  isWalletConnected: false,
  testnetAddress: null,
  mainnetAddress: null,
  network: 'mainnet',
  setNetwork: () => {},
  authenticate: () => {},
  disconnect: () => {},
});

interface ProviderProps {
  children: ReactNode | ReactNode[];
}

export const HiroWalletProvider: FC<ProviderProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [network, setNetwork] = useState<Network | null>(null);

  const updateNetwork = useCallback((newNetwork: Network) => {
    setNetwork(newNetwork);
    persistNetwork(newNetwork);
  }, []);

  useEffect(() => {
    setMounted(true);
    // Check if wallet is already connected
    const storage = getLocalStorage();
    if (storage?.addresses?.stx && storage.addresses.stx.length > 0) {
      setIsWalletConnected(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setNetwork(getPersistedNetwork());
    }
  }, []);

  const authenticate = useCallback(async () => {
    setIsWalletOpen(true);
    try {
      await connect({
        forceWalletSelect: true,
      });
      setIsWalletConnected(true);
      setIsWalletOpen(false);
    } catch (error) {
      console.error('Wallet connection failed:', error);
      setIsWalletOpen(false);
    }
  }, []);

  const handleDisconnect = useCallback(() => {
    disconnectWallet();
    setIsWalletConnected(false);
  }, []);

  const { testnetAddress, mainnetAddress } = useMemo(() => {
    if (!isWalletConnected) {
      return { testnetAddress: null, mainnetAddress: null };
    }

    const storage = getLocalStorage();
    const stxAddresses = storage?.addresses?.stx || [];

    // Get address for current network
    const addressData = stxAddresses.find((addr: any) => {
      if (network === 'testnet') return addr.address.startsWith('ST');
      if (network === 'mainnet') return addr.address.startsWith('SP');
      return false;
    });

    const address = addressData?.address || stxAddresses[0]?.address;

    const isTestnet = address?.startsWith('ST');
    const isMainnet = address?.startsWith('SP');

    return {
      testnetAddress: isTestnet ? address : null,
      mainnetAddress: isMainnet ? address : null,
    };
  }, [isWalletConnected, network]);


  const value = useMemo(
    () => ({
      isWalletOpen,
      isWalletConnected,
      testnetAddress,
      mainnetAddress,
      network,
      setNetwork: updateNetwork,
      authenticate,
      disconnect: handleDisconnect,
    }),
    [
      isWalletOpen,
      isWalletConnected,
      testnetAddress,
      mainnetAddress,
      network,
      authenticate,
      handleDisconnect,
      updateNetwork,
    ]
  );

  if (!mounted) {
    return null;
  }

  return <HiroWalletContext.Provider value={value}>{children}</HiroWalletContext.Provider>;
};

export { HiroWalletContext };
