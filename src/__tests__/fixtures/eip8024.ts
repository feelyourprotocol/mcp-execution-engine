/** Minimal EIP-8024 DUPN demo bytecode (stack 1..17, DUPN depth 17). */
const DUPN = 0xe6
const STOP = 0x00
const PUSH1 = 0x60
const DUPN_MIN_DEPTH = 17

function encodeDupnSwapnImmediate(operandN: number): number {
  return (operandN + 111) & 0xff
}

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

export function dupnDemoBytecodeHex(): string {
  const code = concatBytes(
    buildPushSequence(DUPN_MIN_DEPTH),
    Uint8Array.from([DUPN, encodeDupnSwapnImmediate(DUPN_MIN_DEPTH), STOP]),
  )
  return `0x${Buffer.from(code).toString('hex')}`
}

/** Legacy-style deep stack manipulation without EIP-8024 opcodes (PUSH-heavy idiom). */
export function legacyStackIdiomBytecodeHex(): string {
  return '0x' + '60'.repeat(34) + '00'
}

export const PUSH1_STOP_HEX = '0x600100'

export const PUSH_ADD_HEX = '0x6001600201600055'
