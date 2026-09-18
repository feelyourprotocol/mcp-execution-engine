/**
 * EIP-7708 module — ETH transfer logs on Glamsterdam.
 *
 * canonicalSource: website/src/explorations/eip-7708/canonical.ts
 *
 * Callers supply a transaction (plain ETH) or bytecode with inner CALLs.
 * Catalog describes when Transfer logs appear; it does not ship demo programs.
 */
import type { EipCapability } from '../../types/index.js'
import { GLAMSTERDAM_DEVNET_TEST_RELEASE_URL } from '../../types/index.js'
import {
  TRANSACTION_LAYOUT,
  TRANSFER_EVENT_SIGNATURE,
  TRANSFER_LOG_EMITTER,
  VALUE_BEARING_CALL_NOTE,
} from './input.js'

export const EIP_7708_MODULE: EipCapability = {
  eip: 7708,
  name: 'ETH transfers emit a log',
  summary:
    'Glamsterdam emits synthetic ERC-20-style Transfer logs from the system address on nonzero ETH moves. Run a value-bearing transaction (run_transaction) — compare logs on fusaka vs glamsterdam.',
  changeNature: 'new-capability',
  runnable: true,
  shapes: ['transaction', 'simulate'],
  keywords: [
    'ETH transfer log',
    'Transfer event',
    'SYSTEM_ADDRESS',
    'contract wallet',
    'receipt logs',
    'EIP-7708',
  ],
  relatedForks: ['glamsterdam'],
  opcodes: [
    {
      name: 'EIP-7708 Transfer log',
      opcode: 0,
      opcodeHex: TRANSFER_LOG_EMITTER,
      effect:
        'Synthetic Transfer log on successful nonzero value moves (tx value and CALL/CREATE paths).',
      immediate: {
        encoding: TRANSFER_EVENT_SIGNATURE,
        notes: `${VALUE_BEARING_CALL_NOTE} ${TRANSACTION_LAYOUT}`,
      },
    },
  ],
  status: 'Review',
  specUrl:
    'https://github.com/ethereum/EIPs/blob/f7230c46a743313957d8f38a159bda934cc735b2/EIPS/eip-7708.md',
  specDate: '2026-07-10',
  testReleaseUrl: GLAMSTERDAM_DEVNET_TEST_RELEASE_URL,
  notes:
    'Use returned logs and decodedLogs from run_transaction — do not infer Transfer events from opcode traces alone. Inner CALL programs may use run_bytecode.',
}
