import { describe, expect, it } from 'vitest'

import { EIP_8024_MODULE } from '../modules/eip-8024/index.js'
import {
  DUPN,
  encodeDupnSwapnImmediate,
  encodeExchangeImmediate,
  EXCHANGE,
  SWAPN,
} from '../modules/eip-8024/opcodes.js'
import { simulateBytecode } from '../simulate/simulateBytecode.js'
import {
  dupnDemoHex,
  exchangeDemoHex,
  invalidDupnDemoHex,
  swapnDemoHex,
} from './fixtures/eip8024.js'

describe('EIP-8024 module', () => {
  it('describes Amsterdam opcode support without demo programs', () => {
    expect(EIP_8024_MODULE.eip).toBe(8024)
    expect(EIP_8024_MODULE.runnable).toBe(true)
    expect(EIP_8024_MODULE.shapes).toEqual(['simulate'])
    expect(EIP_8024_MODULE.summary).toMatch(/Amsterdam/)
    expect(EIP_8024_MODULE.opcodes?.map((entry) => entry.name)).toEqual([
      'DUPN',
      'SWAPN',
      'EXCHANGE',
    ])
    expect(EIP_8024_MODULE.opcodes?.[0]?.opcode).toBe(DUPN)
    expect(EIP_8024_MODULE.opcodes?.[1]?.opcode).toBe(SWAPN)
    expect(EIP_8024_MODULE.opcodes?.[2]?.opcode).toBe(EXCHANGE)
    expect(EIP_8024_MODULE.keywords).toContain('DUPN')
    expect(EIP_8024_MODULE).not.toHaveProperty('scenarios')
    expect(EIP_8024_MODULE).not.toHaveProperty('questions')
  })

  it('encodes DUPN/SWAPN and EXCHANGE immediates per spec', () => {
    expect(encodeDupnSwapnImmediate(17)).toBe(0x80)
    expect(encodeExchangeImmediate(1, 2)).toBe(0x8e)
  })

  it('executes caller-supplied 8024 bytecode on Amsterdam', async () => {
    const dupn = await simulateBytecode({
      bytecode: dupnDemoHex(),
      fork: { baseHardfork: 'amsterdam' },
    })
    expect(dupn.success).toBe(true)
    expect(dupn.finalStack.slice(-3)).toEqual(['0x10', '0x11', '0x1'])

    const swapn = await simulateBytecode({
      bytecode: swapnDemoHex(),
      fork: { baseHardfork: 'amsterdam' },
    })
    expect(swapn.success).toBe(true)

    const exchange = await simulateBytecode({
      bytecode: exchangeDemoHex(),
      fork: { baseHardfork: 'amsterdam' },
    })
    expect(exchange.success).toBe(true)
    expect(new Set(exchange.finalStack)).toEqual(new Set(['0x1', '0x2', '0x3', '0x4']))

    const invalid = await simulateBytecode({
      bytecode: invalidDupnDemoHex(),
      fork: { baseHardfork: 'amsterdam' },
    })
    expect(invalid.success).toBe(false)
    expect(invalid.error).toMatch(/stack/i)
  })
})
