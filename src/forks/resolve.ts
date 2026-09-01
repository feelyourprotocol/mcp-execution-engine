import type { Address } from '@ethereumjs/util'
import {
  createAccount,
  createAddressFromString,
  hexToBytes,
  type PrefixedHexString,
} from '@ethereumjs/util'

import type { ForkConfig } from '../types.js'
import { EngineError } from '../types.js'
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

export function parseGasLimit(gasLimit?: string): bigint {
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

  if (parsed > ENGINE_CEILINGS.maxGasLimit) {
    throw new EngineError(
      `gasLimit exceeds ceiling (${ENGINE_CEILINGS.maxGasLimit.toString()})`,
      'gas_limit_too_high',
    )
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
