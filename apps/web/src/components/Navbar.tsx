'use client';

import {
  Box,
  Container,
  Flex,
  Link,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  useDisclosure,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { useContext } from 'react';
import { HiroWalletContext } from './HiroWalletProvider';
import { useDevnetWallet } from '@/lib/devnet-wallet-context';
import { DevnetWalletButton } from './DevnetWalletButton';
import { ConnectWalletButton } from './ConnectWallet';
import { NetworkSelector } from './NetworkSelector';
import { isDevnetEnvironment, useNetwork } from '@/lib/use-network';

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
  const { isOpen, onOpen, onClose } = useDisclosure();

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
    <Box as="nav" bg="white" boxShadow="sm">
      <Container maxW="container.xl">
        <Flex justify="space-between" h={16} align="center">
          {/* Logo */}
          <Flex align="center">
            <Flex
              bg="white"
              borderRadius="md"
              border="2px"
              borderColor="gray.700"
              letterSpacing="-.05em"
              fontSize="xl"
              fontWeight="bold"
              w="52px"
              h="52px"
              justify="center"
              align="center"
              color="gray.900"
              shrink="0"
            >
              /-/
            </Flex>
            <Link href="/" textDecoration="none">
              <Box fontSize="lg" fontWeight="bold" color="gray.900" ml={4}>
                DenGrow
              </Box>
            </Link>
          </Flex>

          {/* Desktop nav */}
          <Flex align="center" gap={4} display={{ base: 'none', md: 'flex' }}>
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                <Box>{link.label}</Box>
              </Link>
            ))}
            <NetworkSelector />
            {walletButton}
          </Flex>

          {/* Mobile hamburger */}
          <IconButton
            aria-label="Open menu"
            icon={<HamburgerIcon />}
            variant="ghost"
            display={{ base: 'flex', md: 'none' }}
            onClick={onOpen}
          />
        </Flex>
      </Container>

      {/* Mobile drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>DenGrow</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} onClick={onClose}>
                  <Box py={2} fontSize="lg" fontWeight="medium">
                    {link.label}
                  </Box>
                </Link>
              ))}
              <Box pt={4} borderTopWidth="1px">
                <NetworkSelector />
              </Box>
              <Box>
                {walletButton}
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};
