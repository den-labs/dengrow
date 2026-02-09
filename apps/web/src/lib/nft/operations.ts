import { Pc, PostConditionMode, principalCV, uintCV } from '@stacks/transactions';
import { getNftContract } from '@/constants/contracts';
import { Network } from '@/lib/network';
import { ContractCallRegularOptions } from '@stacks/connect';

/**
 * Mint a plant NFT - calls NFT contract mint(recipient)
 * Admin-only free mint (for testing/airdrops)
 */
export const mintPlantNFT = (
  network: Network,
  recipientAddress: string
): ContractCallRegularOptions => {
  const recipient = principalCV(recipientAddress);
  const functionArgs = [recipient];
  const contract = getNftContract(network);

  return {
    ...contract,
    network,
    anchorMode: 1,
    functionName: 'mint',
    functionArgs,
    postConditionMode: PostConditionMode.Deny,
    postConditions: [],
  };
};

// Legacy alias for backwards compatibility
export const mintFunnyDogNFT = mintPlantNFT;

// --- Tier Pricing ---

export type MintTier = 1 | 2 | 3;

export const MINT_TIERS: Record<
  MintTier,
  {
    id: MintTier;
    name: string;
    priceSTX: number;
    priceMicroSTX: number;
    description: string;
    colorScheme: string;
  }
> = {
  1: {
    id: 1,
    name: 'Basic',
    priceSTX: 1,
    priceMicroSTX: 1_000_000,
    description: 'Start your plant journey',
    colorScheme: 'green',
  },
  2: {
    id: 2,
    name: 'Premium',
    priceSTX: 2,
    priceMicroSTX: 2_000_000,
    description: 'Premium tier with priority support',
    colorScheme: 'purple',
  },
  3: {
    id: 3,
    name: 'Impact',
    priceSTX: 3,
    priceMicroSTX: 3_000_000,
    description: '2x donation to real tree planting',
    colorScheme: 'teal',
  },
};

/**
 * Paid mint with tier selection — calls mint-with-tier(recipient, tier)
 * STX post-condition ensures exact payment shown in wallet
 */
export const mintPlantNFTWithTier = (
  network: Network,
  recipientAddress: string,
  tier: MintTier,
  senderAddress: string
): ContractCallRegularOptions => {
  const tierInfo = MINT_TIERS[tier];
  const contract = getNftContract(network);
  const postCondition = Pc.principal(senderAddress)
    .willSendEq(tierInfo.priceMicroSTX)
    .ustx();

  return {
    ...contract,
    network,
    anchorMode: 1,
    functionName: 'mint-with-tier',
    functionArgs: [principalCV(recipientAddress), uintCV(tier)],
    postConditionMode: PostConditionMode.Deny,
    postConditions: [postCondition],
  };
};
