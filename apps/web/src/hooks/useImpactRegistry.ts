import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { hexToCV, cvToValue, cvToHex, uintCV } from '@stacks/transactions';
import { isTestnetEnvironment, useNetwork } from '@/lib/use-network';
import { Network } from '@/lib/network';
import { getContractAddress } from '@/constants/contracts';
import { getApi } from '@/lib/stacks-api';

export interface PoolStats {
  totalGraduated: number;
  totalRedeemed: number;
  currentPoolSize: number;
  totalBatches: number;
}

export interface GraduationInfo {
  graduatedAt: number;
  owner: string;
  redeemed: boolean;
}

export interface BatchInfo {
  quantity: number;
  timestamp: number;
  proofHash: string;
  proofUrl: string;
  recordedBy: string;
}

/**
 * Get impact registry contract info
 */
const getImpactRegistryContract = (network: Network) => {
  const isTestnet = isTestnetEnvironment(network);
  return {
    contractAddress: getContractAddress(network),
    contractName: isTestnet ? 'impact-registry' : 'impact-registry',
  };
};

/**
 * Hook to fetch pool statistics from impact registry
 */
export const usePoolStats = (): UseQueryResult<PoolStats> => {
  const network = useNetwork();

  return useQuery<PoolStats>({
    queryKey: ['impact-pool-stats', network],
    queryFn: async () => {
      if (!network) throw new Error('Network is required');

      const contract = getImpactRegistryContract(network);
      const api = getApi(network);

      try {
        const result = await api.smartContractsApi.callReadOnlyFunction({
          contractAddress: contract.contractAddress,
          contractName: contract.contractName,
          functionName: 'get-pool-stats',
          readOnlyFunctionArgs: {
            sender: contract.contractAddress,
            arguments: [],
          },
        });

        if (!result.result) {
          throw new Error('No result from get-pool-stats');
        }

        const clarityValue = hexToCV(result.result);
        const parsed: any = cvToValue(clarityValue);

        return {
          totalGraduated: Number(parsed['total-graduated']?.value ?? 0),
          totalRedeemed: Number(parsed['total-redeemed']?.value ?? 0),
          currentPoolSize: Number(parsed['current-pool-size']?.value ?? 0),
          totalBatches: Number(parsed['total-batches']?.value ?? 0),
        };
      } catch (error) {
        console.error('Error fetching pool stats:', error);
        // Return default values on error
        return {
          totalGraduated: 0,
          totalRedeemed: 0,
          currentPoolSize: 0,
          totalBatches: 0,
        };
      }
    },
    enabled: !!network,
    retry: 2,
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchInterval: 60000, // Refetch every minute
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook to fetch graduation info for a specific token
 */
export const useGraduationInfo = (tokenId: number): UseQueryResult<GraduationInfo | null> => {
  const network = useNetwork();

  return useQuery<GraduationInfo | null>({
    queryKey: ['graduation-info', tokenId, network],
    queryFn: async () => {
      if (!network) throw new Error('Network is required');

      const contract = getImpactRegistryContract(network);
      const api = getApi(network);

      try {
        const result = await api.smartContractsApi.callReadOnlyFunction({
          contractAddress: contract.contractAddress,
          contractName: contract.contractName,
          functionName: 'get-graduation',
          readOnlyFunctionArgs: {
            sender: contract.contractAddress,
            arguments: [cvToHex(uintCV(tokenId))],
          },
        });

        if (!result.result) {
          return null;
        }

        const clarityValue = hexToCV(result.result);
        const parsed: any = cvToValue(clarityValue);

        if (!parsed || !parsed.value) {
          return null;
        }

        const tupleValue = parsed.value;

        return {
          graduatedAt: Number(tupleValue['graduated-at']?.value ?? 0),
          owner: String(tupleValue.owner?.value ?? ''),
          redeemed: Boolean(tupleValue.redeemed?.value ?? false),
        };
      } catch (error) {
        console.error('Error fetching graduation info:', error);
        return null;
      }
    },
    enabled: !!network && tokenId > 0,
    retry: 2,
    staleTime: 30000,
  });
};

/**
 * Hook to fetch batch info
 */
export const useBatchInfo = (batchId: number): UseQueryResult<BatchInfo | null> => {
  const network = useNetwork();

  return useQuery<BatchInfo | null>({
    queryKey: ['batch-info', batchId, network],
    queryFn: async () => {
      if (!network) throw new Error('Network is required');

      const contract = getImpactRegistryContract(network);
      const api = getApi(network);

      try {
        const result = await api.smartContractsApi.callReadOnlyFunction({
          contractAddress: contract.contractAddress,
          contractName: contract.contractName,
          functionName: 'get-batch',
          readOnlyFunctionArgs: {
            sender: contract.contractAddress,
            arguments: [cvToHex(uintCV(batchId))],
          },
        });

        if (!result.result) {
          return null;
        }

        const clarityValue = hexToCV(result.result);
        const parsed: any = cvToValue(clarityValue);

        if (!parsed || !parsed.value) {
          return null;
        }

        const tupleValue = parsed.value;

        return {
          quantity: Number(tupleValue.quantity?.value ?? 0),
          timestamp: Number(tupleValue.timestamp?.value ?? 0),
          proofHash: String(tupleValue['proof-hash']?.value ?? ''),
          proofUrl: String(tupleValue['proof-url']?.value ?? ''),
          recordedBy: String(tupleValue['recorded-by']?.value ?? ''),
        };
      } catch (error) {
        console.error('Error fetching batch info:', error);
        return null;
      }
    },
    enabled: !!network && batchId > 0,
    retry: 2,
    staleTime: 60000,
  });
};

/**
 * Hook to check if a token has graduated
 */
export const useIsGraduated = (tokenId: number): UseQueryResult<boolean> => {
  const network = useNetwork();

  return useQuery<boolean>({
    queryKey: ['is-graduated', tokenId, network],
    queryFn: async () => {
      if (!network) throw new Error('Network is required');

      const contract = getImpactRegistryContract(network);
      const api = getApi(network);

      try {
        const result = await api.smartContractsApi.callReadOnlyFunction({
          contractAddress: contract.contractAddress,
          contractName: contract.contractName,
          functionName: 'is-graduated',
          readOnlyFunctionArgs: {
            sender: contract.contractAddress,
            arguments: [cvToHex(uintCV(tokenId))],
          },
        });

        if (!result.result) {
          return false;
        }

        const clarityValue = hexToCV(result.result);
        const parsed: any = cvToValue(clarityValue);

        return Boolean(parsed?.value ?? false);
      } catch (error) {
        console.error('Error checking graduation status:', error);
        return false;
      }
    },
    enabled: !!network && tokenId > 0,
    retry: 2,
    staleTime: 30000,
  });
};
