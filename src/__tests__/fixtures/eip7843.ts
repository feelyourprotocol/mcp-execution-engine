/** Test-only EIP-7843 programs — not part of the MCP catalog. */

import { SLOTNUM } from '../../modules/eip-7843/opcodes.js'

const STOP = 0x00
const PUSH1 = 0x60
const MSTORE = 0x52
const RETURN = 0xf3
const INVALID = 0xfe

function toHex(code: Uint8Array): string {
  return `0x${Buffer.from(code).toString('hex')}`
}

export const SLOTNUM_CALLER = '0x00000000000000000000000000000000000000ee'
export const SLOTNUM_CONTRACT = '0x0000000000000000000000000000000000007843'

/** SLOTNUM then STOP — stack-only; used to show run_bytecode mock slot 0. */
export function slotnumStopHex(): string {
  return toHex(Uint8Array.from([SLOTNUM, STOP]))
}

/** SLOTNUM; PUSH1 0; MSTORE; PUSH1 32; PUSH1 0; RETURN — observe slot in returnValue. */
export function slotnumReturnHex(): string {
  return toHex(Uint8Array.from([SLOTNUM, PUSH1, 0x00, MSTORE, PUSH1, 0x20, PUSH1, 0x00, RETURN]))
}

/** SLOTNUM then INVALID — opcode is valid, program still fails. */
export function slotnumThenInvalidHex(): string {
  return toHex(Uint8Array.from([SLOTNUM, INVALID]))
}
