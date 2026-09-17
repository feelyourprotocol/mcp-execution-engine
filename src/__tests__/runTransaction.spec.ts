import { describe, expect, it } from 'vitest'

import { FIRST_TOUCH_STATE_GAS } from '../modules/eip-8037/input.js'
import { countEthTransferLogs } from '../simulate/logs.js'
import { runTransaction } from '../transaction/runTransaction.js'
import { PLAIN_CALLER, PLAIN_RECIPIENT } from './fixtures/eip7708.js'
import { EMPTY_RECIPIENT, FUNDED_RECIPIENT, STATE_GAS_CALLER } from './fixtures/eip8037.js'

const SIMPLE_TRANSFER_INTRINSIC = 21_000n
const LEGACY_RUNTIME_LIMIT = 24_576
const GLAMSTERDAM_RUNTIME_LIMIT = 65_536
const LEGACY_INITCODE_LIMIT = 49_152
const GLAMSTERDAM_INITCODE_LIMIT = 131_072

function runtimeReturningInitcode(size: number): string {
  return `0x7f${BigInt(size).toString(16).padStart(64, '0')}6000f3`
}

function zeroInitcode(size: number): string {
  return `0x${'00'.repeat(size)}`
}

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

  it('creates a contract when to is omitted and reports its address and code size', async () => {
    const result = await runTransaction({
      from: PLAIN_CALLER,
      data: runtimeReturningInitcode(1),
      fork: { baseHardfork: 'fusaka' },
    })

    expect(result.success).toBe(true)
    expect(result.createdAddress).toMatch(/^0x[0-9a-f]{40}$/)
    expect(result.deployedCodeSize).toBe(1)
  })

  it('shows EIP-7954 accepting runtime code one byte beyond the old limit', async () => {
    const data = runtimeReturningInitcode(LEGACY_RUNTIME_LIMIT + 1)
    const fusaka = await runTransaction({
      from: PLAIN_CALLER,
      data,
      gasLimit: '16000000',
      fork: { baseHardfork: 'fusaka' },
    })
    const glamsterdam = await runTransaction({
      from: PLAIN_CALLER,
      data,
      gasLimit: '40000000',
      fork: { baseHardfork: 'glamsterdam' },
    })

    expect(fusaka.success).toBe(false)
    expect(fusaka.error).toMatch(/maximum code size/i)
    expect(fusaka.createdAddress).toBeUndefined()
    expect(glamsterdam.success).toBe(true)
    expect(glamsterdam.deployedCodeSize).toBe(LEGACY_RUNTIME_LIMIT + 1)
  })

  it('enforces the new EIP-7954 runtime-code limit', async () => {
    const atLimit = await runTransaction({
      from: PLAIN_CALLER,
      data: runtimeReturningInitcode(GLAMSTERDAM_RUNTIME_LIMIT),
      gasLimit: '110000000',
      fork: { baseHardfork: 'glamsterdam' },
    })
    const beyondLimit = await runTransaction({
      from: PLAIN_CALLER,
      data: runtimeReturningInitcode(GLAMSTERDAM_RUNTIME_LIMIT + 1),
      gasLimit: '110000000',
      fork: { baseHardfork: 'glamsterdam' },
    })

    expect(atLimit.success).toBe(true)
    expect(atLimit.deployedCodeSize).toBe(GLAMSTERDAM_RUNTIME_LIMIT)
    expect(beyondLimit.success).toBe(false)
    expect(beyondLimit.error).toMatch(/maximum code size/i)
  })

  it('shows the old and new EIP-7954 initcode boundaries', async () => {
    const crossesOldLimit = zeroInitcode(LEGACY_INITCODE_LIMIT + 1)
    const fusaka = await runTransaction({
      from: PLAIN_CALLER,
      data: crossesOldLimit,
      fork: { baseHardfork: 'fusaka' },
    })
    const glamsterdam = await runTransaction({
      from: PLAIN_CALLER,
      data: crossesOldLimit,
      gasLimit: '4000000',
      fork: { baseHardfork: 'glamsterdam' },
    })
    const beyondNewLimit = await runTransaction({
      from: PLAIN_CALLER,
      data: zeroInitcode(GLAMSTERDAM_INITCODE_LIMIT + 1),
      fork: { baseHardfork: 'glamsterdam' },
    })

    expect(fusaka.success).toBe(false)
    expect(fusaka.error).toMatch(/initcode size/i)
    expect(glamsterdam.success).toBe(true)
    expect(glamsterdam.deployedCodeSize).toBe(0)
    expect(beyondNewLimit.success).toBe(false)
    expect(beyondNewLimit.error).toMatch(/initcode size/i)
  })

  it('rejects missing from', async () => {
    await expect(runTransaction({ from: '', to: PLAIN_RECIPIENT, value: '1' })).rejects.toThrow(
      /from/i,
    )
  })

  it('rejects preinstalled code without a transaction recipient', async () => {
    await expect(runTransaction({ from: PLAIN_CALLER, code: '0x00' })).rejects.toThrow(
      /code requires to/i,
    )
  })
})
