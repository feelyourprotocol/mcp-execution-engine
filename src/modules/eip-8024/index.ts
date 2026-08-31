import type { EipCapability } from '../../types.js'
import {
  DUPN,
  DUPN_SWAPN_MAX_DEPTH,
  DUPN_SWAPN_MIN_DEPTH,
  EXCHANGE,
  EXCHANGE_XOR_MASK,
  SWAPN,
} from './opcodes.js'

/**
 * EIP-8024 module — Amsterdam executes DUPN, SWAPN, EXCHANGE.
 *
 * Callers supply bytecode. This catalog describes the opcodes and encoding so
 * agents can construct programs; it does not ship demo programs.
 *
 * Amsterdam in EthereumJS v10 already bundles this EIP, so `eips: [8024]` is
 * accepted but is not a pre/post toggle.
 */
export const EIP_8024_MODULE: EipCapability = {
  eip: 8024,
  name: 'Backward compatible SWAPN, DUPN, EXCHANGE',
  summary:
    'Amsterdam EVM executes DUPN, SWAPN, and EXCHANGE. Supply any bytecode; this server does not ship demo programs.',
  changeNature: 'new-capability',
  runnable: true,
  shapes: ['simulate'],
  keywords: ['DUPN', 'SWAPN', 'EXCHANGE', 'stack opcodes', 'stack too deep', 'eip-8024'],
  relatedForks: ['amsterdam', 'glamsterdam'],
  comparison: {
    baselineForkId: 'osaka',
    previewForkId: 'amsterdam',
    note: 'Opcodes 0xe6–0xe8 are invalid on baseline; valid on preview.',
  },
  opcodes: [
    {
      name: 'DUPN',
      opcode: DUPN,
      opcodeHex: '0xe6',
      effect: 'Copy the stack item at depth n onto the top.',
      immediate: {
        encoding: 'n = (immediate + 145) mod 256; immediate = (n + 111) mod 256',
        minDepth: DUPN_SWAPN_MIN_DEPTH,
        maxDepth: DUPN_SWAPN_MAX_DEPTH,
        notes: 'Immediate bytes 91–127 are reserved (JUMPDEST / PUSH safety).',
      },
    },
    {
      name: 'SWAPN',
      opcode: SWAPN,
      opcodeHex: '0xe7',
      effect:
        'Swap the top stack item with the item at depth n + 1 (same immediate family as DUPN).',
      immediate: {
        encoding: 'n = (immediate + 145) mod 256; immediate = (n + 111) mod 256',
        minDepth: DUPN_SWAPN_MIN_DEPTH,
        maxDepth: DUPN_SWAPN_MAX_DEPTH,
        notes: 'Needs at least n + 1 stack items. Immediate bytes 91–127 are reserved.',
      },
    },
    {
      name: 'EXCHANGE',
      opcode: EXCHANGE,
      opcodeHex: '0xe8',
      effect: 'Swap two stack items below the top (depth 1 cannot be an operand).',
      immediate: {
        encoding: `For depths A,B (1 = top): n = min(A,B) - 1, m = max(A,B) - 1. If m <= 16: q = n - 1, r = m - 1; else q = 29 - m, r = n - 1. k = 16*q + r; immediate = k XOR ${EXCHANGE_XOR_MASK}.`,
        minDepth: 2,
        notes: 'Depth 1 is the top and is not an EXCHANGE operand.',
      },
    },
  ],
  status: 'Review',
  forkInclusion: 'Scheduled',
  implMaturity: 'Implemented in EthereumJS (engine module)',
  testMaturity: 'Opcode execution tests',
  specAnchor: 'EIP-8024',
  notes:
    'Amsterdam already bundles EIP-8024 in EthereumJS v10. Passing eips:[8024] is accepted but does not disable the opcodes. Use named fork osaka (baseline) vs amsterdam (preview) to compare behavior.',
}
