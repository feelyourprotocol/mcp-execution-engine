/**
 * EIP-7883 module — ModExp gas repricing on Osaka (Fusaka).
 *
 * canonicalSource: website/src/explorations/eip-7883/canonical.ts
 *
 * Callers supply bytecode (typically CALL to 0x05). Catalog describes input layout;
 * it does not ship demo programs.
 */
import type { EipCapability } from '../../types.js'
import { MODEXP_ADDRESS, MODEXP_INPUT_LAYOUT } from './input.js'

export const EIP_7883_MODULE: EipCapability = {
  eip: 7883,
  name: 'ModExp gas cost increase',
  summary:
    'Osaka EVM runs ModExp (0x05) with Fusaka gas formula and EIP-7823 bounds. Supply CALL bytecode; compare Prague vs Osaka for repricing.',
  changeNature: 'repricing',
  runnable: true,
  shapes: ['simulate'],
  keywords: ['ModExp', 'modular exponentiation', 'gas repricing', 'precompile 0x05', 'RSA'],
  relatedForks: ['prague', 'osaka'],
  comparison: {
    baselineForkId: 'prague',
    previewForkId: 'osaka',
    note: 'ModExp gas formula changed at Fusaka; EIP-7823 input bounds on Osaka.',
  },
  opcodes: [
    {
      name: 'MODEXP',
      opcode: MODEXP_ADDRESS,
      opcodeHex: '0x05',
      effect: 'Modular exponentiation precompile — gas depends on input sizes.',
      immediate: {
        encoding: MODEXP_INPUT_LAYOUT,
        notes: 'Invoke via CALL to address 0x05 with standard EIP-198 ABI encoding.',
      },
    },
  ],
  status: 'Final',
  forkInclusion: 'Fusaka (Osaka on mainnet)',
  implMaturity: 'Implemented in EthereumJS (engine module)',
  testMaturity: 'Precompile gas tests',
  specAnchor: 'EIP-7883',
  notes:
    'Run the same ModExp CALL on prague then osaka to diff gasUsed. Oversized inputs may fail on Osaka per EIP-7823.',
}
