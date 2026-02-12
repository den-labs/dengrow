'use client';

import { ThemeProvider } from 'next-themes';
import { DevnetWalletProvider } from '../DevnetWalletProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HiroWalletProvider } from '../HiroWalletProvider';
import { Toaster } from '@/components/ui/sonner';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <DevnetWalletProvider>
          <HiroWalletProvider>
            {children}
            <Toaster />
          </HiroWalletProvider>
        </DevnetWalletProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
