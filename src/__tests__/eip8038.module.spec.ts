import { describe, expect, it } from 'vitest'

import { NEW_STORAGE_SLOT_STATE_GAS } from '../modules/eip-8037/input.js'
import { EIP_8038_MODULE } from '../modules/eip-8038/index.js'
import { simulateBytecode } from '../simulate/simulateBytecode.js'
import { runTransaction } from '../transaction/runTransaction.js'
import { EngineError } from '../types.js'
import {
  ACCESS_GAS_CALLER,
  EXTCODESIZE_AA,
  SLOAD_SLOT3,
  SSTORE_CONTRACT,
  SSTORE_SLOT3_VALUE7,
  SSTORE_UNDERFLOW,
} from './fixtures/eip8038.js'

describe('EIP-8038 module', () => {
  it('describes state-access gas without demo programs', () => {
    expect(EIP_8038_MODULE.eip).toBe(8038)
    expect(EIP_8038_MODULE.runnable).toBe(true)
    expect(EIP_8038_MODULE.changeNature).toBe('repricing')
    expect(EIP_8038_MODULE.shapes).toEqual(['simulate', 'transaction'])
    expect(EIP_8038_MODULE.comparison).toBeUndefined()
    expect(EIP_8038_MODULE.opcodes?.map((op) => op.opcodeHex)).toEqual(['0x55', '0x54', '0x3b'])
    expect(EIP_8038_MODULE).not.toHaveProperty('scenarios')
  })

  it('keeps cold SLOAD at 2103 on Fusaka and Glamsterdam', async () => {
    const osaka = await simulateBytecode({
      bytecode: SLOAD_SLOT3,
      fork: { baseHardfork: 'fusaka' },
    })
    const amsterdam = await simulateBytecode({
      bytecode: SLOAD_SLOT3,
      fork: { baseHardfork: 'glamsterdam' },
    })

    expect(osaka.success).toBe(true)
    expect(amsterdam.success).toBe(true)
    expect(osaka.gasUsed).toBe('2103')
    expect(amsterdam.gasUsed).toBe('2103')
  })

  it('charges extra EXTCODESIZE gas on Glamsterdam', async () => {
    const osaka = await simulateBytecode({
      bytecode: EXTCODESIZE_AA,
      fork: { baseHardfork: 'fusaka' },
    })
    const amsterdam = await simulateBytecode({
      bytecode: EXTCODESIZE_AA,
      fork: { baseHardfork: 'glamsterdam' },
    })

    expect(osaka.success).toBe(true)
    expect(amsterdam.success).toBe(true)
    expect(osaka.gasUsed).toBe('2603')
    expect(amsterdam.gasUsed).toBe('3103')
  })

  it('jumps existing-slot SSTORE write cost on Glamsterdam vs Fusaka', async () => {
    const storage = [{ slot: '0x03', value: '0x01' }]
    const amsterdam = await runTransaction({
      from: ACCESS_GAS_CALLER,
      to: SSTORE_CONTRACT,
      code: SSTORE_SLOT3_VALUE7,
      accounts: [{ address: SSTORE_CONTRACT, storage }],
      fork: { baseHardfork: 'glamsterdam' },
    })
    const osaka = await runTransaction({
      from: ACCESS_GAS_CALLER,
      to: SSTORE_CONTRACT,
      code: SSTORE_SLOT3_VALUE7,
      accounts: [{ address: SSTORE_CONTRACT, storage }],
      fork: { baseHardfork: 'fusaka' },
    })

    expect(amsterdam.success).toBe(true)
    expect(osaka.success).toBe(true)
    expect(amsterdam.txStateGas === undefined || amsterdam.txStateGas === '0').toBe(true)
    expect(BigInt(amsterdam.gasUsed)).toBeGreaterThan(BigInt(osaka.gasUsed))
    expect(BigInt(osaka.gasUsed)).toBeLessThan(43_106n)
  })

  it('charges new-slot state gas on Glamsterdam SSTORE', async () => {
    const amsterdam = await runTransaction({
      from: ACCESS_GAS_CALLER,
      to: SSTORE_CONTRACT,
      code: SSTORE_SLOT3_VALUE7,
      fork: { baseHardfork: 'glamsterdam' },
    })
    const osaka = await runTransaction({
      from: ACCESS_GAS_CALLER,
      to: SSTORE_CONTRACT,
      code: SSTORE_SLOT3_VALUE7,
      fork: { baseHardfork: 'fusaka' },
    })

    expect(amsterdam.success).toBe(true)
    expect(osaka.success).toBe(true)
    expect(amsterdam.txStateGas).toBe(NEW_STORAGE_SLOT_STATE_GAS.toString())
    expect(BigInt(amsterdam.gasUsed)).toBeGreaterThan(BigInt(osaka.gasUsed))
  })

  it('does not charge create state gas when the slot already exists', async () => {
    const existing = await runTransaction({
      from: ACCESS_GAS_CALLER,
      to: SSTORE_CONTRACT,
      code: SSTORE_SLOT3_VALUE7,
      accounts: [{ address: SSTORE_CONTRACT, storage: [{ slot: '0x03', value: '0x01' }] }],
      fork: { baseHardfork: 'glamsterdam' },
    })
    const created = await runTransaction({
      from: ACCESS_GAS_CALLER,
      to: SSTORE_CONTRACT,
      code: SSTORE_SLOT3_VALUE7,
      fork: { baseHardfork: 'glamsterdam' },
    })

    expect(existing.success).toBe(true)
    expect(created.success).toBe(true)
    expect(existing.txStateGas === undefined || existing.txStateGas === '0').toBe(true)
    expect(created.txStateGas).toBe(NEW_STORAGE_SLOT_STATE_GAS.toString())
    expect(BigInt(created.gasUsed)).toBeGreaterThan(BigInt(existing.gasUsed))
  })

  it('rejects oversized storage keys', async () => {
    await expect(
      runTransaction({
        from: ACCESS_GAS_CALLER,
        to: SSTORE_CONTRACT,
        code: SSTORE_SLOT3_VALUE7,
        accounts: [
          {
            address: SSTORE_CONTRACT,
            storage: [{ slot: `0x${'11'.repeat(33)}`, value: '0x01' }],
          },
        ],
        fork: { baseHardfork: 'glamsterdam' },
      }),
    ).rejects.toBeInstanceOf(EngineError)
  })

  it('fails SSTORE with a short stack', async () => {
    const result = await runTransaction({
      from: ACCESS_GAS_CALLER,
      to: SSTORE_CONTRACT,
      code: SSTORE_UNDERFLOW,
      fork: { baseHardfork: 'glamsterdam' },
    })

    expect(result.success).toBe(false)
    expect(result.error?.toLowerCase()).toMatch(/stack/)
  })
})
