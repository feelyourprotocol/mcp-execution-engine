import {
  type BALJSONBlockAccessList,
  BLOCK_ACCESS_LIST_ITEM_COST,
  bytesToHex,
  countBlockAccessListItems,
  createBlockLevelAccessListFromJSON,
  createBlockLevelAccessListFromRLP,
  hashBlockAccessListFromJSON,
  hexToBytes,
  validateBlockAccessListGasLimit,
  validateBlockAccessListHash,
  validateBlockAccessListHashFromJSON,
  validateBlockAccessListJSONStructure,
  validateBlockAccessListStructure,
} from '@ethereumjs/util'

import { ENGINE_CEILINGS } from '../forks/registry.js'
import { parseGasLimit } from '../forks/resolve.js'
import type { InspectInput, InspectResult } from '../types.js'
import { EngineError } from '../types.js'

function pushError(errors: string[], error: unknown): void {
  if (error instanceof Error) {
    errors.push(error.message)
  } else {
    errors.push(String(error))
  }
}

function parseExpectedHash(expectedHash: string): Uint8Array {
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

function isBalJson(value: unknown): value is BALJSONBlockAccessList {
  return Array.isArray(value)
}

function isRlpHexArtifact(value: unknown): value is string {
  return typeof value === 'string'
}

export function inspectArtifact(input: InspectInput): InspectResult {
  const kind = input.kind ?? 'block-access-list'
  if (kind !== 'block-access-list') {
    throw new EngineError(`Unsupported inspect kind: ${kind}`, 'invalid_input')
  }

  const errors: string[] = []
  let wellFormed = false
  let structureOk = false
  let hashMatch: boolean | undefined
  let itemCount = 0
  let computedHash = '0x'
  let itemCapOk: boolean | undefined
  const blockGasLimit =
    input.blockGasLimit !== undefined
      ? parseGasLimit(input.blockGasLimit)
      : ENGINE_CEILINGS.maxGasLimit
  const maxItems = (blockGasLimit / BigInt(BLOCK_ACCESS_LIST_ITEM_COST)).toString()

  try {
    if (isRlpHexArtifact(input.artifact)) {
      const rlp = hexToBytes(
        (input.artifact.trim().startsWith('0x')
          ? input.artifact.trim()
          : `0x${input.artifact.trim()}`) as `0x${string}`,
      )
      const bal = createBlockLevelAccessListFromRLP(rlp)
      wellFormed = true
      computedHash = bytesToHex(bal.hash())
      itemCount = countBlockAccessListItems(bal)

      try {
        validateBlockAccessListStructure(bal)
        structureOk = true
      } catch (error) {
        pushError(errors, error)
      }

      try {
        validateBlockAccessListGasLimit(bal, blockGasLimit)
        itemCapOk = true
      } catch (error) {
        itemCapOk = false
        pushError(errors, error)
      }

      if (input.expectedHash !== undefined) {
        try {
          validateBlockAccessListHash(bal, parseExpectedHash(input.expectedHash))
          hashMatch = true
        } catch (error) {
          hashMatch = false
          pushError(errors, error)
        }
      }
    } else if (isBalJson(input.artifact)) {
      const json = input.artifact
      wellFormed = true
      computedHash = bytesToHex(hashBlockAccessListFromJSON(json))

      try {
        validateBlockAccessListJSONStructure(json)
        structureOk = true
      } catch (error) {
        pushError(errors, error)
      }

      try {
        const bal = createBlockLevelAccessListFromJSON(json)
        itemCount = countBlockAccessListItems(bal)
        validateBlockAccessListGasLimit(bal, blockGasLimit)
        itemCapOk = true
      } catch (error) {
        itemCapOk = false
        pushError(errors, error)
      }

      if (input.expectedHash !== undefined) {
        try {
          validateBlockAccessListHashFromJSON(json, parseExpectedHash(input.expectedHash))
          hashMatch = true
        } catch (error) {
          hashMatch = false
          pushError(errors, error)
        }
      }
    } else {
      errors.push('artifact must be a BAL JSON array or an RLP hex string')
    }
  } catch (error) {
    pushError(errors, error)
  }

  return {
    kind: 'block-access-list',
    wellFormed,
    structureOk,
    hashMatch,
    itemCapOk,
    errors,
    itemCount,
    computedHash,
    maxItems,
  }
}
