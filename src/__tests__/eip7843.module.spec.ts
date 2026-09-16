import { describe, expect, it } from 'vitest'

import { runBlock } from '../block/runBlock.js'
import { UINT64_MAX } from '../forks/resolve.js'
import { EIP_7843_MODULE } from '../modules/eip-7843/index.js'
import { SLOTNUM, SLOTNUM_GAS } from '../modules/eip-7843/opcodes.js'
import { simulateBytecode } from '../simulate/simulateBytecode.js'
import { EngineError } from '../types.js'
import {
  SLOTNUM_CALLER,
  SLOTNUM_CONTRACT,
  slotnumReturnHex,
  slotnumStopHex,
  slotnumThenInvalidHex,
} from './fixtures/eip7843.js'

describe('EIP-7843 module', () => {
  it('describes SLOTNUM without demo programs', () => {
    expect(EIP_7843_MODULE.eip).toBe(7843)
    expect(EIP_7843_MODULE.runnable).toBe(true)
    expect(EIP_7843_MODULE.changeNature).toBe('new-capability')
    expect(EIP_7843_MODULE.shapes).toEqual(['block'])
    expect(EIP_7843_MODULE.summary).toMatch(/SLOTNUM/)
    expect(EIP_7843_MODULE.opcodes?.map((entry) => entry.name)).toEqual(['SLOTNUM'])
    expect(EIP_7843_MODULE.opcodes?.[0]?.opcode).toBe(SLOTNUM)
    expect(EIP_7843_MODULE.opcodes?.[0]?.opcodeHex).toBe('0x4b')
    expect(EIP_7843_MODULE.opcodes?.[0]?.effect).toMatch(String(SLOTNUM_GAS))
    expect(EIP_7843_MODULE.keywords).toContain('SLOTNUM')
    expect(EIP_7843_MODULE.comparison).toBeUndefined()
    expect(EIP_7843_MODULE).not.toHaveProperty('scenarios')
    expect(EIP_7843_MODULE).not.toHaveProperty('questions')
  })

  it('returns the chosen header slot from run_block on Amsterdam', async () => {
    const result = await runBlock({
      transactions: [
        {
          from: SLOTNUM_CALLER,
          to: SLOTNUM_CONTRACT,
          code: slotnumReturnHex(),
        },
      ],
      header: { slotNumber: '99' },
      fork: { baseHardfork: 'amsterdam' },
    })

    expect(result.success).toBe(true)
    expect(result.header.slotNumber).toBe('99')
    expect(BigInt(result.transactions[0]?.returnValue ?? '0x')).toBe(99n)
  })

  it('returns a different slot when the header slot changes', async () => {
    const result = await runBlock({
      transactions: [
        {
          from: SLOTNUM_CALLER,
          to: SLOTNUM_CONTRACT,
          code: slotnumReturnHex(),
        },
      ],
      header: { slotNumber: '12345678' },
      fork: { baseHardfork: 'amsterdam' },
    })

    expect(result.success).toBe(true)
    expect(BigInt(result.transactions[0]?.returnValue ?? '0x')).toBe(12345678n)
  })

  it('rejects SLOTNUM on osaka baseline for comparison', async () => {
    const result = await runBlock({
      transactions: [
        {
          from: SLOTNUM_CALLER,
          to: SLOTNUM_CONTRACT,
          code: slotnumReturnHex(),
        },
      ],
      fork: { baseHardfork: 'osaka' },
    })

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/invalid/i)
  })

  it('rejects header.slotNumber on Osaka', async () => {
    await expect(
      runBlock({
        transactions: [
          {
            from: SLOTNUM_CALLER,
            to: SLOTNUM_CONTRACT,
            code: slotnumReturnHex(),
          },
        ],
        header: { slotNumber: '99' },
        fork: { baseHardfork: 'osaka' },
      }),
    ).rejects.toThrow(/EIP-7843/)
  })

  it('run_bytecode mock header is slot 0 — chosen slot needs run_block', async () => {
    const result = await simulateBytecode({
      bytecode: slotnumStopHex(),
      fork: { baseHardfork: 'amsterdam' },
    })

    expect(result.success).toBe(true)
    expect(result.finalStack[0]).toBe('0x0')
  })

  it('accepts uint64 max slot and rejects larger', async () => {
    const max = await runBlock({
      transactions: [
        {
          from: SLOTNUM_CALLER,
          to: SLOTNUM_CONTRACT,
          code: slotnumReturnHex(),
        },
      ],
      header: { slotNumber: UINT64_MAX.toString() },
      fork: { baseHardfork: 'amsterdam' },
    })
    expect(max.success).toBe(true)
    expect(BigInt(max.transactions[0]?.returnValue ?? '0x')).toBe(UINT64_MAX)

    await expect(
      runBlock({
        transactions: [
          {
            from: SLOTNUM_CALLER,
            to: SLOTNUM_CONTRACT,
            code: slotnumReturnHex(),
          },
        ],
        header: { slotNumber: (UINT64_MAX + 1n).toString() },
        fork: { baseHardfork: 'amsterdam' },
      }),
    ).rejects.toThrow(EngineError)
  })

  it('fails when SLOTNUM is followed by INVALID', async () => {
    const result = await runBlock({
      transactions: [
        {
          from: SLOTNUM_CALLER,
          to: SLOTNUM_CONTRACT,
          code: slotnumThenInvalidHex(),
        },
      ],
      header: { slotNumber: '7' },
      fork: { baseHardfork: 'amsterdam' },
    })

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/invalid/i)
  })
})
