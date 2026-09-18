/**
 * EIP-7928 module — block-level access lists (BAL).
 *
 * canonicalSource: website/src/explorations/eip-7928/canonical.ts
 *
 * Callers derive BAL JSON from a lab block via `generate` (Glamsterdam). Pass an
 * existing BAL to `inspect` for encoding, structure, and hash checks — not
 * mainnet block replay.
 */
import type { EipCapability } from '../../types/index.js'
import { GLAMSTERDAM_DEVNET_TEST_RELEASE_URL } from '../../types/index.js'

export const EIP_7928_MODULE: EipCapability = {
  eip: 7928,
  name: 'Block-level access lists',
  summary:
    'Glamsterdam blocks commit to a block access list (BAL). Use generate with the same lab block inputs as run_block (1–8 txs, BYOS accounts) to derive BAL JSON and hash; use inspect on caller-supplied BAL for structure and hash layers without chain state.',
  changeNature: 'new-structure',
  runnable: true,
  shapes: ['generate', 'inspect'],
  keywords: ['7928', 'bal', 'block access list', 'blockAccessListHash', 'generate', 'inspect'],
  relatedForks: ['glamsterdam'],
  status: 'Review',
  specUrl:
    'https://github.com/ethereum/EIPs/blob/6c666b8d646df8ea6dcef9638de7b48e3c45ab96/EIPS/eip-7928.md',
  specDate: '2026-07-09',
  testReleaseUrl: GLAMSTERDAM_DEVNET_TEST_RELEASE_URL,
  notes:
    'Isolated lab only — cannot verify the BAL of a mainnet block without archive parent state. generate runs the same VM path as run_block with generate:true and returns the list; inspect wraps @ethereumjs/util validators (not consensus replay).',
}
