/** Test-only EIP-8038 fixtures — not part of the MCP catalog. */

export const ACCESS_GAS_CALLER = '0x00000000000000000000000000000000000000e1'
export const SSTORE_CONTRACT = '0x00000000000000000000000000000000000000e2'

/** PUSH1 7; PUSH1 3; SSTORE; STOP — write 7 into slot 3 (not the widget 2/0 program). */
export const SSTORE_SLOT3_VALUE7 = '0x600760035500'
/** PUSH1 7; PUSH1 3; SSTORE; PUSH1 3; SLOAD; STOP — persist then read. */
export const SSTORE_THEN_SLOAD_SLOT3 = '0x600760035560035400'
/** PUSH1 3; SLOAD; STOP */
export const SLOAD_SLOT3 = '0x60035400'
/** PUSH20 0x…aa; EXTCODESIZE; STOP */
export const EXTCODESIZE_AA = `0x73${'00'.repeat(19)}aa3b00`
/** SSTORE with one stack item — underflow. */
export const SSTORE_UNDERFLOW = '0x600055'
