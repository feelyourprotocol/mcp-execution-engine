import {
  DUPN,
  encodeDupnSwapnImmediate,
  encodeExchangeImmediate,
  EXCHANGE,
  SWAPN,
} from '../../modules/eip-8024/opcodes.js'

const STOP = 0x00
const PUSH1 = 0x60
const DUPN_MIN_DEPTH = 17

function buildPushSequence(count: number): Uint8Array {
  const bytes = new Uint8Array(count * 2)
  for (let i = 0; i < count; i++) {
    bytes[i * 2] = PUSH1
    bytes[i * 2 + 1] = i + 1
  }
  return bytes
}

function concatBytes(...parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.length, 0)
  const out = new Uint8Array(total)
  let offset = 0
  for (const part of parts) {
    out.set(part, offset)
    offset += part.length
  }
  return out
}

function toHex(code: Uint8Array): string {
  return `0x${Buffer.from(code).toString('hex')}`
}

/** Test-only programs — not part of the MCP catalog. */
export const PUSH1_STOP_HEX = '0x600100'

export function dupnDemoHex(): string {
  return toHex(
    concatBytes(
      buildPushSequence(DUPN_MIN_DEPTH),
      Uint8Array.from([DUPN, encodeDupnSwapnImmediate(DUPN_MIN_DEPTH), STOP]),
    ),
  )
}

export function swapnDemoHex(): string {
  return toHex(
    concatBytes(
      buildPushSequence(DUPN_MIN_DEPTH + 1),
      Uint8Array.from([SWAPN, encodeDupnSwapnImmediate(DUPN_MIN_DEPTH), STOP]),
    ),
  )
}

export function exchangeDemoHex(): string {
  // Stack depths 2 and 3 below the top → n=1, m=2
  return toHex(
    concatBytes(
      buildPushSequence(4),
      Uint8Array.from([EXCHANGE, encodeExchangeImmediate(1, 2), STOP]),
    ),
  )
}

export function invalidDupnDemoHex(): string {
  return toHex(
    concatBytes(
      buildPushSequence(3),
      Uint8Array.from([DUPN, encodeDupnSwapnImmediate(DUPN_MIN_DEPTH), STOP]),
    ),
  )
}
