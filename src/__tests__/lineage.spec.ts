import { describe, expect, it } from 'vitest'

import { introductionForKeyword } from '../forks/introductions.js'
import { assertResolvableForkId, predecessorFork, resolveForkAlias } from '../forks/lineage.js'
import { buildCommon, resolveNamedFork } from '../forks/registry.js'
import { buildProvenance } from '../provenance/build.js'
import { simulateBytecode } from '../simulate/simulateBytecode.js'
import { EngineError } from '../types/index.js'

describe('hardfork lineage', () => {
  it('resolves merge and shapella aliases to canonical ids', () => {
    expect(resolveForkAlias('merge')).toBe('paris')
    expect(resolveForkAlias('the-merge')).toBe('paris')
    expect(resolveForkAlias('shapella')).toBe('shapella')
    expect(resolveForkAlias('shanghai')).toBe('shapella')
    expect(resolveForkAlias('dencun')).toBe('dencun')
    expect(resolveForkAlias('cancun')).toBe('dencun')
    expect(resolveForkAlias('pectra')).toBe('pectra')
    expect(resolveForkAlias('prague')).toBe('pectra')
    expect(resolveForkAlias('fusaka')).toBe('fusaka')
    expect(resolveForkAlias('osaka')).toBe('fusaka')
    expect(resolveForkAlias('amsterdam')).toBe('glamsterdam')
  })

  it('rejects blob-parameter-only and difficulty-bomb delay fork ids', () => {
    expect(resolveForkAlias('bpo1')).toBeUndefined()
    expect(resolveForkAlias('arrowGlacier')).toBeUndefined()
    expect(resolveForkAlias('gray-glacier')).toBeUndefined()
    expect(() => assertResolvableForkId('bpo1')).toThrow(EngineError)
    expect(() => buildCommon({ baseHardfork: 'bpo1', eips: [] })).toThrow(/not allowed/)
    expect(() => buildCommon({ baseHardfork: 'arrowGlacier', eips: [] })).toThrow(/not allowed/)
  })

  it('chains predecessor links Berlin through Glamsterdam', () => {
    expect(predecessorFork('london')).toBe('berlin')
    expect(predecessorFork('paris')).toBe('london')
    expect(predecessorFork('shapella')).toBe('paris')
    expect(predecessorFork('shanghai')).toBe('paris')
    expect(predecessorFork('fusaka')).toBe('pectra')
    expect(predecessorFork('osaka')).toBe('pectra')
    expect(predecessorFork('glamsterdam')).toBe('fusaka')
    expect(predecessorFork('amsterdam')).toBe('fusaka')
    expect(predecessorFork('berlin')).toBeUndefined()
  })

  it('builds Common for berlin and london historical forks', () => {
    expect(() => buildCommon({ baseHardfork: 'berlin', eips: [] })).not.toThrow()
    expect(() => buildCommon({ baseHardfork: 'london', eips: [] })).not.toThrow()
  })

  it('resolves named historical forks for generic runs', () => {
    expect(resolveNamedFork('merge')).toEqual({ baseHardfork: 'paris', eips: [] })
    expect(resolveNamedFork('shapella')).toEqual({ baseHardfork: 'shapella', eips: [] })
    expect(() => buildCommon({ baseHardfork: 'paris', eips: [] })).not.toThrow()
  })

  it('PUSH0 succeeds on Shapella and fails on Paris', async () => {
    const bytecode = '5f00'
    const shanghai = await simulateBytecode({
      bytecode,
      fork: { baseHardfork: 'shapella', eips: [] },
    })
    expect(shanghai.success).toBe(true)

    const paris = await simulateBytecode({
      bytecode,
      fork: { baseHardfork: 'paris', eips: [] },
    })
    expect(paris.success).toBe(false)
  })

  it('maps PUSH0 keyword to Shapella introduction', () => {
    const intro = introductionForKeyword('push0')
    expect(intro?.eip).toBe(3855)
    expect(intro?.introducedAt).toBe('shapella')
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

  it('provenance on generic Shapella run has Paris as predecessor', () => {
    const provenance = buildProvenance('0.1.0', { baseHardfork: 'shapella', eips: [] })
    expect(provenance.predecessorForkId).toBe('paris')
  })
})
