import { describe, expect, it } from 'vitest'

import { EIP_8037_MODULE } from '../modules/eip-8037/index.js'
import { FIRST_TOUCH_STATE_GAS } from '../modules/eip-8037/input.js'
import { runTransaction } from '../transaction/runTransaction.js'
import {
  EMPTY_RECIPIENT,
  FUNDED_RECIPIENT,
  SSTORE_CONTRACT,
  SSTORE_NEW_SLOT_BYTECODE,
  STATE_GAS_CALLER,
} from './fixtures/eip8037.js'

const SIMPLE_TRANSFER_INTRINSIC = 21_000n

describe('EIP-8037 module', () => {
  it('describes state-creation gas without demo programs', () => {
    expect(EIP_8037_MODULE.eip).toBe(8037)
    expect(EIP_8037_MODULE.runnable).toBe(true)
    expect(EIP_8037_MODULE.changeNature).toBe('new-exec-model')
    expect(EIP_8037_MODULE.shapes).toEqual(['transaction', 'simulate'])
    expect(EIP_8037_MODULE.comparison).toEqual({
      baselineForkId: 'osaka',
      previewForkId: 'amsterdam',
      note: 'Value tx to empty account: Amsterdam gasUsed ≈ 204600 (21000 + 183600 state); Osaka 21000. gasLimit 21000 fails on Amsterdam.',
    })
    expect(EIP_8037_MODULE.opcodes?.map((op) => op.opcodeHex).sort()).toEqual(['0x55', '0xf1'])
  })

  it('charges first-touch state gas on Amsterdam for a value-bearing transaction', async () => {
    const amsterdam = await runTransaction({
      from: STATE_GAS_CALLER,
      to: EMPTY_RECIPIENT,
      value: '1',
      fork: { baseHardfork: 'amsterdam' },
    })
    const osaka = await runTransaction({
      from: STATE_GAS_CALLER,
      to: EMPTY_RECIPIENT,
      value: '1',
      fork: { baseHardfork: 'osaka' },
    })

    expect(amsterdam.success).toBe(true)
    expect(osaka.success).toBe(true)
    expect(amsterdam.gasUsed).toBe((SIMPLE_TRANSFER_INTRINSIC + FIRST_TOUCH_STATE_GAS).toString())
    expect(osaka.gasUsed).toBe(SIMPLE_TRANSFER_INTRINSIC.toString())
    expect(amsterdam.txStateGas).toBe(FIRST_TOUCH_STATE_GAS.toString())
  })

  it('fails first-touch on Amsterdam at gasLimit 21000 and succeeds on Osaka', async () => {
    const amsterdam = await runTransaction({
      from: STATE_GAS_CALLER,
      to: EMPTY_RECIPIENT,
      value: '1',
      gasLimit: '21000',
      fork: { baseHardfork: 'amsterdam' },
    })
    const osaka = await runTransaction({
      from: STATE_GAS_CALLER,
      to: EMPTY_RECIPIENT,
      value: '1',
      gasLimit: '21000',
      fork: { baseHardfork: 'osaka' },
    })

    expect(amsterdam.success).toBe(false)
    expect(amsterdam.error?.toLowerCase()).toMatch(/intrinsic|out of gas|gas/)
    expect(osaka.success).toBe(true)
  })

  it('collapses first-touch gas when the recipient is already funded', async () => {
    const amsterdam = await runTransaction({
      from: STATE_GAS_CALLER,
      to: FUNDED_RECIPIENT,
      value: '1',
      accounts: [{ address: FUNDED_RECIPIENT, balance: '1000000000000000000' }],
      fork: { baseHardfork: 'amsterdam' },
    })
    const osaka = await runTransaction({
      from: STATE_GAS_CALLER,
      to: FUNDED_RECIPIENT,
      value: '1',
      accounts: [{ address: FUNDED_RECIPIENT, balance: '1000000000000000000' }],
      fork: { baseHardfork: 'osaka' },
    })

    expect(amsterdam.success).toBe(true)
    expect(osaka.success).toBe(true)
    expect(amsterdam.gasUsed).toBe(osaka.gasUsed)
  })

  it('does not charge first-touch state gas on zero-value transaction to an empty account', async () => {
    const amsterdam = await runTransaction({
      from: STATE_GAS_CALLER,
      to: EMPTY_RECIPIENT,
      value: '0',
      fork: { baseHardfork: 'amsterdam' },
    })
    const osaka = await runTransaction({
      from: STATE_GAS_CALLER,
      to: EMPTY_RECIPIENT,
      value: '0',
      fork: { baseHardfork: 'osaka' },
    })

    expect(amsterdam.success).toBe(true)
    expect(osaka.success).toBe(true)
    expect(BigInt(amsterdam.gasUsed)).toBeLessThan(FIRST_TOUCH_STATE_GAS)
    expect(amsterdam.txStateGas === undefined || amsterdam.txStateGas === '0').toBe(true)
  })

  it('charges new-slot state gas on Amsterdam SSTORE via transaction', async () => {
    const amsterdam = await runTransaction({
      from: STATE_GAS_CALLER,
      to: SSTORE_CONTRACT,
      code: SSTORE_NEW_SLOT_BYTECODE,
      fork: { baseHardfork: 'amsterdam' },
    })
    const osaka = await runTransaction({
      from: STATE_GAS_CALLER,
      to: SSTORE_CONTRACT,
      code: SSTORE_NEW_SLOT_BYTECODE,
      fork: { baseHardfork: 'osaka' },
    })

    expect(amsterdam.success).toBe(true)
    expect(osaka.success).toBe(true)
    expect(BigInt(amsterdam.gasUsed)).toBeGreaterThan(BigInt(osaka.gasUsed))
    expect(BigInt(amsterdam.gasUsed) - BigInt(osaka.gasUsed)).toBeGreaterThan(50_000n)
  })
})
