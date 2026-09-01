/** Test-only EIP-7708 fixtures — not part of the MCP catalog. */

export const PLAIN_CALLER = '0x00000000000000000000000000000000000000ee'
export const PLAIN_RECIPIENT = '0x00000000000000000000000000000000000000aa'
export const WALLET_ADDRESS = '0x0000000000000000000000000000000000000420'
export const FORWARD_TARGET = '0x00000000000000000000000000000000000000bb'
export const REVERT_CALLEE = '0x00000000000000000000000000000000000000cc'

/** PUSH1 0; PUSH1 0; REVERT */
export const REVERT_BYTECODE = '0x60006000fd'

/** Forwards 1 wei to FORWARD_TARGET via CALL. */
export function walletForwardBytecodeHex(): string {
  const to = FORWARD_TARGET.slice(2).toLowerCase()
  return `0x6000600060006001600173${to}5af100`
}

/** CALLs REVERT_CALLEE with 1 wei — inner transfer rolls back on revert. */
export function revertedValueCallBytecodeHex(): string {
  const to = REVERT_CALLEE.slice(2).toLowerCase()
  return `0x6000600060006001600173${to}5af100`
}

/** Runs wallet forward bytecode in isolation (inner CALL with value). */
export function walletForwardRunnerHex(): string {
  return walletForwardBytecodeHex()
}
