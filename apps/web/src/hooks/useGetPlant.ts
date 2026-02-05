import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { hexToCV, cvToValue, cvToHex, uintCV } from '@stacks/transactions';
import { getStorageContract } from '@/constants/contracts';
import { useNetwork } from '@/lib/use-network';
import { getApi } from '@/lib/stacks-api';

export interface PlantState {
  stage: number;
  'growth-points': number;
  'last-water-block': number;
  owner: string;
}

interface PlantQueryResult {
  plant: PlantState | null;
  exists: boolean;
}

/**
 * Hook to fetch plant state from storage contract
 * (plant-storage on testnet, plant-game on mainnet/devnet)
 */
export const useGetPlant = (tokenId: number): UseQueryResult<PlantQueryResult> => {
  const network = useNetwork();

  return useQuery<PlantQueryResult>({
    queryKey: ['plant', tokenId, network],
    queryFn: async () => {
      if (!network) throw new Error('Network is required');

      const contract = getStorageContract(network);
      const api = getApi(network);

      try {
        const result = await api.smartContractsApi.callReadOnlyFunction({
          contractAddress: contract.contractAddress,
          contractName: contract.contractName,
          functionName: 'get-plant',
          readOnlyFunctionArgs: {
            sender: contract.contractAddress,
            arguments: [cvToHex(uintCV(tokenId))],
          },
        });

        if (!result.result) {
          return {
            exists: false,
            plant: null,
          };
        }

        // Parse the hex result
        const clarityValue = hexToCV(result.result);
        const parsedValue: any = cvToValue(clarityValue);

        // cvToValue returns: {type: "(tuple ...)", value: {stage: {type: "uint", value: 0}, ...}}
        // For (none), it returns null
        if (!parsedValue || !parsedValue.value) {
          return {
            exists: false,
            plant: null,
          };
        }

        // Extract the tuple value
        const tupleValue = parsedValue.value;

        // Check if it has the expected fields
        if (
          tupleValue.stage &&
          tupleValue['growth-points'] &&
          tupleValue['last-water-block'] &&
          tupleValue.owner
        ) {
          return {
            exists: true,
            plant: {
              stage: Number(tupleValue.stage.value),
              'growth-points': Number(tupleValue['growth-points'].value),
              'last-water-block': Number(tupleValue['last-water-block'].value),
              owner: String(tupleValue.owner.value),
            },
          };
        }

        // Plant doesn't exist or invalid format
        return {
          exists: false,
          plant: null,
        };
      } catch (error) {
        console.error('Error fetching plant state:', error);
        // Don't throw, return null state
        return {
          exists: false,
          plant: null,
        };
      }
    },
    enabled: !!network && tokenId > 0,
    retry: 2,
    staleTime: 5000, // Consider data fresh for 5 seconds
    refetchInterval: 10000, // Refetch every 10 seconds
    refetchOnWindowFocus: true,
  });
};

/**
 * Helper to get stage name from stage number
 */
export const getStageName = (stage: number): string => {
  const stageNames = ['Seed', 'Sprout', 'Plant', 'Bloom', 'Tree'];
  return stageNames[stage] || 'Unknown';
};

/**
 * Helper to get stage color for badges
 */
export const getStageColor = (stage: number): string => {
  const stageColors = ['gray', 'green', 'teal', 'purple', 'orange'];
  return stageColors[stage] || 'gray';
};

/**
 * Helper to check if plant can be watered
 */
export const canWaterPlant = (plant: PlantState | null, currentBlockHeight: number): boolean => {
  if (!plant) return false;

  const BLOCKS_PER_DAY = 144;
  const isTree = plant.stage >= 4;

  if (isTree) return false;

  if (plant['last-water-block'] === 0) return true;

  return currentBlockHeight >= plant['last-water-block'] + BLOCKS_PER_DAY;
};
