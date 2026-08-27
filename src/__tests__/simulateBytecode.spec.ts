import { describe, expect, it } from 'vitest'

import { ENGINE_CEILINGS } from '../forks/registry.js'
import { simulateBytecode } from '../simulate/simulateBytecode.js'
import { EngineError } from '../types.js'
import { dupnDemoHex, PUSH1_STOP_HEX } from './fixtures/eip8024.js'

describe('simulateBytecode', () => {
  it('is deterministic for identical input', async () => {
    const input = { bytecode: PUSH1_STOP_HEX, fork: { baseHardfork: 'amsterdam', eips: [] } }
    const first = await simulateBytecode(input)
    const second = await simulateBytecode(input)
    expect(first).toEqual(second)
  })

  it('runs simple PUSH1 STOP and returns provenance', async () => {
    const result = await simulateBytecode({
      bytecode: PUSH1_STOP_HEX,
      fork: { baseHardfork: 'amsterdam', eips: [] },
    })

    expect(result.success).toBe(true)
    expect(result.error).toBeNull()
    expect(BigInt(result.gasUsed)).toBeGreaterThan(0n)
    expect(result.provenance.engineVersion).toBe('0.1.0')
    expect(result.provenance.caveat).toMatch(/amsterdam/)
  })

  it('records opcode trace when requested', async () => {
    const result = await simulateBytecode({
      bytecode: PUSH1_STOP_HEX,
      fork: { baseHardfork: 'amsterdam', eips: [] },
      trace: true,
    })

    expect(result.steps?.length).toBe(2)
    expect(result.steps?.[0]?.op).toBe('PUSH1')
  })

  it('runs DUPN on amsterdam (EIP-8024 bundled in fork)', async () => {
    const result = await simulateBytecode({
      bytecode: dupnDemoHex(),
      fork: { baseHardfork: 'amsterdam', eips: [] },
    })

    expect(result.success).toBe(true)
    expect(result.finalStack.slice(-3)).toEqual(['0x10', '0x11', '0x1'])
  })

  it('accepts explicit eips:[8024] on amsterdam', async () => {
    const result = await simulateBytecode({
      bytecode: dupnDemoHex(),
      fork: { baseHardfork: 'amsterdam', eips: [8024] },
    })

    expect(result.success).toBe(true)
  })

  it('rejects bytecode above size ceiling', async () => {
    const huge = '0x' + '00'.repeat(ENGINE_CEILINGS.maxBytecodeBytes + 1)
    await expect(
      simulateBytecode({ bytecode: huge, fork: { baseHardfork: 'amsterdam' } }),
    ).rejects.toThrow(EngineError)
  })
})
