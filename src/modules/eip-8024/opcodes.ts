/** EIP-8024 opcode ids and immediate encoding (spec math — not demo programs). */

export const DUPN = 0xe6
export const SWAPN = 0xe7
export const EXCHANGE = 0xe8

export const DUPN_SWAPN_MIN_DEPTH = 17
export const DUPN_SWAPN_MAX_DEPTH = 235

/** Spec: immediate = k XOR 143. */
export const EXCHANGE_XOR_MASK = 0x8f

/**
 * Encode DUPN / SWAPN immediate for one-based depth n (17..235).
 * Spec: n = (x + 145) mod 256 ⇒ x = (n + 111) mod 256.
 */
export function encodeDupnSwapnImmediate(operandN: number): number {
  return (operandN + 111) & 0xff
}

/**
 * Encode EXCHANGE immediate for operands n, m (EIP-8024).
 * For stack depths A,B (1 = top): n = min(A,B) - 1, m = max(A,B) - 1.
 */
export function encodeExchangeImmediate(n: number, m: number): number {
  let q: number
  let r: number
  if (m <= 16) {
    q = n - 1
    r = m - 1
  } else {
    q = 29 - m
    r = n - 1
  }
  const k = 16 * q + r
  return k ^ EXCHANGE_XOR_MASK
}
