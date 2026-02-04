import { PostConditionMode, uintCV } from '@stacks/transactions';
import { getGameContract } from '@/constants/contracts';
import { Network } from '@/lib/network';
import { ContractCallRegularOptions } from '@stacks/connect';

/**
 * Water a plant - calls plant-game.water(token-id)
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
