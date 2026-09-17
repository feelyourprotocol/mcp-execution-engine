import { describe, expect, it } from 'vitest'
import { genRequestsRoot } from '@ethereumjs/block'
import { createLegacyTx } from '@ethereumjs/tx'
import {
  bytesToHex,
  concatBytes,
  createCLRequest,
  eoaCode7702AuthorizationListBytesItemToJSON,
  eoaCode7702SignAuthorization,
  hexToBytes,
} from '@ethereumjs/util'
import { sha256 } from '@noble/hashes/sha2.js'

import { buildCommon } from '../forks/registry.js'
import { generateArtifact } from '../generate/generateArtifact.js'
import { inspectArtifact } from '../inspect/inspectArtifact.js'
import { BAL_RECIPIENT, BAL_SENDER, BAL_SENDER_PREFUND } from './fixtures/eip7928.js'

const AUTH_KEY = hexToBytes(`0x${'aa'.repeat(32)}`)

describe('inspectArtifact kinds', () => {
  it('authorization-list recovers authority from a signed tuple', async () => {
    const signed = eoaCode7702SignAuthorization(
      {
        chainId: '0x01',
        address: '0x00000000000000000000000000000000000000b1',
        nonce: '0x00',
      },
      AUTH_KEY,
    )
    const json = eoaCode7702AuthorizationListBytesItemToJSON(signed)

    const result = await inspectArtifact({ kind: 'authorization-list', artifact: json })
    expect(result.wellFormed).toBe(true)
    expect(result.structureOk).toBe(true)
    expect((result.details?.authorities as string[]).length).toBe(1)
    expect((result.details?.signingDigests as string[])[0]).toMatch(/^0x[0-9a-f]+$/i)
  })

  it('typed-transaction decodes legacy RLP', async () => {
    const common = buildCommon({ baseHardfork: 'pectra', eips: [] })
    const signed = createLegacyTx(
      {
        nonce: 0n,
        gasPrice: 10n,
        gasLimit: 21_000n,
        to: '0x00000000000000000000000000000000000000ab',
        value: 1n,
      },
      { common },
    ).sign(AUTH_KEY)
    const rlp = bytesToHex(signed.serialize())

    const result = await inspectArtifact({ kind: 'typed-transaction', artifact: rlp })
    expect(result.wellFormed).toBe(true)
    expect(result.structureOk).toBe(true)
    expect(result.computedHash).toBe(bytesToHex(signed.hash()))
    expect(result.details?.type).toBe(0)
  })

  it('withdrawals recomputes withdrawalsRoot', async () => {
    const list = [
      {
        index: '0x0',
        validatorIndex: '0x1',
        address: '0x00000000000000000000000000000000000000ab',
        amount: '0x1',
      },
    ]
    const result = await inspectArtifact({ kind: 'withdrawals', artifact: list })
    expect(result.wellFormed).toBe(true)
    expect(result.structureOk).toBe(true)
    expect(result.computedHash).toMatch(/^0x[0-9a-f]{64}$/i)
  })

  it('execution-requests computes requestsHash for sorted envelopes', async () => {
    const requests = [
      { type: '0x00', data: '0x01' },
      { type: '0x01', data: '0x02' },
    ]
    const result = await inspectArtifact({ kind: 'execution-requests', artifact: requests })
    expect(result.wellFormed).toBe(true)
    expect(result.structureOk).toBe(true)

    const expected = genRequestsRoot(
      [
        createCLRequest(concatBytes(new Uint8Array([0]), hexToBytes('0x01'))),
        createCLRequest(concatBytes(new Uint8Array([1]), hexToBytes('0x02'))),
      ],
      sha256,
    )
    expect(result.computedHash).toBe(bytesToHex(expected))
  })

  it('block-access-list still works via default kind', async () => {
    const generated = await generateArtifact({
      fork: { baseHardfork: 'glamsterdam' },
      transactions: [{ from: BAL_SENDER, to: BAL_RECIPIENT, value: '1' }],
      accounts: [BAL_SENDER_PREFUND],
    })
    const result = await inspectArtifact({ artifact: generated.bal, expectedHash: generated.hash })
    expect(result.kind).toBe('block-access-list')
    expect(result.hashMatch).toBe(true)
  })
})
