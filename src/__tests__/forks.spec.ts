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

  it('resolves named amsterdam fork and alias', () => {
    expect(resolveNamedFork('amsterdam')).toEqual({ baseHardfork: 'amsterdam', eips: [] })
    expect(resolveNamedFork('glamsterdam')).toEqual({ baseHardfork: 'amsterdam', eips: [] })
  })

  it('rejects unknown eip in fork config', () => {
    expect(() => buildCommon({ baseHardfork: 'amsterdam', eips: [99999] })).toThrow(EngineError)
  })

  it('rejects unregistered eip 7883', () => {
    expect(() => buildCommon({ baseHardfork: 'amsterdam', eips: [7883] })).toThrow(/7883/)
  })

  it('parses bytecode and gas limits', () => {
    expect(parseBytecodeHex('600100')).toHaveLength(3)
    expect(parseGasLimit(undefined)).toBe(ENGINE_CEILINGS.defaultGasLimit)
    expect(parseGasLimit('500000')).toBe(500_000n)
  })

  it('describeCapabilities lists only runnable EIP-8024', () => {
    const caps = describeCapabilities()
    expect(caps.engineVersion).toBe('0.1.0')
    expect(caps.namedForks.some((fork) => fork.id === 'amsterdam')).toBe(true)
    expect(caps.namedForks[0]?.aliases).toContain('glamsterdam')
    expect(caps.eips).toHaveLength(1)
    expect(caps.eips[0]?.eip).toBe(8024)
    expect(caps.eips[0]?.runnable).toBe(true)
    expect(caps.eips[0]?.opcodes?.some((op) => op.name === 'DUPN')).toBe(true)
    expect(caps.eips[0]).not.toHaveProperty('scenarios')
    expect(caps.eips.every((eip) => eip.runnable)).toBe(true)
    expect(caps.eips.some((eip) => eip.eip === 7883)).toBe(false)
  })
})
