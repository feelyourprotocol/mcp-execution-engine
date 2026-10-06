import { describe, expect, it } from 'vitest'

import { runBlock } from '../block/runBlock.js'
import { sumRegularGasParts } from '../transaction/regularGas.js'
import { runTransaction } from '../transaction/runTransaction.js'
import { PLAIN_CALLER, PLAIN_RECIPIENT } from './fixtures/eip7708.js'
import { EMPTY_RECIPIENT, FUNDED_RECIPIENT, STATE_GAS_CALLER } from './fixtures/eip8037.js'

const GLAMSTERDAM_REGULAR_TRANSFER = 21_000n

describe('regularGas breakdown', () => {
  it('splits an existing-account 1 wei transfer on Glamsterdam into 21000 regular parts', async () => {
    const result = await runTransaction({
      from: PLAIN_CALLER,
      to: FUNDED_RECIPIENT,
      value: '1',
      accounts: [{ address: FUNDED_RECIPIENT, balance: '1000000000000000000' }],
      fork: { baseHardfork: 'glamsterdam' },
    })

    expect(result.success).toBe(true)
    expect(result.recipientPrestate).toBe('existing')
    expect(result.regularGas).toBeDefined()
    const parts = result.regularGas!
    expect(parts.total).toBe(result.txRegularGas)
    expect(sumRegularGasParts(parts)).toBe(BigInt(parts.total))
    expect(BigInt(parts.base)).toBe(12_000n)
    expect(BigInt(parts.recipient)).toBe(3_000n)
    expect(BigInt(parts.value)).toBe(6_000n)
    expect(BigInt(parts.creation)).toBe(0n)
    expect(BigInt(parts.calldata)).toBe(0n)
    expect(BigInt(parts.floorUplift)).toBe(0n)
    expect(BigInt(parts.execution)).toBe(0n)
  })

  it('self-send has zero recipient and value parts and 12000 total regular', async () => {
    const result = await runTransaction({
      from: PLAIN_CALLER,
      to: PLAIN_CALLER,
      value: '1',
      fork: { baseHardfork: 'glamsterdam' },
    })

    expect(result.success).toBe(true)
    expect(result.recipientPrestate).toBe('self')
    expect(result.regularGas?.total).toBe('12000')
    expect(result.regularGas?.recipient).toBe('0')
    expect(result.regularGas?.value).toBe('0')
    expect(sumRegularGasParts(result.regularGas!)).toBe(12_000n)
  })

  it('marks first-touch recipients as created', async () => {
    const result = await runTransaction({
      from: STATE_GAS_CALLER,
      to: EMPTY_RECIPIENT,
      value: '1',
      fork: { baseHardfork: 'glamsterdam' },
    })

    expect(result.success).toBe(true)
    expect(result.recipientPrestate).toBe('created')
    expect(result.regularGas?.total).toBe(GLAMSTERDAM_REGULAR_TRANSFER.toString())
  })

  it('uses floorUplift when calldata raises the floor above intrinsic', async () => {
    const result = await runTransaction({
      from: PLAIN_CALLER,
      to: FUNDED_RECIPIENT,
      value: '0',
      data: '0x01',
      accounts: [{ address: FUNDED_RECIPIENT, balance: '1000000000000000000' }],
      fork: { baseHardfork: 'glamsterdam' },
    })

    expect(result.success).toBe(true)
    expect(result.regularGas).toBeDefined()
    expect(BigInt(result.regularGas!.floorUplift)).toBeGreaterThan(0n)
    expect(result.regularGas!.calldata).toBe('0')
    expect(sumRegularGasParts(result.regularGas!)).toBe(BigInt(result.regularGas!.total))
  })

  it('returns no regularGasDelta when two block transfers match', async () => {
    const result = await runBlock({
      fork: { baseHardfork: 'glamsterdam' },
      accounts: [
        { address: PLAIN_CALLER, balance: '1000000000000000000' },
        { address: PLAIN_RECIPIENT, balance: '1' },
        { address: '0x00000000000000000000000000000000000000ab', balance: '1' },
      ],
      transactions: [
        { from: PLAIN_CALLER, to: PLAIN_RECIPIENT, value: '1' },
        { from: PLAIN_CALLER, to: '0x00000000000000000000000000000000000000ab', value: '1' },
      ],
    })

    expect(result.success).toBe(true)
    expect(result.transactions[0]?.regularGas?.total).toBe(
      result.transactions[1]?.regularGas?.total,
    )
    expect(result.regularGasDelta).toBeUndefined()
  })

  it('names regularGasDelta when calldata differs between two block txs', async () => {
    const recipient = FUNDED_RECIPIENT
    const result = await runBlock({
      fork: { baseHardfork: 'glamsterdam' },
      accounts: [{ address: recipient, balance: '1000000000000000000000' }],
      transactions: [
        { from: PLAIN_CALLER, to: recipient, value: '1' },
        { from: PLAIN_CALLER, to: recipient, value: '1', data: '0x01' },
      ],
    })

    expect(result.success).toBe(true)
    expect(result.transactions[0]?.regularGas?.total).not.toBe(
      result.transactions[1]?.regularGas?.total,
    )
    expect(result.regularGasDelta?.length).toBeGreaterThan(0)
    const partNames = result.regularGasDelta!.map((d) => d.part)
    expect(
      partNames.some((p) => p === 'calldata' || p === 'floorUplift' || p === 'execution'),
    ).toBe(true)
  })
})
