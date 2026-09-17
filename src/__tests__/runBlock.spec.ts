import { describe, expect, it } from 'vitest'

import { runBlock } from '../block/runBlock.js'
import { FIRST_TOUCH_STATE_GAS } from '../modules/eip-8037/input.js'
import { countEthTransferLogs } from '../simulate/logs.js'
import { EngineError } from '../types.js'
import { PLAIN_CALLER, PLAIN_RECIPIENT } from './fixtures/eip7708.js'
import { EMPTY_RECIPIENT, STATE_GAS_CALLER } from './fixtures/eip8037.js'

const SIMPLE_TRANSFER_INTRINSIC = 21_000n
const SECOND_RECIPIENT = '0x00000000000000000000000000000000000000ab'

/** SLOTNUM; PUSH1 0; MSTORE; PUSH1 32; PUSH1 0; RETURN */
const SLOTNUM_RETURN_BYTECODE = '0x4b60005260206000f3'
const SLOT_CONTRACT = '0x000000000000000000000000000000000000004b'

describe('runBlock', () => {
  it('runs a first-touch transfer on Glamsterdam and snapshots header gas', async () => {
    const result = await runBlock({
      transactions: [{ from: STATE_GAS_CALLER, to: EMPTY_RECIPIENT, value: '1' }],
      fork: { baseHardfork: 'glamsterdam' },
    })

    expect(result.success).toBe(true)
    expect(result.gasUsedScope).toBe('block')
    expect(result.transactions).toHaveLength(1)
    expect(result.transactions[0]?.gasUsed).toBe(
      (SIMPLE_TRANSFER_INTRINSIC + FIRST_TOUCH_STATE_GAS).toString(),
    )
    expect(result.transactions[0]?.txStateGas).toBe(FIRST_TOUCH_STATE_GAS.toString())
    expect(result.header.gasUsed).toBe(result.gasUsed)
    expect(result.header.number).toBe('1')
  })

  it('runs two transfers from the same sender with sequential nonces', async () => {
    const result = await runBlock({
      transactions: [
        { from: PLAIN_CALLER, to: PLAIN_RECIPIENT, value: '1' },
        { from: PLAIN_CALLER, to: SECOND_RECIPIENT, value: '1' },
      ],
      fork: { baseHardfork: 'fusaka' },
    })

    expect(result.success).toBe(true)
    expect(result.transactions).toHaveLength(2)
    expect(result.transactions.every((tx) => tx.success)).toBe(true)
    expect(BigInt(result.gasUsed)).toBe(SIMPLE_TRANSFER_INTRINSIC * 2n)
    expect(countEthTransferLogs(result.transactions[0]?.decodedLogs ?? [])).toBe(0)
  })

  it('emits a decoded EIP-7708 Transfer log on Glamsterdam', async () => {
    const result = await runBlock({
      transactions: [{ from: PLAIN_CALLER, to: PLAIN_RECIPIENT, value: '1' }],
      fork: { baseHardfork: 'glamsterdam' },
    })

    expect(result.success).toBe(true)
    expect(countEthTransferLogs(result.transactions[0]?.decodedLogs ?? [])).toBe(1)
  })

  it('pushes the header slot through SLOTNUM on Glamsterdam', async () => {
    const result = await runBlock({
      transactions: [
        {
          from: PLAIN_CALLER,
          to: SLOT_CONTRACT,
          code: SLOTNUM_RETURN_BYTECODE,
        },
      ],
      header: { slotNumber: '42' },
      fork: { baseHardfork: 'glamsterdam' },
    })

    expect(result.success).toBe(true)
    expect(result.header.slotNumber).toBe('42')
    expect(BigInt(result.transactions[0]?.returnValue ?? '0x')).toBe(42n)
  })

  it('rejects slotNumber on Fusaka', async () => {
    await expect(
      runBlock({
        transactions: [{ from: PLAIN_CALLER, to: PLAIN_RECIPIENT, value: '1' }],
        header: { slotNumber: '42' },
        fork: { baseHardfork: 'fusaka' },
      }),
    ).rejects.toThrow(/EIP-7843/)
  })

  it('sets number and timestamp on the header snapshot', async () => {
    const result = await runBlock({
      transactions: [{ from: PLAIN_CALLER, to: PLAIN_RECIPIENT, value: '1' }],
      header: { number: '99', timestamp: '1704067200' },
      fork: { baseHardfork: 'fusaka' },
    })

    expect(result.header.number).toBe('99')
    expect(result.header.timestamp).toBe('1704067200')
    expect(result.header.slotNumber).toBeUndefined()
  })

  it('rejects an empty transaction list', async () => {
    await expect(runBlock({ transactions: [] })).rejects.toThrow(EngineError)
  })

  it('rejects more than eight transactions', async () => {
    const transactions = Array.from({ length: 9 }, (_, i) => ({
      from: PLAIN_CALLER,
      to: `0x${(0xaa + i).toString(16).padStart(40, '0')}`,
      value: '1',
    }))
    await expect(runBlock({ transactions })).rejects.toThrow(/Too many transactions/)
  })

  it('rejects junk slotNumber', async () => {
    await expect(
      runBlock({
        transactions: [{ from: PLAIN_CALLER, to: PLAIN_RECIPIENT, value: '1' }],
        header: { slotNumber: 'nope' },
        fork: { baseHardfork: 'glamsterdam' },
      }),
    ).rejects.toThrow(/whole number/)
  })

  it('returns a failed payload when a tx is out of gas', async () => {
    const result = await runBlock({
      transactions: [
        {
          from: STATE_GAS_CALLER,
          to: EMPTY_RECIPIENT,
          value: '1',
          gasLimit: '21000',
        },
      ],
      fork: { baseHardfork: 'glamsterdam' },
    })

    expect(result.success).toBe(false)
    expect(result.error?.toLowerCase()).toMatch(/intrinsic|out of gas|gas/)
  })
})
