import { createTxFromRLP } from '@ethereumjs/tx'
import { bytesToHex, hexToBytes } from '@ethereumjs/util'

import { resolveFork } from '../../forks/resolve.js'
import type { InspectInput, InspectResult } from '../../types.js'
import { EngineError } from '../../types.js'
import { emptyInspectScalars, normalizeHexArtifact, pushError } from '../shared.js'

export function inspectTypedTransaction(input: InspectInput): InspectResult {
  const errors: string[] = []
  let wellFormed = false
  let structureOk = false

  if (typeof input.artifact !== 'string') {
    return {
      kind: 'typed-transaction',
      wellFormed: false,
      structureOk: false,
      errors: ['artifact must be a signed transaction RLP hex string'],
      ...emptyInspectScalars(),
    }
  }

  let computedHash = '0x'
  const details: Record<string, unknown> = {}

  try {
    const { common } = resolveFork(input.fork ?? { baseHardfork: 'prague' })
    const bytes = hexToBytes(normalizeHexArtifact(input.artifact))
    const tx = createTxFromRLP(bytes, { common })
    wellFormed = true
    structureOk = true
    computedHash = bytesToHex(tx.hash())
    details.type = tx.type
    details.sender = tx.getSenderAddress().toString()
    details.to = tx.to?.toString()
    details.nonce = tx.nonce.toString()
    details.gasLimit = tx.gasLimit.toString()

    if ('gasPrice' in tx && tx.gasPrice !== undefined) {
      details.gasPrice = tx.gasPrice.toString()
    }
    if ('maxFeePerGas' in tx && tx.maxFeePerGas !== undefined) {
      details.maxFeePerGas = tx.maxFeePerGas.toString()
      details.maxPriorityFeePerGas = tx.maxPriorityFeePerGas.toString()
    }
    if ('accessList' in tx && tx.accessList !== undefined) {
      details.accessListLength = tx.accessList.length
    }
    if ('blobVersionedHashes' in tx && tx.blobVersionedHashes !== undefined) {
      details.blobVersionedHashes = tx.blobVersionedHashes.map((h) =>
        typeof h === 'string' ? h : bytesToHex(h),
      )
      details.note =
        'Blob sidecars and KZG proofs are not validated — versioned hashes only (inspect layer A–B).'
    }
    if ('authorizationList' in tx && tx.authorizationList !== undefined) {
      details.authorizationListLength = tx.authorizationList.length
    }

    if (input.expectedHash !== undefined) {
      const expected = normalizeHexArtifact(input.expectedHash)
      if (computedHash.toLowerCase() !== expected.toLowerCase()) {
        structureOk = false
        errors.push(`transaction hash mismatch: computed ${computedHash}, expected ${expected}`)
      }
    }

    try {
      const validSig = tx.verifySignature()
      details.signatureValid = validSig
      if (!validSig) {
        structureOk = false
        errors.push('transaction signature verification failed')
      }
    } catch (error) {
      structureOk = false
      pushError(errors, error)
      details.signatureValid = false
    }
  } catch (error) {
    if (error instanceof EngineError) {
      throw error
    }
    pushError(errors, error)
  }

  const hashMatch =
    input.expectedHash !== undefined ? structureOk && errors.length === 0 && wellFormed : undefined

  return {
    kind: 'typed-transaction',
    wellFormed,
    structureOk,
    hashMatch,
    errors,
    itemCount: 1,
    computedHash,
    details,
  }
}
