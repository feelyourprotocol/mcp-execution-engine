/**
 * EIP-7708 module — ETH transfer logs on Amsterdam.
 *
 * canonicalSource: website/src/explorations/eip-7708/canonical.ts
 *
 * Callers supply bytecode or a messageCall. Catalog describes when Transfer logs
 * appear; it does not ship demo programs.
 */
import type { EipCapability } from '../../types.js'
import {
  MESSAGE_CALL_LAYOUT,
  TRANSFER_EVENT_SIGNATURE,
  TRANSFER_LOG_EMITTER,
  VALUE_BEARING_CALL_NOTE,
} from './input.js'

export const EIP_7708_MODULE: EipCapability = {
  eip: 7708,
  name: 'ETH transfers emit a log',
  summary:
    'Amsterdam emits synthetic ERC-20-style Transfer logs from the system address on nonzero ETH moves. Run caller bytecode or a value-bearing messageCall — compare logs on osaka vs amsterdam.',
  changeNature: 'new-capability',
  runnable: true,
  shapes: ['simulate'],
  keywords: [
    'ETH transfer log',
    'Transfer event',
    'SYSTEM_ADDRESS',
    'contract wallet',
    'receipt logs',
    'EIP-7708',
  ],
  relatedForks: ['amsterdam', 'glamsterdam'],
  comparison: {
    baselineForkId: 'osaka',
    previewForkId: 'amsterdam',
    note: 'Transfer logs only on preview; same program on baseline has no EIP-7708 logs.',
  },
  opcodes: [
    {
      name: 'EIP-7708 Transfer log',
      opcode: 0,
      opcodeHex: TRANSFER_LOG_EMITTER,
      effect: 'Synthetic Transfer log on successful nonzero value moves (CALL/CREATE paths).',
      immediate: {
        encoding: TRANSFER_EVENT_SIGNATURE,
        notes: `${VALUE_BEARING_CALL_NOTE} ${MESSAGE_CALL_LAYOUT}`,
      },
    },
  ],
  status: 'Review',
  forkInclusion: 'Scheduled (Amsterdam)',
  implMaturity: 'Implemented in EthereumJS (engine module)',
  testMaturity: 'execution-specs eip7708_eth_transfer_logs',
  specAnchor: 'EIP-7708',
  notes:
    'Use returned logs and decodedLogs — do not infer Transfer events from opcode traces alone. Burn logs and tx-level value need a future tx simulate path.',
}
