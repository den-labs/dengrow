import { Pc, PostConditionMode, uintCV } from '@stacks/transactions';
import { getGameContract } from '@/constants/contracts';
import { Network } from '@/lib/network';
import { ContractCallRegularOptions } from '@stacks/connect';

/** Tip amount in microSTX (0.1 STX) */
export const WATER_TIP_MICROSTX = 100_000;
export const WATER_TIP_STX = 0.1;

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

/**
 * Water a plant with an optional 0.1 STX tip to the Impact Pool.
 * Calls water-with-tip(token-id) which transfers tip then waters.
 */
export const waterPlantWithTip = (
  network: Network,
  tokenId: number,
  senderAddress: string
): ContractCallRegularOptions => {
  const contract = getGameContract(network);
  const postCondition = Pc.principal(senderAddress)
    .willSendEq(WATER_TIP_MICROSTX)
    .ustx();

  return {
    ...contract,
    network,
    anchorMode: 1,
    functionName: 'water-with-tip',
    functionArgs: [uintCV(tokenId)],
    postConditionMode: PostConditionMode.Deny,
    postConditions: [postCondition],
  };
};
