import { describe, expect, it } from 'vitest'

import { FIRST_TOUCH_STATE_GAS } from '../modules/eip-8037/input.js'
import { countEthTransferLogs } from '../simulate/logs.js'
import { runTransaction } from '../transaction/runTransaction.js'
import { PLAIN_CALLER, PLAIN_RECIPIENT } from './fixtures/eip7708.js'
import { EMPTY_RECIPIENT, FUNDED_RECIPIENT, STATE_GAS_CALLER } from './fixtures/eip8037.js'

const SIMPLE_TRANSFER_INTRINSIC = 21_000n

describe('runTransaction', () => {
  it('charges 21000 for a simple value transfer on Fusaka', async () => {
    const result = await runTransaction({
      from: PLAIN_CALLER,
      to: PLAIN_RECIPIENT,
      value: '1',
      fork: { baseHardfork: 'fusaka' },
    })

    expect(result.success).toBe(true)
    expect(result.gasUsedScope).toBe('transaction')
    expect(result.gasUsed).toBe(SIMPLE_TRANSFER_INTRINSIC.toString())
    expect(result.txStateGas).toBeUndefined()
    expect(result.error).toBeNull()
  })

  it('includes first-touch state gas in paid gas on Glamsterdam', async () => {
    const result = await runTransaction({
      from: STATE_GAS_CALLER,
      to: EMPTY_RECIPIENT,
      value: '1',
      fork: { baseHardfork: 'glamsterdam' },
    })

    expect(result.success).toBe(true)
    expect(result.gasUsed).toBe((SIMPLE_TRANSFER_INTRINSIC + FIRST_TOUCH_STATE_GAS).toString())
    expect(result.txStateGas).toBe(FIRST_TOUCH_STATE_GAS.toString())
    expect(result.txRegularGas).toBe(SIMPLE_TRANSFER_INTRINSIC.toString())
  })

  it('fails Glamsterdam first-touch at gasLimit 21000 and succeeds on Fusaka', async () => {
    const amsterdam = await runTransaction({
      from: STATE_GAS_CALLER,
      to: EMPTY_RECIPIENT,
      value: '1',
      gasLimit: '21000',
      fork: { baseHardfork: 'glamsterdam' },
    })
    const osaka = await runTransaction({
      from: STATE_GAS_CALLER,
      to: EMPTY_RECIPIENT,
      value: '1',
      gasLimit: '21000',
      fork: { baseHardfork: 'fusaka' },
    })

    expect(amsterdam.success).toBe(false)
    expect(amsterdam.error?.toLowerCase()).toMatch(/intrinsic|out of gas|gas/)
    expect(osaka.success).toBe(true)
    expect(osaka.gasUsed).toBe(SIMPLE_TRANSFER_INTRINSIC.toString())
  })

  it('collapses first-touch state gas when the recipient is already funded', async () => {
    const amsterdam = await runTransaction({
      from: STATE_GAS_CALLER,
      to: FUNDED_RECIPIENT,
      value: '1',
      accounts: [{ address: FUNDED_RECIPIENT, balance: '1000000000000000000' }],
      fork: { baseHardfork: 'glamsterdam' },
    })
    const osaka = await runTransaction({
      from: STATE_GAS_CALLER,
      to: FUNDED_RECIPIENT,
      value: '1',
      accounts: [{ address: FUNDED_RECIPIENT, balance: '1000000000000000000' }],
      fork: { baseHardfork: 'fusaka' },
    })

    expect(amsterdam.success).toBe(true)
    expect(osaka.success).toBe(true)
    expect(amsterdam.gasUsed).toBe(osaka.gasUsed)
    expect(amsterdam.txStateGas === undefined || amsterdam.txStateGas === '0').toBe(true)
  })

  it('emits a decoded EIP-7708 Transfer log on Glamsterdam', async () => {
    const result = await runTransaction({
      from: PLAIN_CALLER,
      to: PLAIN_RECIPIENT,
      value: '1',
      fork: { baseHardfork: 'glamsterdam' },
    })

    expect(result.success).toBe(true)
    expect(countEthTransferLogs(result.decodedLogs ?? [])).toBe(1)
    expect(result.decodedLogs?.[0]?.decoration).toEqual(
      expect.objectContaining({
        kind: 'eth-transfer',
        from: PLAIN_CALLER,
        to: PLAIN_RECIPIENT,
        valueWei: '1',
      }),
    )
  })

  it('rejects missing from', async () => {
    await expect(runTransaction({ from: '', to: PLAIN_RECIPIENT, value: '1' })).rejects.toThrow(
      /from/i,
    )
  })
})
