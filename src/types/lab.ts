import type { EipProvenance, ForkConfig, StabilityRollup } from './protocol.js'

export interface Provenance {
  engineVersion: string
  forkConfig: ForkConfig
  /** Human fork label with mascot when assigned (e.g. "🦓 Fusaka"). */
  forkLabel?: string
  /** Mascot emoji for `forkConfig.baseHardfork` when assigned. */
  forkMascotEmoji?: string
  /** Lineage predecessor for generic historical runs (compare pair hint). */
  predecessorForkId?: string
  perEip?: EipProvenance[]
  stabilityRollup?: StabilityRollup
  caveat?: string
  asOf?: string
}

export interface StepTrace {
  pc: number
  op: string
  gasCost: string
  gasLeft: string
  stack: string[]
}

export interface SimulatePrefundStorageSlot {
  /** Storage slot hex (≤32 bytes; left-padded). */
  slot: string
  /** Storage value hex (≤32 bytes; left-padded). */
  value: string
}

export interface SimulatePrefundAccount {
  address: string
  /** Wei as decimal string. Omit for default 1 ETH; use "0" for unfunded. */
  balance?: string
  /** Account nonce as decimal string. Default 0. */
  nonce?: string
  code?: string
  /** Optional slots to seed (existing-slot SSTORE / SLOAD). */
  storage?: SimulatePrefundStorageSlot[]
}

export interface SimulateRawLog {
  address: string
  topics: string[]
  data: string
}

export interface SimulateEthTransferLog {
  kind: 'eth-transfer'
  from: string
  to: string
  valueWei: string
}

export interface SimulateEthBurnLog {
  kind: 'eth-burn'
  account: string
  valueWei: string
}

export type SimulateLogDecoration = SimulateEthTransferLog | SimulateEthBurnLog

export interface SimulateDecodedLog {
  index: number
  raw: SimulateRawLog
  decoration?: SimulateLogDecoration
}
