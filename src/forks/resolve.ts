import { hexToBytes } from '@ethereumjs/util'

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

export function resolveFork(fork?: ForkConfig): ResolvedFork {
  const config = normalizeForkConfig(fork)
  const common = buildCommon(config)
  return { config, common }
}
