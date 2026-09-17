import {
  bytesToBigInt,
  bytesToHex,
  eoaCode7702AuthorizationHashedMessageToSign,
  type EOACode7702AuthorizationListBytesItem,
  eoaCode7702AuthorizationListJSONItemToBytes,
  eoaCode7702RecoverAuthority,
  MAX_INTEGER,
  MAX_UINT64,
  validateNoLeadingZeroes,
} from '@ethereumjs/util'

import { normalizeAuthItems } from '../../authorization/normalize.js'
import type { InspectInput, InspectResult } from '../../types/index.js'
import { emptyInspectScalars, pushError } from '../shared.js'

function verifyAuthorizationListItem(item: EOACode7702AuthorizationListBytesItem): void {
  if (item.length !== 6) {
    throw new Error('authorization list item should have 6 elements')
  }
  for (const member of item) {
    if (Array.isArray(member)) {
      throw new Error('authority list element is a list, not bytes')
    }
  }
  const [chainId, address, nonce, yParity, r, s] = item
  validateNoLeadingZeroes({ yParity, r, s, nonce, chainId })
  if (address.length !== 20) {
    throw new Error('address length should be 20 bytes')
  }
  if (bytesToBigInt(chainId) > MAX_INTEGER) {
    throw new Error('chainId exceeds 2^256 - 1')
  }
  if (bytesToBigInt(nonce) > MAX_UINT64) {
    throw new Error('nonce exceeds 2^64 - 1')
  }
  if (bytesToBigInt(yParity) >= BigInt(2 ** 8)) {
    throw new Error('yParity should fit within 1 byte (0 - 255)')
  }
  if (bytesToBigInt(r) > MAX_INTEGER) {
    throw new Error('r exceeds 2^256 - 1')
  }
  if (bytesToBigInt(s) > MAX_INTEGER) {
    throw new Error('s exceeds 2^256 - 1')
  }
}

export function inspectAuthorizationList(input: InspectInput): InspectResult {
  const errors: string[] = []
  let wellFormed = false
  let structureOk = false
  const items = normalizeAuthItems(input.artifact)

  const authorities: string[] = []
  const signingDigests: string[] = []

  if (items === undefined) {
    errors.push(
      'artifact must be one EIP-7702 authorization JSON object or a non-empty array of them',
    )
    return {
      kind: 'authorization-list',
      wellFormed: false,
      structureOk: false,
      errors,
      ...emptyInspectScalars(),
      details: { authorities, signingDigests },
    }
  }

  if (items.length === 0) {
    errors.push('authorization list must not be empty')
    return {
      kind: 'authorization-list',
      wellFormed: false,
      structureOk: false,
      errors,
      ...emptyInspectScalars(),
      details: { authorities, signingDigests },
    }
  }

  try {
    for (const jsonItem of items) {
      const bytesItem = eoaCode7702AuthorizationListJSONItemToBytes(jsonItem)
      wellFormed = true
      try {
        verifyAuthorizationListItem(bytesItem)
        const authority = eoaCode7702RecoverAuthority(bytesItem)
        authorities.push(authority.toString())
        signingDigests.push(
          bytesToHex(
            eoaCode7702AuthorizationHashedMessageToSign([bytesItem[0], bytesItem[1], bytesItem[2]]),
          ),
        )
      } catch (error) {
        pushError(errors, error)
      }
    }
    structureOk = errors.length === 0 && authorities.length === items.length
  } catch (error) {
    pushError(errors, error)
  }

  return {
    kind: 'authorization-list',
    wellFormed,
    structureOk,
    errors,
    itemCount: items.length,
    computedHash: signingDigests[0] ?? '0x',
    details: { authorities, signingDigests },
  }
}
