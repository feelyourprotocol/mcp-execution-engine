/**
 * EIP-7702 module — set-code EOA delegation for one transaction.
 *
 * canonicalSource: website/src/explorations/eip-7702/canonical.ts
 */
import type { EipCapability } from '../../types/index.js'
import { COMPARE_NOTE, DELEGATION_DESIGNATOR_PREFIX, TRANSACTION_LAYOUT } from './input.js'

export const EIP_7702_MODULE: EipCapability = {
  eip: 7702,
  name: 'Set EOA account code for one transaction',
  summary:
    'Pectra type-4 transactions attach signed authorizations so an EOA runs delegate contract code for one tx. Prefund the implementation, pass authorizationList, call the authority via run_transaction — compare with Dencun where 7702 is inactive.',
  changeNature: 'new-exec-model',
  runnable: true,
  shapes: ['transaction', 'inspect'],
  keywords: ['7702', 'eoa', 'delegation', 'set-code', 'authorization list', 'type-4'],
  relatedForks: ['pectra'],
  status: 'Final',
  implMaturity: 'Implemented in EthereumJS (Pectra hardfork)',
  testMaturity: 'EthereumJS vm eip-7702; FYP MCP run_transaction + inspect tests',
  specAnchor: 'EIP-7702',
  notes: `${DELEGATION_DESIGNATOR_PREFIX}. ${TRANSACTION_LAYOUT} ${COMPARE_NOTE}`,
}
