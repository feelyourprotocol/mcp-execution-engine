/**
 * EIP-7928 module — block-level access lists (BAL).
 *
 * canonicalSource: website/src/explorations/eip-7928/canonical.ts
 *
 * Callers derive BAL JSON from a lab block via `generate_artifact` (Glamsterdam). Pass an
 * existing BAL to `inspect_artifact` for encoding, structure, and hash checks — not
 * mainnet block replay.
 */
import type { EipCapability } from '../../types/index.js'
import {
  GLAMSTERDAM_DEVNET_TEST_RELEASE_NAME,
  GLAMSTERDAM_DEVNET_TEST_RELEASE_URL,
} from '../../types/index.js'

export const EIP_7928_MODULE: EipCapability = {
  eip: 7928,
  name: 'Block-level access lists',
  summary:
    'Glamsterdam blocks commit to a block access list (BAL). Use generate_artifact with the same lab block inputs as run_block (1–8 txs, BYOS accounts) to derive BAL JSON and hash; use inspect_artifact on caller-supplied BAL for structure and hash layers without chain state.',
  changeNature: 'new-structure',
  runnable: true,
  shapes: ['generate', 'inspect'],
  keywords: [
    '7928',
    'bal',
    'block access list',
    'blockAccessListHash',
    'generate',
    'inspect',
    'generate_artifact',
    'inspect_artifact',
  ],
  relatedForks: ['glamsterdam'],
  status: 'Review',
  specUrl:
    'https://github.com/ethereum/EIPs/blob/6c666b8d646df8ea6dcef9638de7b48e3c45ab96/EIPS/eip-7928.md',
  specDate: '2026-07-09',
  testReleaseUrl: GLAMSTERDAM_DEVNET_TEST_RELEASE_URL,
  testReleaseName: GLAMSTERDAM_DEVNET_TEST_RELEASE_NAME,
  notes:
    'Isolated lab only — cannot verify the BAL of a mainnet block without archive parent state. generate_artifact runs the same VM path as run_block with generate:true and returns the list; inspect_artifact wraps @ethereumjs/util validators (not consensus replay).',
}
