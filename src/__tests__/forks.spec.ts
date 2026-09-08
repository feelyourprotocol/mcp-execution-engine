import { describe, expect, it } from 'vitest'

import {
  buildCommon,
  describeCapabilities,
  ENGINE_CEILINGS,
  normalizeForkConfig,
  resolveNamedFork,
} from '../forks/registry.js'
import { parseBytecodeHex, parseGasLimit } from '../forks/resolve.js'
import { EngineError } from '../types.js'

describe('fork registry & resolve', () => {
  it('normalizes fork config with sorted eips', () => {
    expect(normalizeForkConfig({ baseHardfork: 'amsterdam', eips: [8024, 1] })).toEqual({
      baseHardfork: 'amsterdam',
      eips: [1, 8024],
    })
  })

  it('maps glamsterdam alias to amsterdam', () => {
    expect(normalizeForkConfig({ baseHardfork: 'glamsterdam', eips: [] })).toEqual({
      baseHardfork: 'amsterdam',
      eips: [],
    })
  })

  it('maps mainnet-el alias to osaka', () => {
    expect(normalizeForkConfig({ baseHardfork: 'mainnet-el', eips: [] })).toEqual({
      baseHardfork: 'osaka',
      eips: [],
    })
  })

  it('resolves named osaka fork and alias', () => {
    expect(resolveNamedFork('osaka')).toEqual({ baseHardfork: 'osaka', eips: [] })
    expect(resolveNamedFork('mainnet-el')).toEqual({ baseHardfork: 'osaka', eips: [] })
  })

  it('resolves named amsterdam fork and alias', () => {
    expect(resolveNamedFork('amsterdam')).toEqual({ baseHardfork: 'amsterdam', eips: [] })
    expect(resolveNamedFork('glamsterdam')).toEqual({ baseHardfork: 'amsterdam', eips: [] })
  })

  it('rejects unregistered eip 99999', () => {
    expect(() => buildCommon({ baseHardfork: 'amsterdam', eips: [99999] })).toThrow(EngineError)
  })

  it('accepts registered eip 7883 in fork config', () => {
    expect(() => buildCommon({ baseHardfork: 'osaka', eips: [7883] })).not.toThrow()
  })

  it('parses bytecode and gas limits', () => {
    expect(parseBytecodeHex('600100')).toHaveLength(3)
    expect(parseGasLimit(undefined)).toBe(ENGINE_CEILINGS.defaultGasLimit)
    expect(parseGasLimit('500000')).toBe(500_000n)
  })

  it('describeCapabilities lists prague, osaka, amsterdam and runnable EIPs', () => {
    const caps = describeCapabilities()
    expect(caps.engineVersion).toBe('0.1.0')
    expect(caps.baselineForkId).toBe('osaka')
    expect(caps.allowedBaseHardforks).toEqual(['prague', 'osaka', 'amsterdam'])
    expect(caps.namedForks.some((fork) => fork.id === 'prague')).toBe(true)
    expect(caps.namedForks.some((fork) => fork.id === 'osaka')).toBe(true)
    expect(caps.namedForks.some((fork) => fork.id === 'amsterdam')).toBe(true)
    const osaka = caps.namedForks.find((fork) => fork.id === 'osaka')
    const amsterdam = caps.namedForks.find((fork) => fork.id === 'amsterdam')
    expect(osaka?.role).toBe('baseline')
    expect(osaka?.stabilityRollup).toBe('firm')
    expect(osaka?.aliases).toContain('mainnet-el')
    expect(amsterdam?.role).toBe('preview')
    expect(amsterdam?.aliases).toContain('glamsterdam')
    expect(caps.eips).toHaveLength(5)
    expect(caps.eips.map((e) => e.eip).sort()).toEqual([7708, 7883, 7951, 8024, 8037])
    expect(caps.eips.every((eip) => eip.runnable)).toBe(true)
    const e8024 = caps.eips.find((e) => e.eip === 8024)
    expect(e8024?.comparison?.baselineForkId).toBe('osaka')
    expect(e8024?.comparison?.previewForkId).toBe('amsterdam')
    expect(e8024?.opcodes?.some((op) => op.name === 'DUPN')).toBe(true)
    const e7883 = caps.eips.find((e) => e.eip === 7883)
    expect(e7883?.changeNature).toBe('repricing')
    expect(e7883?.comparison?.baselineForkId).toBe('prague')
    const e7951 = caps.eips.find((e) => e.eip === 7951)
    expect(e7951?.changeNature).toBe('new-capability')
    const e8037 = caps.eips.find((e) => e.eip === 8037)
    expect(e8037?.changeNature).toBe('new-exec-model')
    expect(e8037?.comparison?.previewForkId).toBe('amsterdam')
  })
})
