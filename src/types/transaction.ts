import type { EOACode7702AuthorizationListItem } from '@ethereumjs/util'

import type {
  Provenance,
  SimulateDecodedLog,
  SimulatePrefundAccount,
  SimulateRawLog,
} from './lab.js'
import type { ForkConfig } from './protocol.js'

export interface RunTransactionInput {
  /** Hex sender address (impersonated — no private key required). */
  from: string
  /** Hex recipient (or contract) address. */
  to: string
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
  logs?: SimulateRawLog[]
  decodedLogs?: SimulateDecodedLog[]
  provenance: Provenance
}
