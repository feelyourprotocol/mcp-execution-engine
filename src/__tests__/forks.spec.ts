import { describe, expect, it } from 'vitest'

import {
  advertisedEipsForFork,
  advertisedEipsForForkConfig,
  buildCommon,
  describeCapabilities,
  ENGINE_CEILINGS,
  getNamedFork,
  normalizeForkConfig,
  resolveNamedFork,
} from '../forks/registry.js'
import {
  parseBytecodeHex,
  parseBytes32,
  parseGasLimit,
  parseUint64Field,
} from '../forks/resolve.js'
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

  it('parses uint64 header fields and rejects junk', () => {
    expect(parseUint64Field(undefined, 'slotNumber')).toBeUndefined()
    expect(parseUint64Field('42', 'slotNumber')).toBe(42n)
    expect(() => parseUint64Field('4.2', 'slotNumber')).toThrow(/whole number/)
    expect(() => parseUint64Field('-1', 'slotNumber')).toThrow(/whole number/)
  })

  it('parses 32-byte storage words and rejects oversized keys', () => {
    expect(parseBytes32('0x03', 'storage.slot')).toHaveLength(32)
    expect(() => parseBytes32(`0x${'aa'.repeat(33)}`, 'storage.slot')).toThrow(/32 bytes/)
    expect(() => parseBytes32('xyz', 'storage.slot')).toThrow(/hex/)
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
    expect(osaka?.summary).toMatch(/current mainnet EL/i)
    expect(osaka?.keywords).toContain('osaka')
    expect(osaka?.shapes).toEqual(['simulate', 'transaction', 'block'])
    expect(osaka?.relatedEips).toEqual([7883, 7951])
    expect(amsterdam?.role).toBe('preview')
    expect(amsterdam?.aliases).toContain('glamsterdam')
    expect(amsterdam?.summary).toMatch(/You do not need to name an EIP/i)
    expect(amsterdam?.keywords).toEqual(
      expect.arrayContaining(['amsterdam', 'glamsterdam', 'preview fork']),
    )
    expect(amsterdam?.shapes).toEqual(['simulate', 'transaction', 'block'])
    expect(amsterdam?.relatedEips).toEqual([7708, 7843, 8024, 8037, 8038])
    expect(amsterdam?.plannedEips).toEqual([7928])
    expect(amsterdam?.comparison?.baselineForkId).toBe('osaka')
    expect(caps.eips).toHaveLength(7)
    expect(caps.eips.map((e) => e.eip).sort()).toEqual([7708, 7843, 7883, 7951, 8024, 8037, 8038])
    expect(caps.eips.every((eip) => eip.runnable)).toBe(true)
    expect(caps.ceilings.maxTxsPerBlock).toBe(8)
    const e8024 = caps.eips.find((e) => e.eip === 8024)
    expect(e8024?.comparison?.baselineForkId).toBe('osaka')
    expect(e8024?.comparison?.previewForkId).toBe('amsterdam')
    expect(e8024?.opcodes?.some((op) => op.name === 'DUPN')).toBe(true)
    const e7883 = caps.eips.find((e) => e.eip === 7883)
    expect(e7883?.changeNature).toBe('repricing')
    expect(e7883?.comparison?.baselineForkId).toBe('prague')
    const e7951 = caps.eips.find((e) => e.eip === 7951)
    expect(e7951?.changeNature).toBe('new-capability')
    const e7843 = caps.eips.find((e) => e.eip === 7843)
    expect(e7843?.changeNature).toBe('new-capability')
    expect(e7843?.shapes).toEqual(['block'])
    expect(e7843?.opcodes?.some((op) => op.name === 'SLOTNUM')).toBe(true)
    const e8037 = caps.eips.find((e) => e.eip === 8037)
    expect(e8037?.changeNature).toBe('new-exec-model')
    expect(e8037?.comparison?.previewForkId).toBe('amsterdam')
    const e8038 = caps.eips.find((e) => e.eip === 8038)
    expect(e8038?.changeNature).toBe('repricing')
    expect(e8038?.shapes).toEqual(['simulate', 'transaction'])
    expect(e8038?.comparison?.baselineForkId).toBe('osaka')
  })

  it('treats named forks as catalog capabilities and derives advertised EIPs', () => {
    const prague = getNamedFork('prague')
    expect(prague?.relatedEips).toEqual([7883])
    expect(getNamedFork('glamsterdam')?.id).toBe('amsterdam')
    expect(advertisedEipsForFork('prague')).toEqual(getNamedFork('prague')?.relatedEips)
    expect(advertisedEipsForFork('osaka', ['mainnet-el'])).toEqual(
      getNamedFork('osaka')?.relatedEips,
    )
    expect(advertisedEipsForFork('amsterdam', ['glamsterdam'])).toEqual([
      7708, 7843, 8024, 8037, 8038,
    ])
    expect(advertisedEipsForForkConfig({ baseHardfork: 'amsterdam', eips: [] })).toEqual([
      7708, 7843, 8024, 8037, 8038,
    ])
    expect(advertisedEipsForForkConfig({ baseHardfork: 'amsterdam', eips: [8024] })).toEqual([8024])
  })
})
