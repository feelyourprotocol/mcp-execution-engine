import { describe, expect, it } from 'vitest'

import { generateArtifact } from '../generate/generateArtifact.js'
import { inspectArtifact } from '../inspect/inspectArtifact.js'
import { EngineError } from '../types.js'
import {
  BAL_CONTRACT,
  BAL_RECIPIENT,
  BAL_SENDER,
  BAL_SENDER_PREFUND,
  SSTORE_42_BYTECODE,
  SSTORE_REVERT_BYTECODE,
} from './fixtures/eip7928.js'

describe('generateArtifact', () => {
  it('rejects Osaka (EIP-7928 not active)', async () => {
    await expect(
      generateArtifact({
        fork: { baseHardfork: 'osaka' },
        transactions: [{ from: BAL_SENDER, to: BAL_RECIPIENT, value: '1' }],
        accounts: [BAL_SENDER_PREFUND],
      }),
    ).rejects.toBeInstanceOf(EngineError)
  })

  it('plain transfer includes balance and nonce changes', async () => {
    const result = await generateArtifact({
      fork: { baseHardfork: 'amsterdam' },
      transactions: [{ from: BAL_SENDER, to: BAL_RECIPIENT, value: '1' }],
      accounts: [BAL_SENDER_PREFUND],
    })

    expect(result.success).toBe(true)
    expect(result.artifactKind).toBe('block-access-list')
    expect(result.hash).toMatch(/^0x[0-9a-f]+$/i)
    expect(result.itemCount).toBeGreaterThan(0)

    const bal = result.bal as {
      address: string
      balanceChanges: unknown[]
      nonceChanges: unknown[]
    }[]
    expect(bal.some((a) => a.balanceChanges.length > 0)).toBe(true)
    expect(bal.some((a) => a.nonceChanges.length > 0)).toBe(true)

    const inspected = await inspectArtifact({ artifact: result.bal, expectedHash: result.hash })
    expect(inspected.wellFormed).toBe(true)
    expect(inspected.structureOk).toBe(true)
    expect(inspected.hashMatch).toBe(true)
  })

  it('records storageChanges on SSTORE', async () => {
    const result = await generateArtifact({
      fork: { baseHardfork: 'amsterdam' },
      transactions: [
        {
          from: BAL_SENDER,
          to: BAL_CONTRACT,
          code: SSTORE_42_BYTECODE,
          gasLimit: '200000',
        },
      ],
      accounts: [BAL_SENDER_PREFUND],
    })

    expect(result.success).toBe(true)
    const contract = (result.bal as { address: string; storageChanges: unknown[] }[]).find(
      (a) => a.address.toLowerCase() === BAL_CONTRACT.toLowerCase(),
    )
    expect(contract?.storageChanges.length).toBeGreaterThan(0)
  })

  it('records storageReads but not storageChanges when SSTORE reverts', async () => {
    const result = await generateArtifact({
      fork: { baseHardfork: 'amsterdam' },
      transactions: [
        {
          from: BAL_SENDER,
          to: BAL_CONTRACT,
          code: SSTORE_REVERT_BYTECODE,
          gasLimit: '200000',
        },
      ],
      accounts: [BAL_SENDER_PREFUND],
    })

    expect(result.success).toBe(true)
    const contract = (
      result.bal as { address: string; storageReads: unknown[]; storageChanges: unknown[] }[]
    ).find((a) => a.address.toLowerCase() === BAL_CONTRACT.toLowerCase())
    expect(contract?.storageReads.length).toBeGreaterThan(0)
    expect(contract?.storageChanges.length).toBe(0)
  })

  it('tags blockAccessIndex across two transactions', async () => {
    const result = await generateArtifact({
      fork: { baseHardfork: 'amsterdam' },
      transactions: [
        { from: BAL_SENDER, to: BAL_RECIPIENT, value: '1' },
        { from: BAL_SENDER, to: BAL_RECIPIENT, value: '2' },
      ],
      accounts: [BAL_SENDER_PREFUND],
    })

    expect(result.success).toBe(true)
    const sender = (
      result.bal as {
        address: string
        balanceChanges: { blockAccessIndex: string }[]
        nonceChanges: { blockAccessIndex: string }[]
      }[]
    ).find((a) => a.address.toLowerCase() === BAL_SENDER.toLowerCase())
    expect(sender?.balanceChanges.map((c) => c.blockAccessIndex)).toEqual(['0x01', '0x02'])
    expect(sender?.nonceChanges.map((c) => c.blockAccessIndex)).toEqual(['0x01', '0x02'])
  })

  it('installs contract bytecode via tx code field', async () => {
    const result = await generateArtifact({
      fork: { baseHardfork: 'amsterdam' },
      transactions: [
        {
          from: BAL_SENDER,
          to: BAL_CONTRACT,
          code: SSTORE_42_BYTECODE,
          gasLimit: '200000',
        },
      ],
      accounts: [BAL_SENDER_PREFUND],
    })

    expect(result.success).toBe(true)
    const contract = (result.bal as { address: string; storageChanges: unknown[] }[]).find(
      (a) => a.address.toLowerCase() === BAL_CONTRACT.toLowerCase(),
    )
    expect(contract?.storageChanges.length).toBeGreaterThan(0)
  })
})
