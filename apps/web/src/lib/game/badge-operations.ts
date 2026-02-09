import { PostConditionMode, uintCV } from '@stacks/transactions';
import { getContractAddress } from '@/constants/contracts';
import { isTestnetEnvironment } from '@/lib/use-network';
import { Network } from '@/lib/network';
import { ContractCallRegularOptions } from '@stacks/connect';

const getBadgeContract = (network: Network) => {
  const isTestnet = isTestnetEnvironment(network);
  return {
    contractAddress: getContractAddress(network),
    contractName: isTestnet ? 'achievement-badges' : 'achievement-badges',
  };
};

export const claimFirstSeed = (network: Network, tokenId: number): ContractCallRegularOptions => ({
  ...getBadgeContract(network),
  network,
  anchorMode: 1,
  functionName: 'claim-first-seed',
  functionArgs: [uintCV(tokenId)],
  postConditionMode: PostConditionMode.Deny,
  postConditions: [],
});

export const claimFirstTree = (network: Network, tokenId: number): ContractCallRegularOptions => ({
  ...getBadgeContract(network),
  network,
  anchorMode: 1,
  functionName: 'claim-first-tree',
  functionArgs: [uintCV(tokenId)],
  postConditionMode: PostConditionMode.Deny,
  postConditions: [],
});

export const claimGreenThumb = (
  network: Network,
  tokenId1: number,
  tokenId2: number,
  tokenId3: number
): ContractCallRegularOptions => ({
  ...getBadgeContract(network),
  network,
  anchorMode: 1,
  functionName: 'claim-green-thumb',
  functionArgs: [uintCV(tokenId1), uintCV(tokenId2), uintCV(tokenId3)],
  postConditionMode: PostConditionMode.Deny,
  postConditions: [],
});

export const claimEarlyAdopter = (
  network: Network,
  tokenId: number
): ContractCallRegularOptions => ({
  ...getBadgeContract(network),
  network,
  anchorMode: 1,
  functionName: 'claim-early-adopter',
  functionArgs: [uintCV(tokenId)],
  postConditionMode: PostConditionMode.Deny,
  postConditions: [],
});
