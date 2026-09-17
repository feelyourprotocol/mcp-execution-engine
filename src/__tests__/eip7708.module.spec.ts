import { describe, expect, it } from 'vitest'

import { EIP_7708_MODULE } from '../modules/eip-7708/index.js'
import { countEthTransferLogs } from '../simulate/logs.js'
import { runTransaction } from '../transaction/runTransaction.js'
import {
  PLAIN_CALLER,
  PLAIN_RECIPIENT,
  REVERT_BYTECODE,
  REVERT_CALLEE,
  revertedValueCallBytecodeHex,
  WALLET_ADDRESS,
  walletForwardBytecodeHex,
} from './fixtures/eip7708.js'

describe('EIP-7708 module', () => {
  it('describes transfer logs without demo programs', () => {
    expect(EIP_7708_MODULE.eip).toBe(7708)
    expect(EIP_7708_MODULE.runnable).toBe(true)
    expect(EIP_7708_MODULE.changeNature).toBe('new-capability')
    expect(EIP_7708_MODULE.shapes).toEqual(['transaction', 'simulate'])
    expect(EIP_7708_MODULE.comparison).toBeUndefined()
    expect(EIP_7708_MODULE.opcodes?.[0]?.opcodeHex).toBe(
      '0xfffffffffffffffffffffffffffffffffffffffe',
    )
  })

  it('emits a decoded Transfer log for a plain value transaction on Glamsterdam', async () => {
    const result = await runTransaction({
      from: PLAIN_CALLER,
      to: PLAIN_RECIPIENT,
      value: '1',
      fork: { baseHardfork: 'glamsterdam' },
    })

    expect(result.success).toBe(true)
    expect(result.logs?.length).toBeGreaterThan(0)
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

  it('has no EIP-7708 Transfer logs on Fusaka for the same transaction', async () => {
    const result = await runTransaction({
      from: PLAIN_CALLER,
      to: PLAIN_RECIPIENT,
      value: '1',
      fork: { baseHardfork: 'fusaka' },
    })

    expect(result.success).toBe(true)
    expect(countEthTransferLogs(result.decodedLogs ?? [])).toBe(0)
  })

  it('stays silent for zero-value transaction on Glamsterdam', async () => {
    const result = await runTransaction({
      from: PLAIN_CALLER,
      to: PLAIN_RECIPIENT,
      value: '0',
      fork: { baseHardfork: 'glamsterdam' },
    })

    expect(result.success).toBe(true)
    expect(countEthTransferLogs(result.decodedLogs ?? [])).toBe(0)
  })

  it('logs contract-wallet style CALL transfer on Glamsterdam', async () => {
    const result = await runTransaction({
      from: PLAIN_CALLER,
      to: WALLET_ADDRESS,
      code: walletForwardBytecodeHex(),
      fork: { baseHardfork: 'glamsterdam' },
    })

    expect(result.success).toBe(true)
    expect(countEthTransferLogs(result.decodedLogs ?? [])).toBe(1)
  })

  it('stays silent when an inner value CALL reverts on Glamsterdam', async () => {
    const result = await runTransaction({
      from: PLAIN_CALLER,
      to: WALLET_ADDRESS,
      code: revertedValueCallBytecodeHex(),
      accounts: [{ address: REVERT_CALLEE, code: REVERT_BYTECODE }],
      fork: { baseHardfork: 'glamsterdam' },
    })

    expect(result.success).toBe(true)
    expect(countEthTransferLogs(result.decodedLogs ?? [])).toBe(0)
  })
})
