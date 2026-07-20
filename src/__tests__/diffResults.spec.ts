import { describe, expect, it } from 'vitest'

import { compareVariants } from '../diff/diffResults.js'
import { dupnDemoBytecodeHex, PUSH1_STOP_HEX } from './fixtures/eip8024.js'

describe('compareVariants', () => {
  it('diffs gas and success across fork variants', async () => {
    const result = await compareVariants({
      variants: [
        {
          label: 'base',
          fork: { baseHardfork: 'amsterdam', eips: [] },
          bytecode: PUSH1_STOP_HEX,
        },
        {
          label: 'dupn',
          fork: { baseHardfork: 'amsterdam', eips: [8024] },
          bytecode: dupnDemoBytecodeHex(),
        },
      ],
    })

    expect(result.variants).toHaveLength(2)
    expect(result.diffs.some((entry) => entry.dimension === 'gasUsed')).toBe(true)
    expect(result.provenance.caveat).toBeTruthy()
  })
})
