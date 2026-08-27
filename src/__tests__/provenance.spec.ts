import { describe, expect, it } from 'vitest'

import { buildProvenance } from '../provenance/build.js'

describe('provenance', () => {
  it('includes engine version and caveat for amsterdam', () => {
    const provenance = buildProvenance('0.1.0', { baseHardfork: 'amsterdam', eips: [] })
    expect(provenance.engineVersion).toBe('0.1.0')
    expect(provenance.forkConfig.baseHardfork).toBe('amsterdam')
    expect(provenance.stabilityRollup).toBeDefined()
    expect(provenance.caveat).toMatch(/mcp-execution-engine/)
  })

  it('marks review eips as emerging rollup', () => {
    const provenance = buildProvenance('0.1.0', { baseHardfork: 'amsterdam', eips: [8024] })
    expect(provenance.stabilityRollup).toBe('emerging')
    expect(provenance.perEip?.[0]?.eip).toBe(8024)
  })
})
