import { describe, expect, it } from 'vitest'

import { EIP_7708_MODULE } from '../modules/eip-7708/index.js'
import { countEthTransferLogs } from '../simulate/logs.js'
import { simulateBytecode } from '../simulate/simulateBytecode.js'
import {
  PLAIN_CALLER,
  PLAIN_CALLER,
  PLAIN_RECIPIENT,
  PLAIN_RECIPIENT,
  REVERT_BYTECODE,
  REVERT_CALLEE,
  revertedValueCallBytecodeHex,
  walletForwardBytecodeHex,
} from './fixtures/eip7708.js'

describe('EIP-7708 module', () => {
  it('describes transfer logs without demo programs', () => {
    expect(EIP_7708_MODULE.eip).toBe(7708)
    expect(EIP_7708_MODULE.runnable).toBe(true)
    expect(EIP_7708_MODULE.changeNature).toBe('new-capability')
    expect(EIP_7708_MODULE.comparison).toEqual({
      baselineForkId: 'osaka',
      previewForkId: 'amsterdam',
      note: 'Transfer logs only on preview; same program on baseline has no EIP-7708 logs.',
    })
    expect(EIP_7708_MODULE.opcodes?.[0]?.opcodeHex).toBe(
      '0xfffffffffffffffffffffffffffffffffffffffe',
    )
  })

  it('emits a decoded Transfer log for a plain value-bearing messageCall on Amsterdam', async () => {
    const result = await simulateBytecode({
      messageCall: {
        caller: PLAIN_CALLER,
        to: PLAIN_RECIPIENT,
        value: '1',
      },
      fork: { baseHardfork: 'amsterdam' },
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

  it('has no EIP-7708 Transfer logs on Osaka for the same messageCall', async () => {
    const result = await simulateBytecode({
      messageCall: {
        caller: PLAIN_CALLER,
        to: PLAIN_RECIPIENT,
        value: '1',
      },
      fork: { baseHardfork: 'osaka' },
    })

    expect(result.success).toBe(true)
    expect(countEthTransferLogs(result.decodedLogs ?? [])).toBe(0)
  })

  it('stays silent for zero-value messageCall on Amsterdam', async () => {
    const result = await simulateBytecode({
      messageCall: {
        caller: PLAIN_CALLER,
        to: PLAIN_RECIPIENT,
        value: '0',
      },
      fork: { baseHardfork: 'amsterdam' },
    })

    expect(result.success).toBe(true)
    expect(countEthTransferLogs(result.decodedLogs ?? [])).toBe(0)
  })

  it('logs contract-wallet style CALL transfer on Amsterdam', async () => {
    const wallet = '0x0000000000000000000000000000000000000420'
    const result = await simulateBytecode({
      messageCall: {
        caller: PLAIN_CALLER,
        to: wallet,
        code: walletForwardBytecodeHex(),
      },
      fork: { baseHardfork: 'amsterdam' },
    })

    expect(result.success).toBe(true)
    expect(countEthTransferLogs(result.decodedLogs ?? [])).toBe(1)
  })

  it('stays silent when an inner value CALL reverts on Amsterdam', async () => {
    const wallet = '0x0000000000000000000000000000000000000420'
    const result = await simulateBytecode({
      messageCall: {
        caller: PLAIN_CALLER,
        to: wallet,
        code: revertedValueCallBytecodeHex(),
      },
      accounts: [{ address: REVERT_CALLEE, code: REVERT_BYTECODE }],
      fork: { baseHardfork: 'amsterdam' },
    })

    expect(result.success).toBe(true)
    expect(countEthTransferLogs(result.decodedLogs ?? [])).toBe(0)
  })
})
