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

import { ENGINE_CEILINGS } from '../../forks/registry.js'
import { parseGasLimit } from '../../forks/resolve.js'
import type { InspectInput, InspectResult } from '../../types/index.js'
import { normalizeHexArtifact, parseExpectedHash32, pushError } from '../shared.js'

function isBalJson(value: unknown): value is BALJSONBlockAccessList {
  return Array.isArray(value)
}

function isRlpHexArtifact(value: unknown): value is string {
  return typeof value === 'string'
}

export function inspectBlockAccessList(input: InspectInput): InspectResult {
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
      const rlp = hexToBytes(normalizeHexArtifact(input.artifact))
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
          validateBlockAccessListHash(bal, parseExpectedHash32(input.expectedHash))
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
          validateBlockAccessListHashFromJSON(json, parseExpectedHash32(input.expectedHash))
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
