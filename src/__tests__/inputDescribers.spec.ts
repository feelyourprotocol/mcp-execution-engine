import { describe, expect, it } from 'vitest'

import {
  describeRejectedAddress,
  describeRejectedHex,
  gasLimitFacts,
} from '../forks/inputDescribers.js'
import { ENGINE_CEILINGS } from '../forks/registry.js'
import { parseBytecodeHex, parseGasLimit } from '../forks/resolve.js'
import { EngineError } from '../types/index.js'

function captureEngineError(run: () => void): EngineError {
  try {
    run()
  } catch (error) {
    if (error instanceof EngineError) {
      return error
    }
    throw error
  }
  throw new Error('expected EngineError')
}

describe('inputDescribers', () => {
  it('describeRejectedHex classifies odd length without raw bytes', () => {
    const { shape, facts } = describeRejectedHex('0x600', 'bytecode')
    expect(shape).toBe('odd_length')
    expect(facts['bytecode.shape']).toBe('odd_length')
    expect(facts['bytecode.chars']).toBe(5)
    expect(JSON.stringify(facts)).not.toMatch(/600/)
  })

  it('describeRejectedAddress records shape only', () => {
    const facts = describeRejectedAddress('from', '0xshort')
    expect(facts['from.hexDigits']).toBe(5)
    expect(facts['from.expectedHexDigits']).toBe(40)
    expect(JSON.stringify(facts)).not.toContain('short')
  })

  it('parseBytecodeHex attaches field and facts on odd hex', () => {
    const err = captureEngineError(() => parseBytecodeHex('0x600'))
    expect(err.field).toBe('bytecode')
    expect(err.facts?.['bytecode.shape']).toBe('odd_length')
  })

  it('parseGasLimit attaches ceiling facts', () => {
    const err = captureEngineError(() =>
      parseGasLimit(String(Number(ENGINE_CEILINGS.maxGasLimit) + 1)),
    )
    expect(err.code).toBe('gas_limit_too_high')
    expect(err.facts?.gasLimitCeiling).toBe(ENGINE_CEILINGS.maxGasLimit.toString())
  })

  it('gasLimitFacts is stable', () => {
    expect(gasLimitFacts(2n, 100n)).toEqual({ gasLimit: '2', gasLimitCeiling: '100' })
  })
})
