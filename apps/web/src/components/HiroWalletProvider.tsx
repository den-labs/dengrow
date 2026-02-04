'use client';
import { createContext, FC, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { getPersistedNetwork, persistNetwork } from '@/lib/network';
import { Network } from '@/lib/network';
import { showConnect, disconnect as disconnectWallet } from '@stacks/connect';
import { userSession } from '@/lib/userSession';
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
    // Check if user is already signed in
    if (userSession.isUserSignedIn()) {
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
    showConnect({
      appDetails: {
        name: 'DenGrow',
        icon: '/icon.png',
      },
      redirectTo: '/',
      onFinish: () => {
        setIsWalletOpen(false);
        setIsWalletConnected(true);
      },
      onCancel: () => {
        setIsWalletOpen(false);
      },
      userSession,
    });
  }, []);

  const handleDisconnect = useCallback(() => {
    disconnectWallet();
    userSession.signUserOut();
    setIsWalletConnected(false);
  }, []);

  const { testnetAddress, mainnetAddress } = useMemo(() => {
    if (!isWalletConnected || !userSession.isUserSignedIn()) {
      return { testnetAddress: null, mainnetAddress: null };
    }

    const userData = userSession.loadUserData();
    const address = userData.profile.stxAddress[network || 'testnet'];

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
