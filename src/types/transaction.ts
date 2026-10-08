import type { EOACode7702AuthorizationListItem } from '@ethereumjs/util'

import type {
  Provenance,
  SimulateDecodedLog,
  SimulatePrefundAccount,
  SimulateRawLog,
} from './lab.js'
import type { ForkConfig } from './protocol.js'
import type { RecipientPrestate, RegularGasBreakdown } from './regularGas.js'

/** One EIP-2930 access-list row (EIP-7981 floor applies to these bytes on Glamsterdam). */
export interface RunTransactionAccessListItem {
  address: string
  /** Storage key hex strings (≤32 bytes each). Default empty. */
  storageKeys?: string[]
}

export interface RunTransactionInput {
  /** Hex sender address (impersonated — no private key required). */
  from: string
  /** Hex recipient address. Omit for contract creation; then `data` is initcode. */
  to?: string
  /** Value in wei as a decimal string. Default 0. */
  value?: string
  /** Optional calldata hex. Default empty. */
  data?: string
  /** Optional runtime bytecode installed at `to` before the tx (test contracts). */
  code?: string
  /** Extra accounts to prefund before execution. */
  accounts?: SimulatePrefundAccount[]
  fork?: ForkConfig
  /** Transaction gas limit as a decimal string. Default 1000000. */
  gasLimit?: string
  /** Signed EIP-7702 authorization JSON items — builds a type-4 tx on Pectra+. */
  authorizationList?: EOACode7702AuthorizationListItem[]
  /** EIP-2930 access list — type-2 tx. On Glamsterdam, list bytes pay the calldata floor (EIP-7981). */
  accessList?: RunTransactionAccessListItem[]
}

export interface RunTransactionResult {
  success: boolean
  /** Paid transaction gas (`totalGasSpent`: intrinsic + execution − refund, with floor). */
  gasUsed: string
  gasUsedScope: 'transaction'
  /** EIP-8037 regular-gas total. Present on Glamsterdam; omitted on Fusaka. */
  txRegularGas?: string
  /** EIP-8037 state-gas total. Present on Glamsterdam; omitted on Fusaka. */
  txStateGas?: string
  returnValue: string
  error: string | null
  /** Set when a non-EngineError exception was caught (operator metrics). */
  errorCode?: 'unexpected'
  /** Address created by a successful contract-creation transaction. */
  createdAddress?: string
  /** Runtime code bytes stored by a successful contract-creation transaction. */
  deployedCodeSize?: number
  logs?: SimulateRawLog[]
  decodedLogs?: SimulateDecodedLog[]
  /** Sender-aware regular-gas parts (sum to txRegularGas or gasUsed). */
  regularGas?: RegularGasBreakdown
  /** Recipient before execution — explains txStateGas, not part of regularGas. */
  recipientPrestate?: RecipientPrestate
  provenance: Provenance
}
