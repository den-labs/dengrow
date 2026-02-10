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
  const isTestnet = isTestnetEnvironment(network);
  return {
    contractAddress: getContractAddress(network),
    // Testnet uses v3 with mint-with-tier
    contractName: isTestnet ? 'plant-nft-v3' : 'plant-nft',
  } as const;
};

export const getGameContract = (network: Network) => {
  const isTestnet = isTestnetEnvironment(network);
  return {
    contractAddress: getContractAddress(network),
    // Testnet uses v3 game logic (calls impact-registry-v2)
    contractName: isTestnet ? 'plant-game-v3' : 'plant-game',
  } as const;
};

export const getStorageContract = (network: Network) => {
  const isTestnet = isTestnetEnvironment(network);
  return {
    contractAddress: getContractAddress(network),
    // Testnet has separate storage layer, legacy uses plant-game
    contractName: isTestnet ? 'plant-storage' : 'plant-game',
  } as const;
};

export const getImpactContract = (network: Network) => {
  const isTestnet = isTestnetEnvironment(network);
  return {
    contractAddress: getContractAddress(network),
    // Testnet uses v2 with sponsorship
    contractName: isTestnet ? 'impact-registry-v2' : 'impact-registry',
  } as const;
};

// Legacy export for backwards compatibility
export const getNftContractAddress = getContractAddress;
