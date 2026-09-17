import { describe, expect, it } from 'vitest'

import { ENGINE_CEILINGS } from '../forks/registry.js'
import { NEW_STORAGE_SLOT_STATE_GAS } from '../modules/eip-8037/input.js'
import { simulateBytecode } from '../simulate/simulateBytecode.js'
import { LAB_BYTECODE_ADDRESS } from '../transaction/lab.js'
import { EngineError } from '../types.js'
import { dupnDemoHex, PUSH1_STOP_HEX } from './fixtures/eip8024.js'
import {
  EXTCODESIZE_AA,
  SSTORE_SLOT3_VALUE7,
  SSTORE_THEN_SLOAD_SLOT3,
  SSTORE_UNDERFLOW,
} from './fixtures/eip8038.js'

describe('simulateBytecode', () => {
  it('is deterministic for identical input', async () => {
    const input = { bytecode: PUSH1_STOP_HEX, fork: { baseHardfork: 'glamsterdam', eips: [] } }
    const first = await simulateBytecode(input)
    const second = await simulateBytecode(input)
    expect(first).toEqual(second)
  })

  it('runs simple PUSH1 STOP on osaka baseline and returns firm provenance', async () => {
    const result = await simulateBytecode({
      bytecode: PUSH1_STOP_HEX,
      fork: { baseHardfork: 'fusaka', eips: [] },
    })

    expect(result.success).toBe(true)
    expect(result.error).toBeNull()
    expect(result.gasUsed).toBe('3')
    expect(result.gasUsedScope).toBe('call-frame')
    expect(result.provenance.forkConfig.baseHardfork).toBe('fusaka')
    expect(result.provenance.stabilityRollup).toBe('firm')
    expect(result.provenance.caveat).toMatch(/mainnet EL baseline/)
    expect(result.provenance.caveat).not.toMatch(/may change before mainnet activation/)
  })

  it('rejects DUPN bytecode on osaka baseline (invalid opcode)', async () => {
    const result = await simulateBytecode({
      bytecode: dupnDemoHex(),
      fork: { baseHardfork: 'fusaka', eips: [] },
    })

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/invalid/i)
  })

  it('runs simple PUSH1 STOP and returns provenance', async () => {
    const result = await simulateBytecode({
      bytecode: PUSH1_STOP_HEX,
      fork: { baseHardfork: 'glamsterdam', eips: [] },
    })

    expect(result.success).toBe(true)
    expect(result.error).toBeNull()
    expect(result.gasUsed).toBe('3')
    expect(result.gasUsedScope).toBe('call-frame')
    expect(result.provenance.engineVersion).toBe('0.1.0')
    expect(result.provenance.caveat).toMatch(/amsterdam/)
  })

  it('records opcode trace when requested', async () => {
    const result = await simulateBytecode({
      bytecode: PUSH1_STOP_HEX,
      fork: { baseHardfork: 'glamsterdam', eips: [] },
      trace: true,
    })

    expect(result.steps?.length).toBe(2)
    expect(result.steps?.[0]?.op).toBe('PUSH1')
  })

  it('runs DUPN on amsterdam (EIP-8024 bundled in fork)', async () => {
    const result = await simulateBytecode({
      bytecode: dupnDemoHex(),
      fork: { baseHardfork: 'glamsterdam', eips: [] },
    })

    expect(result.success).toBe(true)
    expect(result.finalStack.slice(-3)).toEqual(['0x10', '0x11', '0x1'])
  })

  it('accepts explicit eips:[8024] on amsterdam', async () => {
    const result = await simulateBytecode({
      bytecode: dupnDemoHex(),
      fork: { baseHardfork: 'glamsterdam', eips: [8024] },
    })

    expect(result.success).toBe(true)
  })

  it('rejects bytecode above size ceiling', async () => {
    const huge = '0x' + '00'.repeat(ENGINE_CEILINGS.maxBytecodeBytes + 1)
    await expect(
      simulateBytecode({ bytecode: huge, fork: { baseHardfork: 'glamsterdam' } }),
    ).rejects.toThrow(EngineError)
  })

  it('rejects empty bytecode', async () => {
    await expect(simulateBytecode({ bytecode: '' })).rejects.toThrow(/bytecode/i)
  })

  it('persists SSTORE so a later SLOAD in the same program sees the write', async () => {
    const result = await simulateBytecode({
      bytecode: SSTORE_THEN_SLOAD_SLOT3,
      fork: { baseHardfork: 'glamsterdam' },
    })

    expect(result.success).toBe(true)
    expect(result.finalStack.at(-1)).toBe('0x7')
  })

  it('charges existing-slot SSTORE program gas on Glamsterdam vs Fusaka', async () => {
    const storage = [{ address: LAB_BYTECODE_ADDRESS, storage: [{ slot: '0x03', value: '0x01' }] }]
    const osaka = await simulateBytecode({
      bytecode: SSTORE_SLOT3_VALUE7,
      accounts: storage,
      fork: { baseHardfork: 'fusaka' },
    })
    const amsterdam = await simulateBytecode({
      bytecode: SSTORE_SLOT3_VALUE7,
      accounts: storage,
      fork: { baseHardfork: 'glamsterdam' },
    })

    expect(osaka.success).toBe(true)
    expect(amsterdam.success).toBe(true)
    expect(osaka.gasUsed).toBe('5006')
    expect(amsterdam.gasUsed).toBe('12106')
    expect(osaka.stateGasSpilled).toBeUndefined()
    expect(amsterdam.stateGasSpilled).toBeUndefined()
  })

  it('reports new-slot state gas spill on Glamsterdam SSTORE', async () => {
    const osaka = await simulateBytecode({
      bytecode: SSTORE_SLOT3_VALUE7,
      fork: { baseHardfork: 'fusaka' },
    })
    const amsterdam = await simulateBytecode({
      bytecode: SSTORE_SLOT3_VALUE7,
      fork: { baseHardfork: 'glamsterdam' },
    })

    expect(osaka.success).toBe(true)
    expect(amsterdam.success).toBe(true)
    expect(osaka.gasUsed).toBe('22106')
    expect(amsterdam.stateGasSpilled).toBe(NEW_STORAGE_SLOT_STATE_GAS.toString())
    expect(BigInt(amsterdam.gasUsed) - BigInt(amsterdam.stateGasSpilled ?? '0')).toBe(12106n)
  })

  it('reads EXTCODESIZE of a contract seeded in the same call', async () => {
    const result = await simulateBytecode({
      bytecode: EXTCODESIZE_AA,
      accounts: [{ address: '0x00000000000000000000000000000000000000aa', code: '0x600100' }],
      fork: { baseHardfork: 'glamsterdam' },
    })

    expect(result.success).toBe(true)
    expect(result.finalStack.at(-1)).toBe('0x3')
    expect(result.gasUsed).toBe('3103')
  })

  it('does not take storage from an unrelated account as the execution slot', async () => {
    const result = await simulateBytecode({
      bytecode: SSTORE_SLOT3_VALUE7,
      accounts: [
        {
          address: '0x00000000000000000000000000000000000000aa',
          storage: [{ slot: '0x03', value: '0x01' }],
        },
      ],
      fork: { baseHardfork: 'glamsterdam' },
    })

    expect(result.success).toBe(true)
    expect(result.stateGasSpilled).toBe(NEW_STORAGE_SLOT_STATE_GAS.toString())
  })

  it('fails SSTORE with a short stack', async () => {
    const result = await simulateBytecode({
      bytecode: SSTORE_UNDERFLOW,
      fork: { baseHardfork: 'glamsterdam' },
    })

    expect(result.success).toBe(false)
    expect(result.error?.toLowerCase()).toMatch(/stack/)
  })
})
