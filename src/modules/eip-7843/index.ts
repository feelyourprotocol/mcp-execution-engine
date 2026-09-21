/**
 * EIP-7843 module — Glamsterdam executes SLOTNUM (header slot).
 *
 * canonicalSource: website/src/explorations/eip-7843/canonical.ts
 *
 * Callers supply bytecode and a lab header slot via run_block. This catalog
 * describes the opcode; it does not ship demo programs.
 *
 * Glamsterdam in EthereumJS v10 already bundles this EIP, so `eips: [7843]` is
 * accepted but is not a pre/post toggle. run_bytecode uses a mock header
 * (slot 0) — a chosen slot requires run_block.
 */
import type { EipCapability } from '../../types/index.js'
import {
  GLAMSTERDAM_DEVNET_TEST_RELEASE_NAME,
  GLAMSTERDAM_DEVNET_TEST_RELEASE_URL,
} from '../../types/index.js'
import { SLOTNUM, SLOTNUM_GAS } from './opcodes.js'

export const EIP_7843_MODULE: EipCapability = {
  eip: 7843,
  name: 'SLOTNUM opcode',
  summary:
    'Glamsterdam EVM executes SLOTNUM (0x4b): it pushes the execution header slotNumber for 2 gas. Set header.slotNumber on run_block. This server does not ship demo programs.',
  changeNature: 'new-capability',
  runnable: true,
  shapes: ['block'],
  keywords: ['SLOTNUM', 'slot number', 'beacon slot', 'TIMESTAMP', 'header.slotNumber'],
  relatedForks: ['glamsterdam'],
  opcodes: [
    {
      name: 'SLOTNUM',
      opcode: SLOTNUM,
      opcodeHex: '0x4b',
      effect: `Push the block header slotNumber (uint64). Fixed ${SLOTNUM_GAS} gas. No immediate.`,
      immediate: {
        encoding: 'No immediate byte — opcode 0x4b only.',
        notes:
          'Chosen slot: run_block header.slotNumber (Glamsterdam). run_bytecode mock header is slot 0. TIMESTAMP ÷ 12 is not the slot.',
      },
    },
  ],
  status: 'Draft',
  specUrl:
    'https://github.com/ethereum/EIPs/blob/c3bfd4ba41cf0fcbfe8c404f33ba89f5174971e0/EIPS/eip-7843.md',
  specDate: '2026-01-20',
  testReleaseUrl: GLAMSTERDAM_DEVNET_TEST_RELEASE_URL,
  testReleaseName: GLAMSTERDAM_DEVNET_TEST_RELEASE_NAME,
  notes:
    'Glamsterdam already bundles EIP-7843 in EthereumJS v10. Passing eips:[7843] is accepted but does not disable the opcode. Use named fork fusaka (baseline) vs glamsterdam (preview). Observe returnValue / header.slotNumber from run_block — not run_bytecode stack.',
}
