/**
 * EIP-8037 catalog facts — encoding and observation, not demo programs.
 *
 * canonicalSource: website/src/explorations/eip-8037/canonical.ts
 */

/** Spec cost-per-state-byte (EIP-8037). */
export const COST_PER_STATE_BYTE = 1530n

/** First-touch empty account: 120 bytes × cost-per-state-byte. */
export const FIRST_TOUCH_ACCOUNT_BYTES = 120n
export const FIRST_TOUCH_STATE_GAS = FIRST_TOUCH_ACCOUNT_BYTES * COST_PER_STATE_BYTE

/** New storage slot: 64 bytes × cost-per-state-byte. */
export const NEW_STORAGE_SLOT_BYTES = 64n
export const NEW_STORAGE_SLOT_STATE_GAS = NEW_STORAGE_SLOT_BYTES * COST_PER_STATE_BYTE

export const TRANSACTION_LAYOUT =
  'run_transaction: { from, to, value (wei string), data?, code?, accounts?, gasLimit? }. Prefunds from. Empty `to` (no code, no prior balance) + nonzero value is a first-touch. Prefund `to` via accounts[] to collapse account-creation gas. gasUsed is paid tx gas (intrinsic + execution). On Glamsterdam also txRegularGas / txStateGas.'

export const FIRST_TOUCH_NOTE =
  'Nonzero value to an empty account charges 120 × 1530 = 183600 state gas on Glamsterdam. A simple transfer is gasUsed ≈ 204600 vs Fusaka 21000. Pass gasLimit "21000" to see Glamsterdam fail (intrinsic / state gas).'

export const NEW_SLOT_NOTE =
  'SSTORE into an empty slot charges 64 × 1530 = 97920 state gas on Glamsterdam. On run_bytecode that is stateGasSpilled (gasUsed includes the spill). On run_transaction it is txStateGas. Compare fusaka vs glamsterdam rather than assuming the paid-tx delta equals 97920.'
