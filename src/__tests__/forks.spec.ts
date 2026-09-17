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
    expect(normalizeForkConfig({ baseHardfork: 'glamsterdam', eips: [8024, 1] })).toEqual({
      baseHardfork: 'glamsterdam',
      eips: [1, 8024],
    })
  })

  it('maps amsterdam EL alias to glamsterdam', () => {
    expect(normalizeForkConfig({ baseHardfork: 'amsterdam', eips: [] })).toEqual({
      baseHardfork: 'glamsterdam',
      eips: [],
    })
  })

  it('maps mainnet-el alias to fusaka', () => {
    expect(normalizeForkConfig({ baseHardfork: 'mainnet-el', eips: [] })).toEqual({
      baseHardfork: 'fusaka',
      eips: [],
    })
  })

  it('maps shanghai EL alias to shapella', () => {
    expect(normalizeForkConfig({ baseHardfork: 'shanghai', eips: [] })).toEqual({
      baseHardfork: 'shapella',
      eips: [],
    })
  })

  it('resolves named fusaka fork and aliases', () => {
    expect(resolveNamedFork('fusaka')).toEqual({ baseHardfork: 'fusaka', eips: [] })
    expect(resolveNamedFork('osaka')).toEqual({ baseHardfork: 'fusaka', eips: [] })
    expect(resolveNamedFork('mainnet-el')).toEqual({ baseHardfork: 'fusaka', eips: [] })
  })

  it('resolves named glamsterdam fork and EL alias', () => {
    expect(resolveNamedFork('glamsterdam')).toEqual({ baseHardfork: 'glamsterdam', eips: [] })
    expect(resolveNamedFork('amsterdam')).toEqual({ baseHardfork: 'glamsterdam', eips: [] })
  })

  it('rejects unregistered eip 99999', () => {
    expect(() => buildCommon({ baseHardfork: 'glamsterdam', eips: [99999] })).toThrow(EngineError)
  })

  it('accepts registered eip 7883 in fork config', () => {
    expect(() => buildCommon({ baseHardfork: 'fusaka', eips: [7883] })).not.toThrow()
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

  it('describeCapabilities exposes full lineage and eipIntroductions', () => {
    const caps = describeCapabilities()
    expect(caps.engineVersion).toBe('0.1.0')
    expect(caps.baselineForkId).toBe('fusaka')
    expect(caps.allowedBaseHardforks).toEqual([
      'berlin',
      'london',
      'paris',
      'shapella',
      'dencun',
      'pectra',
      'fusaka',
      'glamsterdam',
    ])
    expect(caps.namedForks.map((f) => f.id)).toEqual([
      'berlin',
      'london',
      'paris',
      'shapella',
      'dencun',
      'pectra',
      'fusaka',
      'glamsterdam',
    ])
    const paris = caps.namedForks.find((fork) => fork.id === 'paris')
    const shapella = caps.namedForks.find((fork) => fork.id === 'shapella')
    const fusaka = caps.namedForks.find((fork) => fork.id === 'fusaka')
    const glamsterdam = caps.namedForks.find((fork) => fork.id === 'glamsterdam')
    expect(paris?.role).toBe('historical')
    expect(paris?.aliases).toContain('merge')
    expect(caps.namedForks.find((f) => f.id === 'berlin')?.predecessorId).toBeUndefined()
    expect(caps.namedForks.find((f) => f.id === 'london')?.predecessorId).toBe('berlin')
    expect(paris?.predecessorId).toBe('london')
    expect(shapella?.predecessorId).toBe('paris')
    expect(shapella?.activatedEips).toContain(3855)
    expect(shapella?.aliases).toContain('shanghai')
    expect(fusaka?.role).toBe('current')
    expect(fusaka?.stabilityRollup).toBe('firm')
    expect(fusaka?.aliases).toContain('mainnet-el')
    expect(fusaka?.aliases).toContain('osaka')
    expect(fusaka?.relatedEips).toEqual([7883, 7951])
    expect(glamsterdam?.role).toBe('preview')
    expect(glamsterdam?.relatedEips).toEqual([7708, 7843, 7928, 8024, 8037, 8038])
    expect(glamsterdam?.plannedEips).toBeUndefined()
    expect(glamsterdam?.aliases).toContain('amsterdam')
    expect(caps.inspectKinds.some((k) => k.id === 'block-access-list')).toBe(true)
    expect(caps.inspectKinds.some((k) => k.id === 'authorization-list')).toBe(true)
    expect(caps.inspectKinds.some((k) => k.id === 'typed-transaction')).toBe(true)
    expect(caps.inspectKinds).toHaveLength(5)
    expect(
      caps.eipIntroductions.some((row) => row.eip === 3855 && row.introducedAt === 'shapella'),
    ).toBe(true)
    expect(caps.eips).toHaveLength(9)
    expect(caps.eips.some((e) => e.eip === 7702 && e.shapes.includes('transaction'))).toBe(true)
    expect(caps.eips.some((e) => e.eip === 7928 && e.shapes.includes('generate'))).toBe(true)
    const e8024 = caps.eips.find((e) => e.eip === 8024)
    expect(e8024?.comparison?.baselineForkId).toBe('fusaka')
    expect(e8024?.comparison?.previewForkId).toBe('glamsterdam')
    const e7883 = caps.eips.find((e) => e.eip === 7883)
    expect(e7883?.comparison?.baselineForkId).toBe('pectra')
    expect(e7883?.comparison?.previewForkId).toBe('fusaka')
    expect(caps.ceilings.maxTxsPerBlock).toBe(8)
  })

  it('treats named forks as catalog capabilities and derives advertised EIPs', () => {
    const pectra = getNamedFork('pectra')
    expect(pectra?.relatedEips).toEqual([7702])
    expect(getNamedFork('amsterdam')?.id).toBe('glamsterdam')
    expect(advertisedEipsForFork('pectra')).toEqual([7702])
    expect(advertisedEipsForFork('fusaka', ['osaka', 'mainnet-el'])).toEqual(
      getNamedFork('fusaka')?.relatedEips,
    )
    expect(advertisedEipsForForkConfig({ baseHardfork: 'glamsterdam', eips: [] })).toEqual([
      7708, 7843, 7928, 8024, 8037, 8038,
    ])
    expect(advertisedEipsForForkConfig({ baseHardfork: 'glamsterdam', eips: [8024] })).toEqual([
      8024,
    ])
  })
})
