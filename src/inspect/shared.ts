import { hexToBytes } from '@ethereumjs/util'

import { EngineError } from '../types/index.js'

export function pushError(errors: string[], error: unknown): void {
  if (error instanceof Error) {
    errors.push(error.message)
  } else {
    errors.push(String(error))
  }
}

export function parseExpectedHash32(expectedHash: string): Uint8Array {
  const trimmed = expectedHash.trim()
  if (!trimmed) {
    throw new EngineError('expectedHash must not be empty', 'invalid_input')
  }
  const normalized = trimmed.startsWith('0x') ? trimmed : `0x${trimmed}`
  if (!/^0x[0-9a-fA-F]{64}$/.test(normalized)) {
    throw new EngineError('expectedHash must be 32-byte hex', 'invalid_input')
  }
  return hexToBytes(normalized as `0x${string}`)
}

export function normalizeHexArtifact(value: string): `0x${string}` {
  const trimmed = value.trim()
  return (trimmed.startsWith('0x') ? trimmed : `0x${trimmed}`) as `0x${string}`
}

export function emptyInspectScalars() {
  return {
    itemCount: 0,
    computedHash: '0x',
    maxItems: undefined as string | undefined,
    itemCapOk: undefined as boolean | undefined,
  }
}
