import type { EngineErrorFacts } from '../types/errorFacts.js'

export type RejectedHexShape = 'empty' | 'non_hex' | 'odd_length' | 'too_long'

function hexBody(raw: string): { normalized: string; hasPrefix: boolean } {
  const trimmed = raw.trim()
  const hasPrefix = trimmed.startsWith('0x') || trimmed.startsWith('0X')
  const normalized = hasPrefix ? trimmed : `0x${trimmed}`
  return { normalized, hasPrefix }
}

function firstNonHexIndex(body: string): number | undefined {
  for (let i = 2; i < body.length; i++) {
    const ch = body[i]
    if (!/[0-9a-fA-F]/.test(ch)) {
      return i - 2
    }
  }
  return undefined
}

/** Classify malformed hex without storing the raw program or calldata. */
export function describeRejectedHex(
  raw: string,
  fieldPrefix: string,
  maxBytes?: number,
): { shape: RejectedHexShape; facts: EngineErrorFacts } {
  const trimmed = raw.trim()
  if (!trimmed) {
    return {
      shape: 'empty',
      facts: {
        [`${fieldPrefix}.shape`]: 'empty',
        [`${fieldPrefix}.chars`]: 0,
      },
    }
  }

  const { normalized } = hexBody(raw)
  const body = normalized.slice(2)
  const facts: EngineErrorFacts = {
    [`${fieldPrefix}.chars`]: trimmed.length,
    [`${fieldPrefix}.has0xPrefix`]: trimmed.startsWith('0x') || trimmed.startsWith('0X'),
  }

  if (!/^0x[0-9a-fA-F]*$/i.test(normalized)) {
    const badAt = firstNonHexIndex(normalized)
    if (badAt !== undefined) {
      facts[`${fieldPrefix}.firstBadCharIndex`] = badAt
    }
    return { shape: 'non_hex', facts: { ...facts, [`${fieldPrefix}.shape`]: 'non_hex' } }
  }

  if (normalized.length % 2 !== 0) {
    return { shape: 'odd_length', facts: { ...facts, [`${fieldPrefix}.shape`]: 'odd_length' } }
  }

  const byteLen = body.length / 2
  facts[`${fieldPrefix}.bytes`] = byteLen
  if (maxBytes !== undefined && byteLen > maxBytes) {
    facts[`${fieldPrefix}.maxBytes`] = maxBytes
    return { shape: 'too_long', facts: { ...facts, [`${fieldPrefix}.shape`]: 'too_long' } }
  }

  return { shape: 'non_hex', facts: { ...facts, [`${fieldPrefix}.shape`]: 'non_hex' } }
}

/** Shape metadata for a failed 20-byte address parse — never the raw string. */
export function describeRejectedAddress(fieldPrefix: string, raw: string): EngineErrorFacts {
  const trimmed = raw.trim()
  const normalized = trimmed.startsWith('0x') || trimmed.startsWith('0X') ? trimmed : `0x${trimmed}`
  const hexOnly = normalized.startsWith('0x') ? normalized.slice(2) : normalized
  const hexCharsetOk = /^[0-9a-fA-F]*$/.test(hexOnly)
  return {
    [`${fieldPrefix}.chars`]: trimmed.length,
    [`${fieldPrefix}.hexDigits`]: hexOnly.length,
    [`${fieldPrefix}.has0xPrefix`]: trimmed.startsWith('0x') || trimmed.startsWith('0X'),
    [`${fieldPrefix}.hexCharsetOk`]: hexCharsetOk,
    [`${fieldPrefix}.expectedHexDigits`]: 40,
  }
}

export function describeRejectedInteger(
  fieldPrefix: string,
  raw: string | undefined,
  kind: 'decimal' | 'wei' | 'nonce',
): EngineErrorFacts {
  const trimmed = raw?.trim() ?? ''
  return {
    [`${fieldPrefix}.kind`]: kind,
    [`${fieldPrefix}.chars`]: trimmed.length,
    [`${fieldPrefix}.empty`]: trimmed.length === 0,
  }
}

export function gasLimitFacts(parsed: bigint, ceiling: bigint): EngineErrorFacts {
  return {
    gasLimit: parsed.toString(),
    gasLimitCeiling: ceiling.toString(),
  }
}
