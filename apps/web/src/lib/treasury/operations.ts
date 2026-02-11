import {
  Pc,
  PostConditionMode,
  uintCV,
  bufferCV,
  stringAsciiCV,
  principalCV,
} from '@stacks/transactions';
import { getTreasuryContract } from '@/constants/contracts';
import { Network } from '@/lib/network';
import { ContractCallRegularOptions } from '@stacks/connect';

/**
 * Compute SHA-256 hash of a string using Web Crypto API.
 */
export async function sha256(input: string): Promise<Uint8Array> {
  const encoded = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  return new Uint8Array(hashBuffer);
}

/**
 * Build a redeem-with-payout contract call.
 * Admin-only: records redemption in impact-registry AND pays partner.
 */
export const redeemWithPayout = (
  network: Network,
  quantity: number,
  proofHash: Uint8Array,
  proofUrl: string,
): ContractCallRegularOptions => {
  const contract = getTreasuryContract(network);

  return {
    ...contract,
    network,
    anchorMode: 1,
    functionName: 'redeem-with-payout',
    functionArgs: [
      uintCV(quantity),
      bufferCV(proofHash),
      stringAsciiCV(proofUrl),
    ],
    postConditionMode: PostConditionMode.Allow,
    postConditions: [],
  };
};

/**
 * Build a deposit contract call.
 * Anyone can deposit STX into the treasury.
 */
export const depositToTreasury = (
  network: Network,
  amount: number,
  senderAddress: string,
): ContractCallRegularOptions => {
  const contract = getTreasuryContract(network);

  return {
    ...contract,
    network,
    anchorMode: 1,
    functionName: 'deposit',
    functionArgs: [uintCV(amount)],
    postConditionMode: PostConditionMode.Deny,
    postConditions: [
      Pc.principal(senderAddress).willSendEq(amount).ustx(),
    ],
  };
};

/**
 * Build a set-partner contract call.
 * Admin-only: set/change the partner wallet.
 */
export const setPartner = (
  network: Network,
  partnerAddress: string,
): ContractCallRegularOptions => {
  const contract = getTreasuryContract(network);

  return {
    ...contract,
    network,
    anchorMode: 1,
    functionName: 'set-partner',
    functionArgs: [principalCV(partnerAddress)],
    postConditionMode: PostConditionMode.Deny,
    postConditions: [],
  };
};

/**
 * Build a set-price-per-tree contract call.
 * Admin-only: set the per-tree payout price in microSTX.
 */
export const setPricePerTree = (
  network: Network,
  price: number,
): ContractCallRegularOptions => {
  const contract = getTreasuryContract(network);

  return {
    ...contract,
    network,
    anchorMode: 1,
    functionName: 'set-price-per-tree',
    functionArgs: [uintCV(price)],
    postConditionMode: PostConditionMode.Deny,
    postConditions: [],
  };
};
