/**
 * EIP-8038 module — state-access gas (touch / change / create) on Amsterdam.
 *
 * canonicalSource: website/src/explorations/eip-8038/canonical.ts
 *
 * Callers supply SSTORE / SLOAD / EXTCODESIZE bytecode. Catalog describes
 * encoding and fork compare; it does not ship demo programs.
 */
import { LAB_BYTECODE_ADDRESS } from '../../transaction/addresses.js'
import type { EipCapability } from '../../types.js'
import {
  EXTCODESIZE,
  EXTCODESIZE_LAYOUT,
  EXTCODESIZE_NOTE,
  SLOAD,
  SLOAD_LAYOUT,
  SLOAD_NOTE,
  SSTORE,
  SSTORE_LAYOUT,
  SSTORE_NOTE,
} from './input.js'

export const EIP_8038_MODULE: EipCapability = {
  eip: 8038,
  name: 'State-access gas cost update',
  summary:
    'Amsterdam splits state-touching costs into touch, change, and create. Cold SLOAD stays 2_100. Existing-slot SSTORE write jumps to 10_000 (was ~2_800). Creating a slot is EIP-8037 state gas. Compare osaka vs amsterdam. Seed the execution account via accounts[].storage for an existing slot. Paid tx gas / txStateGas still use run_transaction.',
  changeNature: 'repricing',
  runnable: true,
  shapes: ['simulate', 'transaction'],
  keywords: ['state access gas', 'STORAGE_WRITE', 'ACCOUNT_WRITE', 'SSTORE', 'EXTCODESIZE'],
  relatedForks: ['amsterdam', 'glamsterdam'],
  comparison: {
    baselineForkId: 'osaka',
    previewForkId: 'amsterdam',
    note: 'Existing-slot first SSTORE (cold): Amsterdam regular gas 12_100 (2_100 access + 10_000 write) vs Osaka ~5_000. Cold SLOAD stays 2_100. EXTCODESIZE adds an extra 100 for the second read.',
  },
  opcodes: [
    {
      name: 'SSTORE',
      opcode: SSTORE,
      opcodeHex: '0x55',
      effect:
        'Write a storage slot. Existing slot: STORAGE_WRITE 10_000 on Amsterdam vs ~2_800 on Osaka, plus cold access 2_100. New slot: EIP-8037 state gas 97_920 on Amsterdam.',
      immediate: {
        encoding: SSTORE_LAYOUT,
        notes: SSTORE_NOTE,
      },
    },
    {
      name: 'SLOAD',
      opcode: SLOAD,
      opcodeHex: '0x54',
      effect: 'Read a storage slot. Cold access stays 2_100 on both forks.',
      immediate: {
        encoding: SLOAD_LAYOUT,
        notes: SLOAD_NOTE,
      },
    },
    {
      name: 'EXTCODESIZE',
      opcode: EXTCODESIZE,
      opcodeHex: '0x3b',
      effect:
        'Account code-size read. Amsterdam charges COLD_ACCOUNT_ACCESS 3_000 plus WARM_ACCESS 100 for the second database read (Osaka 2_600, no extra 100).',
      immediate: {
        encoding: EXTCODESIZE_LAYOUT,
        notes: EXTCODESIZE_NOTE,
      },
    },
  ],
  status: 'Review',
  forkInclusion: 'Scheduled (Amsterdam)',
  implMaturity: 'Implemented in EthereumJS (Amsterdam, experimental)',
  testMaturity: 'execution-specs / glamsterdam-devnet (v8.1.x)',
  specAnchor: 'EIP-8038',
  notes: `run_bytecode is a VM message-call (call-frame gasUsed). SSTORE succeeds; existing-slot write is ~5_006 vs ~12_106. New-slot Amsterdam also sets stateGasSpilled 97_920 (gasUsed includes the spill). Seed accounts[].storage on ${LAB_BYTECODE_ADDRESS} for an existing slot. Paid gasUsed / txStateGas still need run_transaction. Amsterdam already bundles EIP-8038 in EthereumJS v10 — eips:[8038] is not a pre/post toggle.`,
}
