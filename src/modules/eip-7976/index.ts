/**
 * EIP-7976 module — calldata floor on Glamsterdam.
 *
 * canonicalSource: website/src/explorations/eip-7976/canonical.ts
 *
 * Callers supply calldata. Catalog describes the floor; it does not ship demo transactions.
 * EIP-7981 (access-list bytes at the same rate) is coverage `supported` — pass
 * `accessList` on this verb; leave 7981 out of `eips`.
 */
import type { EipCapability } from '../../types/index.js'
import {
  GLAMSTERDAM_DEVNET_TEST_RELEASE_NAME,
  GLAMSTERDAM_DEVNET_TEST_RELEASE_URL,
} from '../../types/index.js'

export const EIP_7976_MODULE: EipCapability = {
  eip: 7976,
  name: 'Increase calldata floor cost',
  summary:
    'On Glamsterdam a data-heavy transaction pays 64 gas per calldata byte, zero and nonzero alike. A call that does enough work keeps 4 gas per zero byte and 16 per nonzero byte. Compare fusaka (10 per zero byte, 40 per nonzero) vs glamsterdam with run_transaction and read gasUsed. Prefund the recipient so the run does not also create an account.',
  changeNature: 'repricing',
  runnable: true,
  shapes: ['transaction'],
  keywords: ['7976', 'calldata', 'floor', '64', '7623'],
  relatedForks: ['glamsterdam'],
  status: 'Review',
  specUrl:
    'https://github.com/ethereum/EIPs/blob/c998ef94eb16a6af8a9b8e2084f947b17ea14865/EIPS/eip-7976.md',
  specDate: '2026-07-07',
  testReleaseUrl: GLAMSTERDAM_DEVNET_TEST_RELEASE_URL,
  testReleaseName: GLAMSTERDAM_DEVNET_TEST_RELEASE_NAME,
  notes:
    'gasUsed is the observation. The floor binds when the call does little besides carrying data. EIP-7981 prices access-list bytes at the same 64 gas rate on Glamsterdam — use accessList on run_transaction; leave 7981 out of eips.',
}
