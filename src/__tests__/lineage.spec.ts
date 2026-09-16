import { describe, expect, it } from 'vitest'

import { introductionForKeyword } from '../forks/introductions.js'
import { assertResolvableForkId, predecessorFork, resolveForkAlias } from '../forks/lineage.js'
import { buildCommon, resolveNamedFork } from '../forks/registry.js'
import { buildProvenance } from '../provenance/build.js'
import { simulateBytecode } from '../simulate/simulateBytecode.js'
import { EngineError } from '../types.js'

describe('hardfork lineage', () => {
  it('resolves merge and shapella aliases to canonical ids', () => {
    expect(resolveForkAlias('merge')).toBe('paris')
    expect(resolveForkAlias('the-merge')).toBe('paris')
    expect(resolveForkAlias('shapella')).toBe('shanghai')
    expect(resolveForkAlias('dencun')).toBe('cancun')
    expect(resolveForkAlias('pectra')).toBe('prague')
    expect(resolveForkAlias('fusaka')).toBe('osaka')
  })

  it('rejects blob-parameter-only and difficulty-bomb delay fork ids', () => {
    expect(resolveForkAlias('bpo1')).toBeUndefined()
    expect(resolveForkAlias('arrowGlacier')).toBeUndefined()
    expect(resolveForkAlias('gray-glacier')).toBeUndefined()
    expect(() => assertResolvableForkId('bpo1')).toThrow(EngineError)
    expect(() => buildCommon({ baseHardfork: 'bpo1', eips: [] })).toThrow(/not allowed/)
    expect(() => buildCommon({ baseHardfork: 'arrowGlacier', eips: [] })).toThrow(/not allowed/)
  })

  it('chains predecessor links Berlin through Amsterdam', () => {
    expect(predecessorFork('london')).toBe('berlin')
    expect(predecessorFork('paris')).toBe('london')
    expect(predecessorFork('shanghai')).toBe('paris')
    expect(predecessorFork('osaka')).toBe('prague')
    expect(predecessorFork('amsterdam')).toBe('osaka')
    expect(predecessorFork('berlin')).toBeUndefined()
  })

  it('builds Common for berlin and london historical forks', () => {
    expect(() => buildCommon({ baseHardfork: 'berlin', eips: [] })).not.toThrow()
    expect(() => buildCommon({ baseHardfork: 'london', eips: [] })).not.toThrow()
  })

  it('resolves named historical forks for generic runs', () => {
    expect(resolveNamedFork('merge')).toEqual({ baseHardfork: 'paris', eips: [] })
    expect(resolveNamedFork('shapella')).toEqual({ baseHardfork: 'shanghai', eips: [] })
    expect(() => buildCommon({ baseHardfork: 'paris', eips: [] })).not.toThrow()
  })

  it('PUSH0 succeeds on Shanghai and fails on Paris', async () => {
    const bytecode = '5f00'
    const shanghai = await simulateBytecode({
      bytecode,
      fork: { baseHardfork: 'shanghai', eips: [] },
    })
    expect(shanghai.success).toBe(true)

    const paris = await simulateBytecode({
      bytecode,
      fork: { baseHardfork: 'paris', eips: [] },
    })
    expect(paris.success).toBe(false)
  })

  it('maps PUSH0 keyword to Shanghai introduction', () => {
    const intro = introductionForKeyword('push0')
    expect(intro?.eip).toBe(3855)
    expect(intro?.introducedAt).toBe('shanghai')
    expect(predecessorFork(intro!.introducedAt)).toBe('paris')
  })

  it('provenance on generic Paris run lists predecessor and historical caveat', () => {
    const provenance = buildProvenance('0.1.0', { baseHardfork: 'paris', eips: [] })
    expect(provenance.forkConfig.eips).toEqual([])
    expect(provenance.predecessorForkId).toBe('london')
    expect(provenance.caveat).toMatch(/Merge/i)
    expect(provenance.caveat).toMatch(/Historical fork rules/)
    expect(provenance.perEip).toBeUndefined()
  })

  it('provenance on generic Shanghai run has Paris as predecessor', () => {
    const provenance = buildProvenance('0.1.0', { baseHardfork: 'shanghai', eips: [] })
    expect(provenance.predecessorForkId).toBe('paris')
  })
})
