/**
 * EIP-7843 module — Amsterdam executes SLOTNUM (header slot).
 *
 * canonicalSource: website/src/explorations/eip-7843/canonical.ts
 *
 * Callers supply bytecode and a lab header slot via run_block. This catalog
 * describes the opcode; it does not ship demo programs.
 *
 * Amsterdam in EthereumJS v10 already bundles this EIP, so `eips: [7843]` is
 * accepted but is not a pre/post toggle. run_bytecode uses a mock header
 * (slot 0) — a chosen slot requires run_block.
 */
import type { EipCapability } from '../../types.js'
import { SLOTNUM, SLOTNUM_GAS } from './opcodes.js'

export const EIP_7843_MODULE: EipCapability = {
  eip: 7843,
  name: 'SLOTNUM opcode',
  summary:
    'Amsterdam EVM executes SLOTNUM (0x4b): it pushes the execution header slotNumber for 2 gas. Set header.slotNumber on run_block. This server does not ship demo programs.',
  changeNature: 'new-capability',
  runnable: true,
  shapes: ['block'],
  keywords: ['SLOTNUM', 'slot number', 'beacon slot', 'TIMESTAMP', 'header.slotNumber'],
  relatedForks: ['amsterdam', 'glamsterdam'],
  opcodes: [
    {
      name: 'SLOTNUM',
      opcode: SLOTNUM,
      opcodeHex: '0x4b',
      effect: `Push the block header slotNumber (uint64). Fixed ${SLOTNUM_GAS} gas. No immediate.`,
      immediate: {
        encoding: 'No immediate byte — opcode 0x4b only.',
        notes:
          'Chosen slot: run_block header.slotNumber (Amsterdam). run_bytecode mock header is slot 0. TIMESTAMP ÷ 12 is not the slot.',
      },
    },
  ],
  status: 'Review',
  forkInclusion: 'Scheduled (Amsterdam)',
  implMaturity: 'Implemented in EthereumJS (Amsterdam)',
  testMaturity: 'EthereumJS eip7843 opcode tests; glamsterdam-devnet EST',
  specAnchor: 'EIP-7843',
  notes:
    'Amsterdam already bundles EIP-7843 in EthereumJS v10. Passing eips:[7843] is accepted but does not disable the opcode. Use named fork osaka (baseline) vs amsterdam (preview). Observe returnValue / header.slotNumber from run_block — not run_bytecode stack.',
}
