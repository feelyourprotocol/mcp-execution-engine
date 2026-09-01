/**
 * EIP-7708 catalog facts — encoding and observation, not demo programs.
 *
 * canonicalSource: website/src/explorations/eip-7708/canonical.ts
 */

/** System-address emitter for EIP-7708 Transfer logs (same as ERC-20 Transfer topic). */
export const TRANSFER_LOG_EMITTER = '0xfffffffffffffffffffffffffffffffffffffffe'

export const TRANSFER_EVENT_SIGNATURE =
  'Transfer(address,address,uint256) — keccak topic 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

export const MESSAGE_CALL_LAYOUT =
  'Optional messageCall: { caller, to, value (wei string), data?, code? } for value-bearing calls without wrapper bytecode. Prefunds caller balance in-engine. Tx-level and burn logs need a future block/tx simulate path.'

export const VALUE_BEARING_CALL_NOTE =
  'Nonzero value on successful CALL/CREATE emits a system-address Transfer log on Amsterdam. Zero value and reverted value moves stay silent.'
