/**
 * EIP-7778 module — block gas accounting without refunds.
 *
 * canonicalSource: website/src/explorations/eip-7778/canonical.ts
 *
 * Callers supply a transaction and prestate. The catalog does not ship demo programs.
 * On Glamsterdam, paid gasUsed can sit below txRegularGas / header gasUsed when a
 * storage-clear refund applies and no new state dominates the block.
 */
import type { EipCapability } from '../../types/index.js'
import {
  GLAMSTERDAM_DEVNET_TEST_RELEASE_NAME,
  GLAMSTERDAM_DEVNET_TEST_RELEASE_URL,
} from '../../types/index.js'

export const EIP_7778_MODULE: EipCapability = {
  eip: 7778,
  name: 'Block gas accounting without refunds',
  summary:
    'Storage-clear refunds still reduce what the sender pays. On Glamsterdam they do not reduce gas counted toward the block. Compare paid gasUsed with txRegularGas, or a lab block header gasUsed with the transaction gasUsed.',
  changeNature: 'new-exec-model',
  runnable: true,
  shapes: ['block', 'transaction'],
  keywords: ['gas refund', 'block gas', 'storage clear', 'SSTORE refund', 'calldata floor'],
  relatedForks: ['glamsterdam'],
  opcodes: [
    {
      name: 'SSTORE (clear slot)',
      opcode: 0x55,
      opcodeHex: '0x55',
      effect:
        'Setting a nonzero slot to zero refunds the sender. On Glamsterdam the block still counts the pre-refund gas when state gas is not the larger dimension.',
      immediate: {
        encoding:
          'PUSH 0, PUSH slot, SSTORE — slot must already be nonzero. Seed it with accounts[].storage. Do not create a new slot in the same transaction.',
        notes:
          'run_transaction: Glamsterdam gasUsed (paid) is below txRegularGas. Fusaka gasUsed matches and txRegularGas is absent. run_block: header.gasUsed stays at the pre-refund count on Glamsterdam; transactions[].gasUsed is what was paid.',
      },
    },
  ],
  status: 'Draft',
  specUrl:
    'https://github.com/ethereum/EIPs/blob/3929b1aab57b493417eccec7457d1485eccb9768/EIPS/eip-7778.md',
  specDate: '2026-01-28',
  testReleaseUrl: GLAMSTERDAM_DEVNET_TEST_RELEASE_URL,
  testReleaseName: GLAMSTERDAM_DEVNET_TEST_RELEASE_NAME,
  notes:
    'Refunds apply to the sender bill only on Glamsterdam. Warm access and restoring a slot to its original value still reduce the block count. If state gas is the larger dimension, header gasUsed hides the refund gap — clear an existing slot and create nothing.',
}
