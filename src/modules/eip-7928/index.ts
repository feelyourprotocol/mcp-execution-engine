/**
 * EIP-7928 module — block-level access lists (BAL).
 *
 * canonicalSource: website/src/explorations/eip-7928/canonical.ts
 *
 * Callers derive BAL JSON from a lab block via `generate` (Amsterdam). Pass an
 * existing BAL to `inspect` for encoding, structure, and hash checks — not
 * mainnet block replay.
 */
import type { EipCapability } from '../../types.js'

export const EIP_7928_MODULE: EipCapability = {
  eip: 7928,
  name: 'Block-level access lists',
  summary:
    'Amsterdam blocks commit to a block access list (BAL). Use generate with the same lab block inputs as run_block (1–8 txs, BYOS accounts) to derive BAL JSON and hash; use inspect on caller-supplied BAL for structure and hash layers without chain state.',
  changeNature: 'new-structure',
  runnable: true,
  shapes: ['generate', 'inspect'],
  keywords: ['7928', 'bal', 'block access list', 'blockAccessListHash', 'generate', 'inspect'],
  relatedForks: ['amsterdam', 'glamsterdam'],
  status: 'Review',
  forkInclusion: 'Scheduled (Amsterdam)',
  implMaturity: 'Implemented in EthereumJS (Amsterdam)',
  testMaturity: 'EthereumJS BAL validation; FYP MCP generate/inspect tests',
  specAnchor: 'EIP-7928',
  notes:
    'Isolated lab only — cannot verify the BAL of a mainnet block without archive parent state. generate runs the same VM path as run_block with generate:true and returns the list; inspect wraps @ethereumjs/util validators (not consensus replay).',
}
