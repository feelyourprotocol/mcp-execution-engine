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

  it('maps shapella alias to shanghai', () => {
    expect(normalizeForkConfig({ baseHardfork: 'shapella', eips: [] })).toEqual({
      baseHardfork: 'shanghai',
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

  it('describeCapabilities exposes full lineage and eipIntroductions', () => {
    const caps = describeCapabilities()
    expect(caps.engineVersion).toBe('0.1.0')
    expect(caps.baselineForkId).toBe('osaka')
    expect(caps.allowedBaseHardforks).toEqual([
      'berlin',
      'london',
      'paris',
      'shanghai',
      'cancun',
      'prague',
      'osaka',
      'amsterdam',
    ])
    expect(caps.namedForks.map((f) => f.id)).toEqual([
      'berlin',
      'london',
      'paris',
      'shanghai',
      'cancun',
      'prague',
      'osaka',
      'amsterdam',
    ])
    const paris = caps.namedForks.find((fork) => fork.id === 'paris')
    const shanghai = caps.namedForks.find((fork) => fork.id === 'shanghai')
    const osaka = caps.namedForks.find((fork) => fork.id === 'osaka')
    const amsterdam = caps.namedForks.find((fork) => fork.id === 'amsterdam')
    expect(paris?.role).toBe('historical')
    expect(paris?.aliases).toContain('merge')
    expect(caps.namedForks.find((f) => f.id === 'berlin')?.predecessorId).toBeUndefined()
    expect(caps.namedForks.find((f) => f.id === 'london')?.predecessorId).toBe('berlin')
    expect(paris?.predecessorId).toBe('london')
    expect(shanghai?.predecessorId).toBe('paris')
    expect(shanghai?.activatedEips).toContain(3855)
    expect(osaka?.role).toBe('current')
    expect(osaka?.stabilityRollup).toBe('firm')
    expect(osaka?.aliases).toContain('mainnet-el')
    expect(osaka?.relatedEips).toEqual([7883, 7951])
    expect(amsterdam?.role).toBe('preview')
    expect(amsterdam?.relatedEips).toEqual([7708, 7843, 7928, 8024, 8037, 8038])
    expect(amsterdam?.plannedEips).toBeUndefined()
    expect(caps.inspectKinds.some((k) => k.id === 'block-access-list')).toBe(true)
    expect(
      caps.eipIntroductions.some((row) => row.eip === 3855 && row.introducedAt === 'shanghai'),
    ).toBe(true)
    expect(caps.eips).toHaveLength(8)
    expect(caps.eips.some((e) => e.eip === 7928 && e.shapes.includes('generate'))).toBe(true)
    const e8024 = caps.eips.find((e) => e.eip === 8024)
    expect(e8024?.comparison?.baselineForkId).toBe('osaka')
    expect(e8024?.comparison?.previewForkId).toBe('amsterdam')
    const e7883 = caps.eips.find((e) => e.eip === 7883)
    expect(e7883?.comparison?.baselineForkId).toBe('prague')
    expect(e7883?.comparison?.previewForkId).toBe('osaka')
    expect(caps.ceilings.maxTxsPerBlock).toBe(8)
  })

  it('treats named forks as catalog capabilities and derives advertised EIPs', () => {
    const prague = getNamedFork('prague')
    expect(prague?.relatedEips).toEqual([])
    expect(getNamedFork('glamsterdam')?.id).toBe('amsterdam')
    expect(advertisedEipsForFork('prague')).toEqual([])
    expect(advertisedEipsForFork('osaka', ['mainnet-el'])).toEqual(
      getNamedFork('osaka')?.relatedEips,
    )
    expect(advertisedEipsForForkConfig({ baseHardfork: 'amsterdam', eips: [] })).toEqual([
      7708, 7843, 7928, 8024, 8037, 8038,
    ])
    expect(advertisedEipsForForkConfig({ baseHardfork: 'amsterdam', eips: [8024] })).toEqual([8024])
  })
})
