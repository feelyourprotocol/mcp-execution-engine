import { describe, expect, it } from 'vitest'

import { runBlock } from '../block/runBlock.js'
import { EIP_7778_MODULE } from '../modules/eip-7778/index.js'
import { runTransaction } from '../transaction/runTransaction.js'
import {
  CLEAR_SLOT4,
  REFUND_CALLER,
  REFUND_CONTRACT,
  REWRITE_SLOT4,
  SLOT4_NONZERO,
} from './fixtures/eip7778.js'

describe('EIP-7778 module', () => {
  it('describes block gas accounting without demo programs', () => {
    expect(EIP_7778_MODULE.eip).toBe(7778)
    expect(EIP_7778_MODULE.runnable).toBe(true)
    expect(EIP_7778_MODULE.changeNature).toBe('new-exec-model')
    expect(EIP_7778_MODULE.shapes).toEqual(['block', 'transaction'])
    expect(EIP_7778_MODULE.comparison).toBeUndefined()
    expect(EIP_7778_MODULE.status).toBe('Draft')
    expect(EIP_7778_MODULE.specDate).toBe('2026-01-28')
    expect(EIP_7778_MODULE.specUrl).toContain('3929b1aab57b493417eccec7457d1485eccb9768')
    expect(EIP_7778_MODULE).not.toHaveProperty('scenarios')
  })

  it('keeps a storage-clear refund off the Glamsterdam block count', async () => {
    const amsterdam = await runTransaction({
      from: REFUND_CALLER,
      to: REFUND_CONTRACT,
      code: CLEAR_SLOT4,
      accounts: [{ address: REFUND_CONTRACT, storage: SLOT4_NONZERO }],
      fork: { baseHardfork: 'glamsterdam' },
    })
    const fusaka = await runTransaction({
      from: REFUND_CALLER,
      to: REFUND_CONTRACT,
      code: CLEAR_SLOT4,
      accounts: [{ address: REFUND_CONTRACT, storage: SLOT4_NONZERO }],
      fork: { baseHardfork: 'fusaka' },
    })

    expect(amsterdam.success).toBe(true)
    expect(fusaka.success).toBe(true)
    expect(amsterdam.txRegularGas).toBeDefined()
    expect(BigInt(amsterdam.gasUsed)).toBeLessThan(BigInt(amsterdam.txRegularGas!))
    expect(amsterdam.txStateGas === undefined || amsterdam.txStateGas === '0').toBe(true)
    expect(fusaka.txRegularGas).toBeUndefined()
    expect(BigInt(fusaka.gasUsed)).toBeLessThan(BigInt(amsterdam.txRegularGas!))
  })

  it('matches paid gas and block gas on a rewrite with no refund', async () => {
    const amsterdam = await runTransaction({
      from: REFUND_CALLER,
      to: REFUND_CONTRACT,
      code: REWRITE_SLOT4,
      accounts: [{ address: REFUND_CONTRACT, storage: SLOT4_NONZERO }],
      fork: { baseHardfork: 'glamsterdam' },
    })

    expect(amsterdam.success).toBe(true)
    expect(amsterdam.gasUsed).toBe(amsterdam.txRegularGas)
  })

  it('shows the refund gap on a lab block header, and not on Fusaka', async () => {
    const tx = {
      from: REFUND_CALLER,
      to: REFUND_CONTRACT,
      code: CLEAR_SLOT4,
    }
    const accounts = [{ address: REFUND_CONTRACT, storage: SLOT4_NONZERO }]

    const amsterdam = await runBlock({
      transactions: [tx],
      accounts,
      fork: { baseHardfork: 'glamsterdam' },
    })
    const fusaka = await runBlock({
      transactions: [tx],
      accounts,
      fork: { baseHardfork: 'fusaka' },
    })

    expect(amsterdam.success).toBe(true)
    expect(fusaka.success).toBe(true)
    expect(BigInt(amsterdam.header.gasUsed)).toBeGreaterThan(
      BigInt(amsterdam.transactions[0]!.gasUsed),
    )
    expect(fusaka.header.gasUsed).toBe(fusaka.transactions[0]!.gasUsed)
  })
})
