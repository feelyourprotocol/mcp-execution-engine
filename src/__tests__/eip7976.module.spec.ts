import { describe, expect, it } from 'vitest'

import { EIP_7976_MODULE } from '../modules/eip-7976/index.js'
import { runTransaction } from '../transaction/runTransaction.js'
import { FUNDED_RECIPIENT, STATE_GAS_CALLER } from './fixtures/eip8037.js'

const FUNDED = [{ address: FUNDED_RECIPIENT, balance: '1000000000000000000' }]
const ZEROS = `0x${'00'.repeat(100)}`
const NONZEROS = `0x${'11'.repeat(100)}`

describe('EIP-7976 module', () => {
  it('describes the calldata floor without demo programs', () => {
    expect(EIP_7976_MODULE.eip).toBe(7976)
    expect(EIP_7976_MODULE.runnable).toBe(true)
    expect(EIP_7976_MODULE.changeNature).toBe('repricing')
    expect(EIP_7976_MODULE.shapes).toEqual(['transaction'])
    expect(EIP_7976_MODULE.opcodes).toBeUndefined()
    expect(EIP_7976_MODULE.specDate).toBe('2026-07-07')
    expect(EIP_7976_MODULE.keywords).not.toContain('7981')
  })

  it('charges 64 gas per byte on Glamsterdam and 10 or 40 on Fusaka', async () => {
    const zerosAmsterdam = await runTransaction({
      from: STATE_GAS_CALLER,
      to: FUNDED_RECIPIENT,
      value: '0',
      data: ZEROS,
      accounts: FUNDED,
      fork: { baseHardfork: 'glamsterdam' },
    })
    const zerosFusaka = await runTransaction({
      from: STATE_GAS_CALLER,
      to: FUNDED_RECIPIENT,
      value: '0',
      data: ZEROS,
      accounts: FUNDED,
      fork: { baseHardfork: 'fusaka' },
    })
    const nonzerosAmsterdam = await runTransaction({
      from: STATE_GAS_CALLER,
      to: FUNDED_RECIPIENT,
      value: '0',
      data: NONZEROS,
      accounts: FUNDED,
      fork: { baseHardfork: 'glamsterdam' },
    })
    const nonzerosFusaka = await runTransaction({
      from: STATE_GAS_CALLER,
      to: FUNDED_RECIPIENT,
      value: '0',
      data: NONZEROS,
      accounts: FUNDED,
      fork: { baseHardfork: 'fusaka' },
    })

    expect(zerosAmsterdam.success).toBe(true)
    expect(zerosAmsterdam.gasUsed).toBe('21400')
    expect(zerosFusaka.success).toBe(true)
    expect(zerosFusaka.gasUsed).toBe('22000')
    expect(nonzerosAmsterdam.success).toBe(true)
    expect(nonzerosAmsterdam.gasUsed).toBe('21400')
    expect(nonzerosFusaka.success).toBe(true)
    expect(nonzerosFusaka.gasUsed).toBe('25000')
  })

  it('does not apply the floor to an empty calldata call', async () => {
    const result = await runTransaction({
      from: STATE_GAS_CALLER,
      to: FUNDED_RECIPIENT,
      value: '0',
      accounts: FUNDED,
      fork: { baseHardfork: 'glamsterdam' },
    })
    expect(result.success).toBe(true)
    expect(result.gasUsed).toBe('15000')
  })

  it('rejects junk calldata and a limit below the floor', async () => {
    await expect(
      runTransaction({
        from: STATE_GAS_CALLER,
        to: FUNDED_RECIPIENT,
        value: '0',
        data: 'zz',
        accounts: FUNDED,
        fork: { baseHardfork: 'glamsterdam' },
      }),
    ).rejects.toThrow()

    const undersized = await runTransaction({
      from: STATE_GAS_CALLER,
      to: FUNDED_RECIPIENT,
      value: '0',
      data: ZEROS,
      gasLimit: '1000',
      accounts: FUNDED,
      fork: { baseHardfork: 'glamsterdam' },
    })
    expect(undersized.success).toBe(false)
  })
})
