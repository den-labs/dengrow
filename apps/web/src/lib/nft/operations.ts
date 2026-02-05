import { PostConditionMode, principalCV } from '@stacks/transactions';
import { getNftContract } from '@/constants/contracts';
import { Network } from '@/lib/network';
import { ContractCallRegularOptions } from '@stacks/connect';

/**
 * Mint a plant NFT - calls NFT contract mint(recipient)
 * (plant-nft-v2 on testnet, plant-nft on mainnet/devnet)
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
