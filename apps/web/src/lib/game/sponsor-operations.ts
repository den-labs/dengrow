import { Pc, PostConditionMode, uintCV, stringAsciiCV } from '@stacks/transactions';
import { getContractAddress } from '@/constants/contracts';
import { isTestnetEnvironment } from '@/lib/use-network';
import { Network } from '@/lib/network';
import { ContractCallRegularOptions } from '@stacks/connect';

const getImpactContract = (network: Network) => ({
  contractAddress: getContractAddress(network),
  contractName: isTestnetEnvironment(network) ? 'impact-registry' : 'impact-registry',
});

/** Minimum sponsorship in microSTX (1 STX) */
export const MIN_SPONSORSHIP_MICROSTX = 1_000_000;
export const MIN_SPONSORSHIP_STX = 1;

/**
 * Sponsor a batch - sends STX to deployer with on-chain attribution
 */
export const sponsorBatch = (
  network: Network,
  batchId: number,
  sponsorName: string,
  amountMicroStx: number,
  senderAddress: string
): ContractCallRegularOptions => {
  const contract = getImpactContract(network);
  const postCondition = Pc.principal(senderAddress)
    .willSendEq(amountMicroStx)
    .ustx();

  return {
    ...contract,
    network,
    anchorMode: 1,
    functionName: 'sponsor-batch',
    functionArgs: [
      uintCV(batchId),
      stringAsciiCV(sponsorName),
      uintCV(amountMicroStx),
    ],
    postConditionMode: PostConditionMode.Deny,
    postConditions: [postCondition],
  };
};
