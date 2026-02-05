import { getNftContract } from '@/constants/contracts';
import { Network } from '@/lib/network';

/**
 * Get the image URL for a plant NFT
 * Uses the dynamic SVG generator API with stage info
 */
export const getPlantImage = (
  tokenId: number,
  stage: number = 0
): string => {
  return `/api/image/${tokenId}?stage=${stage}`;
};

/**
 * Legacy placeholder image function
 * Now redirects to dynamic plant image generator
 */
export const getPlaceholderImage = (
  network: Network,
  nftAssetContract: string,
  tokenId: number,
  stage: number = 0
): string | null => {
  const { contractAddress, contractName } = getNftContract(network);
  if (nftAssetContract === `${contractAddress}.${contractName}`) {
    return getPlantImage(tokenId, stage);
  }
  return null;
};

/**
 * Get metadata URL for a plant NFT
 */
export const getMetadataUrl = (tokenId: number, stage?: number): string => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const params = stage !== undefined ? `?stage=${stage}` : '';
  return `${baseUrl}/api/metadata/${tokenId}${params}`;
};
