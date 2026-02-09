/**
 * Maps Clarity contract error codes to user-friendly messages.
 *
 * Error codes by contract:
 * - plant-game-v1: u100-u105
 * - plant-nft: u100, u101, u300, u302
 * - impact-registry: u100-u105
 */

const CONTRACT_ERRORS: Record<number, string> = {
  100: 'You are not authorized to perform this action',
  101: 'Plant not found',
  102: 'Cooldown active — please wait before watering again',
  103: 'This plant has already graduated to Tree stage',
  104: 'This plant has already been initialized',
  105: 'Contract is not authorized',
  300: 'All plants have been minted (sold out)',
  302: 'Invalid mint tier selected',
};

/**
 * Extract a user-friendly error message from a Stacks transaction error.
 * Parses the numeric error code from the error string/object and maps it.
 */
export function getContractErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);

  // Match patterns like "(err u102)" or "u102" or "error code: 102"
  const match = raw.match(/u(\d+)/);
  if (match) {
    const code = parseInt(match[1], 10);
    if (code in CONTRACT_ERRORS) {
      return CONTRACT_ERRORS[code];
    }
    return `Transaction failed (error code: ${code})`;
  }

  // Common non-contract errors
  if (raw.includes('InsufficientFunds') || raw.includes('NotEnoughFunds')) {
    return 'Insufficient STX balance for this transaction';
  }
  if (raw.includes('ConflictingNonceInMempool')) {
    return 'A previous transaction is still pending — please wait';
  }
  if (raw.includes('BadNonce')) {
    return 'Transaction nonce error — please try again';
  }

  return raw || 'Transaction failed';
}
