import { PostConditionMode, uintCV, bufferCV, stringAsciiCV } from '@stacks/transactions';
import { getImpactContract } from '@/constants/contracts';
import { Network } from '@/lib/network';
import { ContractCallRegularOptions } from '@stacks/connect';

/**
 * Compute SHA-256 hash of a string using Web Crypto API.
 * Returns a Uint8Array (32 bytes).
 */
export async function sha256(input: string): Promise<Uint8Array> {
  const encoded = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  return new Uint8Array(hashBuffer);
}

/**
 * Build a record-redemption contract call.
 * Admin-only: records that N trees from the Impact Pool have been redeemed
 * for real-world impact.
 *
 * Contract function: record-redemption(quantity uint, proof-hash (buff 32), proof-url (string-ascii 256))
 */
export const recordRedemption = (
  network: Network,
  quantity: number,
  proofHash: Uint8Array,
  proofUrl: string,
): ContractCallRegularOptions => {
  const contract = getImpactContract(network);

  return {
    ...contract,
    network,
    anchorMode: 1,
    functionName: 'record-redemption',
    functionArgs: [
      uintCV(quantity),
      bufferCV(proofHash),
      stringAsciiCV(proofUrl),
    ],
    postConditionMode: PostConditionMode.Deny,
    postConditions: [],
  };
};
