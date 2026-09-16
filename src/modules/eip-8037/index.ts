/**
 * EIP-8037 module — state-creation gas on Amsterdam.
 *
 * canonicalSource: website/src/explorations/eip-8037/canonical.ts
 *
 * Callers supply a transaction (or SSTORE bytecode via run_bytecode). Catalog
 * describes when extra gasUsed appears; it does not ship demo programs.
 */
import type { EipCapability } from '../../types.js'
import { FIRST_TOUCH_NOTE, NEW_SLOT_NOTE, TRANSACTION_LAYOUT } from './input.js'

export const EIP_8037_MODULE: EipCapability = {
  eip: 8037,
  name: 'State creation gas cost increase',
  summary:
    'Amsterdam splits gas into execution and state dimensions. Creating a new account or storage slot charges state gas. Run a value-bearing transaction (run_transaction) or SSTORE bytecode; compare osaka vs amsterdam. Lead with gasUsed (paid tx gas) and txStateGas on Amsterdam.',
  changeNature: 'new-exec-model',
  runnable: true,
  shapes: ['transaction', 'simulate'],
  keywords: [
    'state gas',
    'two-dimensional gas',
    'cost per state byte',
    'first-touch transfer',
    'gas limit 21000',
  ],
  relatedForks: ['amsterdam', 'glamsterdam'],
  opcodes: [
    {
      name: 'First-touch value call',
      opcode: 0xf1,
      opcodeHex: '0xf1',
      effect:
        'Nonzero CALL value to an empty account charges 120 × 1530 = 183600 state gas on Amsterdam.',
      immediate: {
        encoding: TRANSACTION_LAYOUT,
        notes: FIRST_TOUCH_NOTE,
      },
    },
    {
      name: 'SSTORE (new slot)',
      opcode: 0x55,
      opcodeHex: '0x55',
      effect:
        'First write to an empty storage slot charges 64 × 1530 = 97920 state gas on Amsterdam.',
      immediate: {
        encoding:
          'PUSH value, PUSH slot, SSTORE — empty slot (no prior storage). Run as a tx to that code, or as bytecode.',
        notes: NEW_SLOT_NOTE,
      },
    },
  ],
  status: 'Review',
  forkInclusion: 'Scheduled (Amsterdam)',
  implMaturity: 'Implemented in EthereumJS (Amsterdam, experimental)',
  testMaturity: 'execution-specs / glamsterdam-devnet (v8.1.x)',
  specAnchor: 'EIP-8037',
  notes:
    'Use run_transaction for wallet gasLimit questions. gasUsed is paid tx gas. Amsterdam also returns txRegularGas / txStateGas. A gasLimit of 21000 OOGs Amsterdam first-touch. SSTORE programs may use run_bytecode.',
}
