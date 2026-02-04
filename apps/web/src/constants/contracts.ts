import { isDevnetEnvironment, isTestnetEnvironment } from '@/lib/use-network';
import { Network } from '@/lib/network';

export const getContractAddress = (network: Network) => {
  if (isDevnetEnvironment()) {
    return (
      process.env.NEXT_PUBLIC_DEPLOYER_ACCOUNT_ADDRESS ||
      'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
    );
  }
  if (isTestnetEnvironment(network)) {
    // Testnet deployment from 2026-02-04
    return 'ST23SRWT9A0CYMPW4Q32D0D7KT2YY07PQAVJY3NJZ';
  }
  // Mainnet address (TBD)
  return 'SP30VANCWST2Y0RY3EYGJ4ZK6D22GJQRR7H5YD8J8';
};

export const getNftContract = (network: Network) => {
  return {
    contractAddress: getContractAddress(network),
    contractName: 'plant-nft',
  } as const;
};

export const getGameContract = (network: Network) => {
  return {
    contractAddress: getContractAddress(network),
    contractName: 'plant-game',
  } as const;
};

// Legacy export for backwards compatibility
export const getNftContractAddress = getContractAddress;
