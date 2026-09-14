/**
 * EIP-8038 catalog facts — encoding and observation, not demo programs.
 *
 * canonicalSource: website/src/explorations/eip-8038/canonical.ts
 */
import { LAB_BYTECODE_ADDRESS } from '../../transaction/lab.js'

export const SSTORE = 0x55
export const SLOAD = 0x54
export const EXTCODESIZE = 0x3b

/** EIP-2929 / EIP-8038 — unchanged. */
export const COLD_STORAGE_ACCESS = 2_100n
/** EIP-2200 write remainder extracted in EIP-8038. */
export const OSAKA_STORAGE_WRITE = 2_800n
/** EIP-8038 STORAGE_WRITE. */
export const AMSTERDAM_STORAGE_WRITE = 10_000n

export const SSTORE_LAYOUT = `PUSH value, PUSH slot, SSTORE. run_bytecode is a message-call at ${LAB_BYTECODE_ADDRESS} (call-frame gas). Seed an existing slot via accounts[].storage on that address: [{ slot, value }] hex words (≤32 bytes). Empty slot is the create path (Amsterdam stateGasSpilled 97_920). Paid tx / txStateGas still use run_transaction with \`code\` at \`to\`.`

export const SLOAD_LAYOUT =
  'PUSH slot, SLOAD. Cold SLOAD is 2_100 on Osaka and Amsterdam. run_bytecode is enough for a touch-only read.'

export const EXTCODESIZE_LAYOUT =
  'PUSH20 address, EXTCODESIZE. Amsterdam adds WARM_ACCESS (100) for the second database read on top of COLD_ACCOUNT_ACCESS 3_000 (was 2_600).'

export const SSTORE_NOTE =
  'Existing-slot first SSTORE (cold): Amsterdam call-frame ~12_106 (2_100 access + 10_000 write + pushes) vs Osaka ~5_006. New empty slot: Amsterdam stateGasSpilled 64 × 1530 = 97_920 (EIP-8037 create); gasUsed includes that spill. Paid tx gas also includes 21_000 + EIP-2780 — use run_transaction for txStateGas. STORAGE_WRITE is net-metered — writing the same value again does not re-charge the write.'

export const SLOAD_NOTE =
  'Cold SLOAD stays 2_100. Do not expect an 8038 delta on a read-only program.'

export const EXTCODESIZE_NOTE =
  'EXTCODESIZE is more expensive than BALANCE after Amsterdam (second read). Compare gasUsed on osaka vs amsterdam.'
