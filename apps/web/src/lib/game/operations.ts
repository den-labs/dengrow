import { PostConditionMode, uintCV } from '@stacks/transactions';
import { getGameContract } from '@/constants/contracts';
import { Network } from '@/lib/network';
import { ContractCallRegularOptions } from '@stacks/connect';

/**
 * Water a plant - calls game contract water(token-id)
 * (plant-game-v1 on testnet, plant-game on mainnet/devnet)
 */
export const waterPlant = (network: Network, tokenId: number): ContractCallRegularOptions => {
  const contract = getGameContract(network);

  return {
    ...contract,
    network,
    anchorMode: 1,
    functionName: 'water',
    functionArgs: [uintCV(tokenId)],
    postConditionMode: PostConditionMode.Deny,
    postConditions: [],
  };
};
