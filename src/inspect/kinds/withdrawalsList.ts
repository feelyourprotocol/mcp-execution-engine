import { genWithdrawalsTrieRoot } from '@ethereumjs/block'
import { bytesToHex, createWithdrawal, type JSONRPCWithdrawal } from '@ethereumjs/util'

import type { InspectInput, InspectResult } from '../../types/index.js'
import { emptyInspectScalars, parseExpectedHash32, pushError } from '../shared.js'

function isWithdrawalJson(value: unknown): value is JSONRPCWithdrawal {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const record = value as Record<string, unknown>
  return (
    typeof record.index === 'string' &&
    typeof record.validatorIndex === 'string' &&
    typeof record.address === 'string' &&
    typeof record.amount === 'string'
  )
}

export async function inspectWithdrawalsList(input: InspectInput): Promise<InspectResult> {
  const errors: string[] = []
  let wellFormed = false
  let structureOk = false
  let hashMatch: boolean | undefined
  let computedHash = '0x'

  if (!Array.isArray(input.artifact)) {
    return {
      kind: 'withdrawals',
      wellFormed: false,
      structureOk: false,
      errors: ['artifact must be a JSON array of EIP-4895 withdrawals'],
      ...emptyInspectScalars(),
    }
  }

  const withdrawals = []
  try {
    for (const [index, entry] of input.artifact.entries()) {
      if (!isWithdrawalJson(entry)) {
        errors.push(`withdrawals[${index}]: invalid withdrawal object`)
        continue
      }
      withdrawals.push(
        createWithdrawal({
          index: entry.index,
          validatorIndex: entry.validatorIndex,
          address: entry.address,
          amount: entry.amount,
        }),
      )
    }
    wellFormed = withdrawals.length === input.artifact.length && errors.length === 0
    structureOk = wellFormed

    if (wellFormed) {
      const root = await genWithdrawalsTrieRoot(withdrawals)
      computedHash = bytesToHex(root)
      if (input.expectedHash !== undefined) {
        const expected = parseExpectedHash32(input.expectedHash)
        if (root.length !== expected.length || !root.every((b, i) => b === expected[i])) {
          hashMatch = false
          errors.push('withdrawalsRoot mismatch')
        } else {
          hashMatch = true
        }
      }
    }
  } catch (error) {
    pushError(errors, error)
  }

  return {
    kind: 'withdrawals',
    wellFormed,
    structureOk,
    hashMatch,
    errors,
    itemCount: input.artifact.length,
    computedHash,
    details: { withdrawalsRoot: computedHash },
  }
}
