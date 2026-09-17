import type {
  Provenance,
  SimulateDecodedLog,
  SimulatePrefundAccount,
  SimulateRawLog,
} from './lab.js'
import type { ForkConfig } from './protocol.js'

/** One impersonated transaction inside a lab `runBlock` request. */
export interface RunBlockTransactionInput {
  /** Hex sender address (impersonated — no private key required). */
  from: string
  /** Hex recipient (or contract) address. */
  to: string
  /** Value in wei as a decimal string. Default 0. */
  value?: string
  /** Optional calldata hex. Default empty. */
  data?: string
  /** Optional runtime bytecode installed at `to` before the block. */
  code?: string
  /** Transaction gas limit as a decimal string. Default 1000000. */
  gasLimit?: string
}

export interface RunBlockHeaderInput {
  /** Beacon slot (EIP-7843). Decimal string. Glamsterdam only. */
  slotNumber?: string
  /** Block number. Decimal string. Default 1. */
  number?: string
  /** Unix timestamp. Decimal string. Default 1. */
  timestamp?: string
}

export interface RunBlockInput {
  /** 1–N impersonated transactions (hard cap: `maxTxsPerBlock`). */
  transactions: RunBlockTransactionInput[]
  /** Extra accounts to prefund before execution. */
  accounts?: SimulatePrefundAccount[]
  fork?: ForkConfig
  /** Optional lab header fields (slot, number, timestamp). */
  header?: RunBlockHeaderInput
}

export interface RunBlockTxResult {
  success: boolean
  gasUsed: string
  gasUsedScope: 'transaction'
  txRegularGas?: string
  txStateGas?: string
  returnValue: string
  error: string | null
  logs?: SimulateRawLog[]
  decodedLogs?: SimulateDecodedLog[]
}

export interface RunBlockHeaderSnapshot {
  number: string
  timestamp: string
  gasUsed: string
  /** Present when the fork activates EIP-7843 and a slot was set. */
  slotNumber?: string
}

export interface RunBlockResult {
  success: boolean
  /** Block `gasUsed` after execution (`generate: true` lab mode). */
  gasUsed: string
  gasUsedScope: 'block'
  header: RunBlockHeaderSnapshot
  transactions: RunBlockTxResult[]
  error: string | null
  provenance: Provenance
}
