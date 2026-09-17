import type { Address } from '@ethereumjs/util'
import {
  createAccount,
  createAddressFromString,
  hexToBytes,
  type PrefixedHexString,
} from '@ethereumjs/util'

import type { ForkConfig } from '../types/index.js'
import { EngineError } from '../types/index.js'
import { buildCommon, ENGINE_CEILINGS, normalizeForkConfig } from './registry.js'

export interface ResolvedFork {
  config: ForkConfig
  common: ReturnType<typeof buildCommon>
}

export function parseBytecodeHex(bytecode: string): Uint8Array {
  const trimmed = bytecode.trim()
  if (!trimmed) {
    throw new EngineError('Bytecode must not be empty', 'empty_bytecode')
  }

  const normalized = trimmed.startsWith('0x') ? trimmed : `0x${trimmed}`
  if (!/^0x[0-9a-fA-F]*$/.test(normalized)) {
    throw new EngineError('Bytecode must be a hex string', 'invalid_bytecode')
  }

  if (normalized.length % 2 !== 0) {
    throw new EngineError('Bytecode hex must have an even number of digits', 'invalid_bytecode')
  }

  const bytes = hexToBytes(normalized as `0x${string}`)
  if (bytes.length > ENGINE_CEILINGS.maxBytecodeBytes) {
    throw new EngineError(
      `Bytecode exceeds max size (${ENGINE_CEILINGS.maxBytecodeBytes} bytes)`,
      'bytecode_too_large',
    )
  }

  return bytes
}

export function parseGasLimit(
  gasLimit?: string,
  ceiling: bigint = ENGINE_CEILINGS.maxGasLimit,
): bigint {
  if (gasLimit === undefined) {
    return ENGINE_CEILINGS.defaultGasLimit
  }

  let parsed: bigint
  try {
    parsed = BigInt(gasLimit)
  } catch {
    throw new EngineError('gasLimit must be an integer string', 'invalid_gas_limit')
  }

  if (parsed <= 0n) {
    throw new EngineError('gasLimit must be positive', 'invalid_gas_limit')
  }

  if (parsed > ceiling) {
    throw new EngineError(`gasLimit exceeds ceiling (${ceiling.toString()})`, 'gas_limit_too_high')
  }

  return parsed
}

export function parseAddress(address: string): ReturnType<typeof createAddressFromString> {
  const trimmed = address.trim()
  const normalized = trimmed.startsWith('0x') ? trimmed : `0x${trimmed}`
  if (!/^0x[0-9a-fA-F]{40}$/.test(normalized)) {
    throw new EngineError('Address must be a 20-byte hex string', 'invalid_address')
  }
  return createAddressFromString(normalized as PrefixedHexString)
}

/** EIP-7843 slot and other header integers are uint64. */
export const UINT64_MAX = (1n << 64n) - 1n

export function parseUint64Field(raw: string | undefined, field: string): bigint | undefined {
  if (raw === undefined || raw.trim() === '') {
    return undefined
  }
  const trimmed = raw.trim()
  if (!/^[0-9]+$/.test(trimmed)) {
    throw new EngineError(`${field} must be a whole number (0 or more)`, 'invalid_header')
  }
  const value = BigInt(trimmed)
  if (value > UINT64_MAX) {
    throw new EngineError(`${field} is larger than a 64-bit unsigned integer`, 'invalid_header')
  }
  return value
}

export function parseWeiValue(value?: string): bigint {
  if (value === undefined || value.trim() === '') {
    return 0n
  }

  let parsed: bigint
  try {
    parsed = BigInt(value.trim())
  } catch {
    throw new EngineError('value must be an integer wei string', 'invalid_value')
  }

  if (parsed < 0n) {
    throw new EngineError('value must not be negative', 'invalid_value')
  }

  return parsed
}

export function parseOptionalHexData(data?: string): Uint8Array {
  if (data === undefined || data.trim() === '') {
    return new Uint8Array()
  }

  const trimmed = data.trim()
  const normalized = trimmed.startsWith('0x') ? trimmed : `0x${trimmed}`
  if (!/^0x[0-9a-fA-F]*$/.test(normalized)) {
    throw new EngineError('data must be a hex string', 'invalid_data')
  }
  if (normalized.length % 2 !== 0) {
    throw new EngineError('data hex must have an even number of digits', 'invalid_data')
  }
  return hexToBytes(normalized as PrefixedHexString)
}

/** 32-byte word for storage keys/values. Shorter hex is left-padded. */
export function parseBytes32(hex: string, field: string): Uint8Array {
  const trimmed = hex.trim()
  if (!trimmed) {
    throw new EngineError(`${field} must not be empty`, 'invalid_storage')
  }
  const normalized = trimmed.startsWith('0x') ? trimmed : `0x${trimmed}`
  if (!/^0x[0-9a-fA-F]*$/.test(normalized)) {
    throw new EngineError(`${field} must be a hex string`, 'invalid_storage')
  }
  if (normalized.length % 2 !== 0) {
    throw new EngineError(`${field} hex must have an even number of digits`, 'invalid_storage')
  }
  const bytes = hexToBytes(normalized as PrefixedHexString)
  if (bytes.length > 32) {
    throw new EngineError(`${field} exceeds 32 bytes`, 'invalid_storage')
  }
  if (bytes.length === 32) return bytes
  const padded = new Uint8Array(32)
  padded.set(bytes, 32 - bytes.length)
  return padded
}

/** Prefund caller balance for value-bearing message calls. */
export function defaultCallerBalance(value: bigint): bigint {
  return value + BigInt(1e18)
}

export function prefundCallerAccount(
  stateManager: {
    putAccount: (address: Address, account?: ReturnType<typeof createAccount>) => Promise<void>
  },
  caller: ReturnType<typeof createAddressFromString>,
  value: bigint,
): Promise<void> {
  return stateManager.putAccount(
    caller,
    createAccount({ nonce: 0n, balance: defaultCallerBalance(value) }),
  )
}

export function resolveFork(fork?: ForkConfig): ResolvedFork {
  const config = normalizeForkConfig(fork)
  const common = buildCommon(config)
  return { config, common }
}
