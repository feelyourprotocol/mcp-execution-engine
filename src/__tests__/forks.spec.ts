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
    expect(normalizeForkConfig({ baseHardfork: 'amsterdam', eips: [8024, 7883] })).toEqual({
      baseHardfork: 'amsterdam',
      eips: [7883, 8024],
    })
  })

  it('resolves named amsterdam fork', () => {
    expect(resolveNamedFork('amsterdam')).toEqual({ baseHardfork: 'amsterdam', eips: [] })
  })

  it('rejects unknown eip in fork config', () => {
    expect(() => buildCommon({ baseHardfork: 'amsterdam', eips: [99999] })).toThrow(EngineError)
  })

  it('parses bytecode and gas limits', () => {
    expect(parseBytecodeHex('600100')).toHaveLength(3)
    expect(parseGasLimit(undefined)).toBe(ENGINE_CEILINGS.defaultGasLimit)
    expect(parseGasLimit('500000')).toBe(500_000n)
  })

  it('describeCapabilities includes registry entries', () => {
    const caps = describeCapabilities()
    expect(caps.engineVersion).toBe('0.1.0')
    expect(caps.namedForks.some((fork) => fork.id === 'amsterdam')).toBe(true)
    expect(caps.eips.some((eip) => eip.eip === 8024)).toBe(true)
    expect(caps.presets.length).toBeGreaterThan(0)
  })
})
