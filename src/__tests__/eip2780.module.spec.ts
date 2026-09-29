import { describe, expect, it } from 'vitest'

import { EIP_2780_MODULE } from '../modules/eip-2780/index.js'
import { runTransaction } from '../transaction/runTransaction.js'
import { FUNDED_RECIPIENT, STATE_GAS_CALLER } from './fixtures/eip8037.js'

const FUNDED = [{ address: FUNDED_RECIPIENT, balance: '1000000000000000000' }]

describe('EIP-2780 module', () => {
  it('describes the intrinsic split without demo programs', () => {
    expect(EIP_2780_MODULE.eip).toBe(2780)
    expect(EIP_2780_MODULE.runnable).toBe(true)
    expect(EIP_2780_MODULE.changeNature).toBe('repricing')
    expect(EIP_2780_MODULE.shapes).toEqual(['transaction'])
    expect(EIP_2780_MODULE.opcodes).toBeUndefined()
    expect(EIP_2780_MODULE.specDate).toBe('2026-08-04')
  })

  it('keeps a value transfer at 21,000 and drops self and zero-value totals', async () => {
    const send = await runTransaction({
      from: STATE_GAS_CALLER,
      to: FUNDED_RECIPIENT,
      value: '1',
      accounts: FUNDED,
      fork: { baseHardfork: 'glamsterdam' },
    })
    const self = await runTransaction({
      from: STATE_GAS_CALLER,
      to: STATE_GAS_CALLER,
      value: '1',
      fork: { baseHardfork: 'glamsterdam' },
    })
    const zero = await runTransaction({
      from: STATE_GAS_CALLER,
      to: FUNDED_RECIPIENT,
      value: '0',
      accounts: FUNDED,
      fork: { baseHardfork: 'glamsterdam' },
    })
    const fusakaSelf = await runTransaction({
      from: STATE_GAS_CALLER,
      to: STATE_GAS_CALLER,
      value: '1',
      fork: { baseHardfork: 'fusaka' },
    })

    expect(send.success).toBe(true)
    expect(send.gasUsed).toBe('21000')
    expect(send.txStateGas).toBe('0')
    expect(self.success).toBe(true)
    expect(self.gasUsed).toBe('12000')
    expect(zero.success).toBe(true)
    expect(zero.gasUsed).toBe('15000')
    expect(fusakaSelf.success).toBe(true)
    expect(fusakaSelf.gasUsed).toBe('21000')
  })

  it('rejects a negative value instead of wrapping it', async () => {
    await expect(
      runTransaction({
        from: STATE_GAS_CALLER,
        to: FUNDED_RECIPIENT,
        value: '-1',
        accounts: FUNDED,
        fork: { baseHardfork: 'glamsterdam' },
      }),
    ).rejects.toThrow()
  })
})
