import { describe, expect, it } from 'vitest'

import { buildProvenance } from '../provenance/build.js'

describe('provenance', () => {
  it('includes firm caveat for osaka baseline', () => {
    const provenance = buildProvenance('0.1.0', { baseHardfork: 'fusaka', eips: [] })
    expect(provenance.stabilityRollup).toBe('firm')
    expect(provenance.caveat).toMatch(/mainnet EL baseline/)
    expect(provenance.caveat).not.toMatch(/may change before mainnet activation/)
  })

  it('includes engine version and advertised modules for a generic amsterdam run', () => {
    const provenance = buildProvenance('0.1.0', { baseHardfork: 'glamsterdam', eips: [] })
    expect(provenance.engineVersion).toBe('0.1.0')
    expect(provenance.forkConfig.baseHardfork).toBe('glamsterdam')
    expect(provenance.forkConfig.eips).toEqual([])
    expect(provenance.stabilityRollup).toBe('stabilizing')
    expect(provenance.perEip?.map((entry) => entry.eip)).toEqual([
      7708, 7843, 7928, 7954, 8024, 8037, 8038,
    ])
    expect(provenance.perEip?.[0]?.specUrl).toMatch(
      /^https:\/\/github\.com\/ethereum\/EIPs\/blob\/[0-9a-f]{40}\/EIPS\/eip-7708\.md$/,
    )
    expect(provenance.perEip?.[0]?.specDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(provenance.perEip?.[0]?.testReleaseUrl).toContain('tests-glamsterdam-devnet@v8.1.0')
    expect(provenance.perEip?.[0]?.testReleaseName).toBe('tests-glamsterdam-devnet@v8.1.0')
    expect(provenance.caveat).toMatch(
      /advertised modules: 7708, 7843, 7928, 7954, 8024, 8037, 8038/,
    )
    expect(provenance.caveat).not.toMatch(/Spec:/)
    expect(provenance.caveat).toMatch(/mcp-execution-engine/)
  })

  it('lists osaka advertised modules on a generic baseline run', () => {
    const provenance = buildProvenance('0.1.0', { baseHardfork: 'fusaka', eips: [] })
    expect(provenance.perEip?.map((entry) => entry.eip)).toEqual([7883, 7951])
    expect(provenance.caveat).toMatch(/advertised modules: 7883, 7951/)
    expect(provenance.caveat).not.toMatch(/Spec:/)
    expect(provenance.caveat).not.toMatch(/live EIP page/)
  })

  it('marks review eips as emerging rollup when eips[] is explicit', () => {
    const provenance = buildProvenance('0.1.0', { baseHardfork: 'glamsterdam', eips: [8024] })
    expect(provenance.stabilityRollup).toBe('emerging')
    expect(provenance.perEip?.map((entry) => entry.eip)).toEqual([8024])
    expect(provenance.caveat).toMatch(/with EIP\(s\) 8024/)
    expect(provenance.caveat).toMatch(
      /Spec: EIP-8024 Review, 2026-06-10, tests-glamsterdam-devnet@v8\.1\.0/,
    )
    expect(provenance.caveat).not.toMatch(/advertised modules/)
  })

  it('notes a live EIP page on an unpinned named module', () => {
    const provenance = buildProvenance('0.1.0', { baseHardfork: 'fusaka', eips: [7883] })
    expect(provenance.perEip?.map((entry) => entry.eip)).toEqual([7883])
    expect(provenance.caveat).toMatch(/Spec: EIP-7883 Final, live EIP page/)
    expect(provenance.caveat).not.toMatch(/tests-glamsterdam-devnet/)
  })
})
