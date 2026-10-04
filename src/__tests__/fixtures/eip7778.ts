/** Test-only EIP-7778 fixtures — not part of the MCP catalog. */

export const REFUND_CALLER = '0x0000000000000000000000000000000000000077'
export const REFUND_CONTRACT = '0x0000000000000000000000000000000000000078'

/** PUSH1 0; PUSH1 4; SSTORE; STOP — clear slot 4. */
export const CLEAR_SLOT4 = '0x600060045500'
/** PUSH1 2; PUSH1 4; SSTORE; STOP — rewrite slot 4 to 2. */
export const REWRITE_SLOT4 = '0x600260045500'

export const SLOT4_NONZERO = [{ slot: '0x04', value: '0x09' }]
