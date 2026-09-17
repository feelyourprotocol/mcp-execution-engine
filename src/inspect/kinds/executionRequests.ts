import { genRequestsRoot } from '@ethereumjs/block'
import {
  bytesToHex,
  concatBytes,
  createCLRequest,
  hexToBytes,
  type RequestJSON,
} from '@ethereumjs/util'
import { sha256 } from '@noble/hashes/sha2.js'

import type { InspectInput, InspectResult } from '../../types/index.js'
import { emptyInspectScalars, parseExpectedHash32, pushError } from '../shared.js'

function isRequestJson(value: unknown): value is RequestJSON {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const record = value as Record<string, unknown>
  return typeof record.type === 'string' && typeof record.data === 'string'
}

export function inspectExecutionRequests(input: InspectInput): InspectResult {
  const errors: string[] = []
  let wellFormed = false
  let structureOk = false
  let hashMatch: boolean | undefined
  let computedHash = '0x'

  if (!Array.isArray(input.artifact)) {
    return {
      kind: 'execution-requests',
      wellFormed: false,
      structureOk: false,
      errors: ['artifact must be a JSON array of EIP-7685 requests { type, data }'],
      ...emptyInspectScalars(),
    }
  }

  try {
    const requests = []
    for (const [index, entry] of input.artifact.entries()) {
      if (!isRequestJson(entry)) {
        errors.push(`requests[${index}]: invalid request object`)
        continue
      }
      const typeByte = hexToBytes(entry.type as `0x${string}`)
      if (typeByte.length !== 1) {
        errors.push(`requests[${index}]: type must be a single byte hex`)
        continue
      }
      const data = hexToBytes(entry.data as `0x${string}`)
      requests.push(createCLRequest(concatBytes(typeByte, data)))
    }

    wellFormed = requests.length === input.artifact.length && errors.length === 0
    structureOk = wellFormed

    if (wellFormed) {
      const root = genRequestsRoot(requests, sha256)
      computedHash = bytesToHex(root)
      if (input.expectedHash !== undefined) {
        const expected = parseExpectedHash32(input.expectedHash)
        if (root.length !== expected.length || !root.every((b, i) => b === expected[i])) {
          hashMatch = false
          errors.push('requestsHash mismatch')
        } else {
          hashMatch = true
        }
      }
    }
  } catch (error) {
    pushError(errors, error)
    structureOk = false
  }

  return {
    kind: 'execution-requests',
    wellFormed,
    structureOk,
    hashMatch,
    errors,
    itemCount: Array.isArray(input.artifact) ? input.artifact.length : 0,
    computedHash,
    details: {
      requestsHash: computedHash,
      note: 'Envelope and hash only — request body SSZ/RLP is not fully validated.',
    },
  }
}
