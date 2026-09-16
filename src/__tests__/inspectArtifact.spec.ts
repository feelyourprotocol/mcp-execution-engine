import { describe, expect, it } from 'vitest'

import { generateArtifact } from '../generate/generateArtifact.js'
import { inspectArtifact } from '../inspect/inspectArtifact.js'
import { BAL_RECIPIENT, BAL_SENDER, BAL_SENDER_PREFUND } from './fixtures/eip7928.js'

describe('inspectArtifact', () => {
  it('flags malformed artifact', async () => {
    const result = await inspectArtifact({ artifact: { not: 'an array' } })
    expect(result.wellFormed).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('reports hash mismatch', async () => {
    const generated = await generateArtifact({
      fork: { baseHardfork: 'amsterdam' },
      transactions: [{ from: BAL_SENDER, to: BAL_RECIPIENT, value: '1' }],
      accounts: [BAL_SENDER_PREFUND],
    })

    const result = await inspectArtifact({
      artifact: generated.bal,
      expectedHash: '0x' + '11'.repeat(32),
    })
    expect(result.wellFormed).toBe(true)
    expect(result.structureOk).toBe(true)
    expect(result.hashMatch).toBe(false)
  })
})
