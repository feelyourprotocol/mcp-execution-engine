import { describe, expect, it } from 'vitest'

import { buildProvenance } from '../provenance/build.js'

describe('provenance', () => {
  it('includes firm caveat for osaka baseline', () => {
    const provenance = buildProvenance('0.1.0', { baseHardfork: 'osaka', eips: [] })
    expect(provenance.stabilityRollup).toBe('firm')
    expect(provenance.caveat).toMatch(/mainnet EL baseline/)
    expect(provenance.caveat).not.toMatch(/may change before mainnet activation/)
  })

  it('includes engine version and advertised modules for a generic amsterdam run', () => {
    const provenance = buildProvenance('0.1.0', { baseHardfork: 'amsterdam', eips: [] })
    expect(provenance.engineVersion).toBe('0.1.0')
    expect(provenance.forkConfig.baseHardfork).toBe('amsterdam')
    expect(provenance.forkConfig.eips).toEqual([])
    expect(provenance.stabilityRollup).toBe('stabilizing')
    expect(provenance.perEip?.map((entry) => entry.eip)).toEqual([7708, 7843, 8024, 8037, 8038])
    expect(provenance.caveat).toMatch(/advertised modules: 7708, 7843, 8024, 8037, 8038/)
    expect(provenance.caveat).toMatch(/mcp-execution-engine/)
  })

  it('lists osaka advertised modules on a generic baseline run', () => {
    const provenance = buildProvenance('0.1.0', { baseHardfork: 'osaka', eips: [] })
    expect(provenance.perEip?.map((entry) => entry.eip)).toEqual([7883, 7951])
    expect(provenance.caveat).toMatch(/advertised modules: 7883, 7951/)
  })

  it('marks review eips as emerging rollup when eips[] is explicit', () => {
    const provenance = buildProvenance('0.1.0', { baseHardfork: 'amsterdam', eips: [8024] })
    expect(provenance.stabilityRollup).toBe('emerging')
    expect(provenance.perEip?.map((entry) => entry.eip)).toEqual([8024])
    expect(provenance.caveat).toMatch(/with EIP\(s\) 8024/)
    expect(provenance.caveat).not.toMatch(/advertised modules/)
  })
})
