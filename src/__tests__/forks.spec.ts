import { describe, expect, it } from 'vitest'

import { EIP_INTRODUCTIONS, introductionForEip } from '../forks/introductions.js'
import { FORK_LINEAGE } from '../forks/lineage.js'
import {
  absorbBundledSupportedEips,
  advertisedEipsForFork,
  advertisedEipsForForkConfig,
  buildCommon,
  describeCapabilities,
  ENGINE_CEILINGS,
  getNamedFork,
  normalizeForkConfig,
  resolveNamedFork,
} from '../forks/registry.js'
import { resolveFork } from '../forks/resolve.js'
import {
  parseBytecodeHex,
  parseBytes32,
  parseGasLimit,
  parseUint64Field,
} from '../forks/resolve.js'
import { EIP_MODULES } from '../modules/index.js'
import { buildProvenance } from '../provenance/build.js'
import { EngineError } from '../types/index.js'

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

  it('omits bundled supported eip 8246 on glamsterdam', () => {
    const prepared = absorbBundledSupportedEips({ baseHardfork: 'glamsterdam', eips: [8246, 8024] })
    expect(prepared.absorbedEips).toEqual([8246])
    expect(prepared.config.eips).toEqual([8024])
    expect(() => buildCommon({ baseHardfork: 'glamsterdam', eips: [8246] })).not.toThrow()
    const resolved = resolveFork({ baseHardfork: 'amsterdam', eips: [8246] })
    expect(resolved.config).toEqual({ baseHardfork: 'glamsterdam', eips: [] })
    expect(resolved.absorbedEips).toEqual([8246])
    const accessList = absorbBundledSupportedEips({ baseHardfork: 'glamsterdam', eips: [7981] })
    expect(accessList.absorbedEips).toEqual([7981])
    expect(buildProvenance('0.1.0', resolved.config, resolved.absorbedEips).caveat).toMatch(
      /Bundled EIP\(s\) 8246 omitted from eips/,
    )
  })

  it('rejects supported eip 8246 on a fork that does not activate it', () => {
    expect(() => buildCommon({ baseHardfork: 'fusaka', eips: [8246] })).toThrow(
      /bundled in glamsterdam/,
    )
  })

  it('rejects a consensus eip instead of running it', () => {
    expect(() => buildCommon({ baseHardfork: 'glamsterdam', eips: [7732] })).toThrow(
      /consensus-layer/,
    )
    expect(() => buildCommon({ baseHardfork: 'fusaka', eips: [7594] })).toThrow(/consensus-layer/)
  })

  it('rejects networking and informational eips instead of running them', () => {
    expect(() => buildCommon({ baseHardfork: 'glamsterdam', eips: [7975] })).toThrow(
      /networking change/,
    )
    expect(() => buildCommon({ baseHardfork: 'glamsterdam', eips: [7904] })).toThrow(
      /informational EIP/,
    )
  })

  it('rejects unshown eips instead of treating a fork run as the effect', () => {
    expect(() => buildCommon({ baseHardfork: 'glamsterdam', eips: [7997] })).toThrow(
      /unshown. This lab does not demonstrate it/,
    )
    expect(() => buildCommon({ baseHardfork: 'glamsterdam', eips: [8282] })).toThrow(
      /unshown. This lab does not demonstrate it/,
    )
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
    expect(glamsterdam?.relatedEips).toEqual([2780, 7708, 7843, 7928, 7954, 7976, 8024, 8037, 8038])
    expect(glamsterdam?.plannedEips).toBeUndefined()
    expect(glamsterdam?.aliases).toContain('amsterdam')
    expect(glamsterdam?.tools).toEqual(['run_bytecode', 'run_transaction', 'run_block'])
    expect('shapes' in (glamsterdam ?? {})).toBe(false)
    expect(caps.queryShapes.map((row) => row.mcpTool)).toEqual([
      'describe_capabilities',
      'run_bytecode',
      'run_transaction',
      'run_block',
      'generate_artifact',
      'inspect_artifact',
    ])
    expect(caps.queryShapes.find((row) => row.id === 'simulate')?.mcpTool).toBe('run_bytecode')
    expect(caps.inspectKinds.some((k) => k.id === 'block-access-list')).toBe(true)
    expect(caps.inspectKinds.some((k) => k.id === 'authorization-list')).toBe(true)
    expect(caps.inspectKinds.some((k) => k.id === 'typed-transaction')).toBe(true)
    expect(caps.inspectKinds).toHaveLength(5)
    expect(
      caps.eipIntroductions.some((row) => row.eip === 3855 && row.introducedAt === 'shapella'),
    ).toBe(true)
    expect(caps.eips).toHaveLength(11)
    expect(caps.eips.some((e) => e.eip === 7702)).toBe(false)
    expect(caps.eips.some((e) => e.eip === 7928 && e.tools.includes('generate_artifact'))).toBe(
      true,
    )
    expect(caps.eips.some((e) => e.eip === 7954 && e.tools.includes('run_transaction'))).toBe(true)
    expect(caps.eipIntroductions.find((e) => e.eip === 7954)?.name).toBe(
      'Increase Maximum Contract Size',
    )
    expect(caps.eipIntroductions.find((e) => e.eip === 8246)?.name).toBe('Remove SELFDESTRUCT Burn')
    expect(caps.eipIntroductions.find((e) => e.eip === 8246)?.coverage).toBe('supported')
    expect(caps.eipIntroductions.find((e) => e.eip === 8246)?.observableTools).toBeUndefined()
    expect(caps.eipIntroductions.find((e) => e.eip === 7778)?.name).toBe(
      'Block gas accounting without refunds',
    )
    expect(caps.eipIntroductions.find((e) => e.eip === 7976)?.name).toBe(
      'Increase calldata floor cost',
    )
    expect(caps.eipIntroductions.find((e) => e.eip === 7976)?.coverage).toBe('twin')
    expect(caps.eips.find((e) => e.eip === 7976)?.tools).toEqual(['run_transaction'])
    expect(caps.eipIntroductions.find((e) => e.eip === 7981)?.name).toBe(
      'Increase access list cost',
    )
    expect(caps.eipIntroductions.find((e) => e.eip === 7981)?.coverage).toBe('supported')
    expect(caps.eipIntroductions.find((e) => e.eip === 7997)?.name).toBe(
      'Deterministic factory contract',
    )
    expect(caps.eipIntroductions.find((e) => e.eip === 7997)?.coverage).toBe('unshown')
    expect(caps.eipIntroductions.find((e) => e.eip === 7997)?.observableTools).toBeUndefined()
    expect(caps.eipIntroductions.find((e) => e.eip === 8282)?.name).toBe(
      'Builder execution requests',
    )
    expect(caps.eipIntroductions.find((e) => e.eip === 8282)?.coverage).toBe('unshown')
    expect(caps.eipIntroductions.find((e) => e.eip === 8282)?.observableTools).toBeUndefined()
    expect(caps.eips.some((e) => e.eip === 8246)).toBe(false)
    const e8024 = caps.eips.find((e) => e.eip === 8024)
    expect(e8024?.comparison?.baselineForkId).toBe('fusaka')
    expect(e8024?.comparison?.previewForkId).toBe('glamsterdam')
    expect(e8024?.specDate).toBe('2026-06-10')
    expect(e8024?.testReleaseName).toBe('tests-glamsterdam-devnet@v8.1.0')
    const e7883 = caps.eips.find((e) => e.eip === 7883)
    expect(e7883?.comparison?.baselineForkId).toBe('pectra')
    expect(e7883?.comparison?.previewForkId).toBe('fusaka')
    expect(e7883?.specUrl).toBe('https://eips.ethereum.org/EIPS/eip-7883')
    expect(e7883?.specDate).toBeUndefined()
    expect(e7883?.testReleaseName).toBeUndefined()
    expect(caps.ceilings.maxTxsPerBlock).toBe(8)
    expect(caps.ceilings.maxTransactionGasLimit).toBe('110000000')
  })

  it('treats named forks as catalog capabilities and derives advertised EIPs', () => {
    const pectra = getNamedFork('pectra')
    expect(pectra?.relatedEips).toEqual([])
    expect(getNamedFork('amsterdam')?.id).toBe('glamsterdam')
    expect(advertisedEipsForFork('pectra')).toEqual([])
    expect(advertisedEipsForFork('fusaka', ['osaka', 'mainnet-el'])).toEqual(
      getNamedFork('fusaka')?.relatedEips,
    )
    expect(advertisedEipsForForkConfig({ baseHardfork: 'glamsterdam', eips: [] })).toEqual([
      2780, 7708, 7843, 7928, 7954, 7976, 8024, 8037, 8038,
    ])
    expect(advertisedEipsForForkConfig({ baseHardfork: 'glamsterdam', eips: [8024] })).toEqual([
      8024,
    ])
  })

  it('classifies every activated EIP and keeps supported rows off the module list', () => {
    const caps = describeCapabilities()
    for (const fork of FORK_LINEAGE) {
      for (const eip of fork.activatedEips) {
        expect(introductionForEip(eip)?.introducedAt, `${fork.id} EIP-${eip}`).toBeTruthy()
      }
    }
    const moduleEips = new Set(EIP_MODULES.map((module) => module.eip))
    const twinRows = caps.eipIntroductions.filter((row) => moduleEips.has(row.eip))
    expect(twinRows.length).toBe(EIP_MODULES.length)
    expect(twinRows.every((row) => row.coverage === 'twin')).toBe(true)
    const supported = EIP_INTRODUCTIONS.filter((row) => row.coverage === 'supported')
    expect(supported.map((row) => row.eip)).toEqual([7981, 8246])
    for (const row of supported) {
      expect(row.observableShapes).toBeUndefined()
      expect(EIP_MODULES.some((module) => module.eip === row.eip)).toBe(false)
      expect(caps.eips.some((entry) => entry.eip === row.eip)).toBe(false)
    }
    expect(caps.eipIntroductions.find((row) => row.eip === 7708)?.coverage).toBe('twin')
    expect(caps.eipIntroductions.find((row) => row.eip === 2780)?.coverage).toBe('twin')
    expect(caps.eipIntroductions.find((row) => row.eip === 7002)?.coverage).toBe('listed')
    const consensus = EIP_INTRODUCTIONS.filter((row) => row.coverage === 'consensus').map(
      (row) => row.eip,
    )
    expect(consensus).toEqual([3675, 4895, 6110, 7251, 7594, 7688, 7732, 8045, 8061])
    for (const eip of consensus) {
      const row = EIP_INTRODUCTIONS.find((entry) => entry.eip === eip)
      expect(row?.observableShapes).toBeUndefined()
      expect(EIP_MODULES.some((module) => module.eip === eip)).toBe(false)
      expect(caps.eips.some((entry) => entry.eip === eip)).toBe(false)
      expect(caps.eipIntroductions.find((entry) => entry.eip === eip)?.coverage).toBe('consensus')
      expect(
        caps.eipIntroductions.find((entry) => entry.eip === eip)?.observableTools,
      ).toBeUndefined()
    }
    const networking = EIP_INTRODUCTIONS.filter((row) => row.coverage === 'networking').map(
      (row) => row.eip,
    )
    expect(networking).toEqual([7975, 8070, 8136, 8159, 8189])
    const informational = EIP_INTRODUCTIONS.filter((row) => row.coverage === 'informational').map(
      (row) => row.eip,
    )
    expect(informational).toEqual([7904, 8261])
    const unshown = EIP_INTRODUCTIONS.filter((row) => row.coverage === 'unshown').map(
      (row) => row.eip,
    )
    expect(unshown).toEqual([7997, 8282])
    for (const eip of [...networking, ...informational, ...unshown]) {
      const row = EIP_INTRODUCTIONS.find((entry) => entry.eip === eip)
      expect(row?.observableShapes).toBeUndefined()
      expect(EIP_MODULES.some((module) => module.eip === eip)).toBe(false)
      expect(caps.eips.some((entry) => entry.eip === eip)).toBe(false)
      expect(
        caps.eipIntroductions.find((entry) => entry.eip === eip)?.observableTools,
      ).toBeUndefined()
    }
    expect(caps.eipIntroductions.find((entry) => entry.eip === 7975)?.coverage).toBe('networking')
    expect(caps.eipIntroductions.find((entry) => entry.eip === 7904)?.coverage).toBe(
      'informational',
    )
    expect(caps.eipIntroductions.find((entry) => entry.eip === 7997)?.coverage).toBe('unshown')
    expect(caps.eipIntroductions.find((entry) => entry.eip === 8282)?.coverage).toBe('unshown')
    const glamsterdam = FORK_LINEAGE.find((fork) => fork.id === 'glamsterdam')
    expect(glamsterdam?.activatedEips).toEqual(expect.arrayContaining([7997, 8282]))
    expect(glamsterdam?.activatedEips).not.toEqual(
      expect.arrayContaining([7688, 7732, 8045, 8061, 7975, 8070, 8136, 8159, 8189, 7904, 8261]),
    )
  })
})
