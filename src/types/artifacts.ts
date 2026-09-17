import type { RunBlockHeaderSnapshot, RunBlockInput } from './block.js'
import type { Provenance } from './lab.js'
import type { ForkConfig } from './protocol.js'

/** Structured artifacts the `generate` verb can derive from a lab block run. */
export type GenerateArtifactKind = 'block-access-list'

/** Caller-supplied structures the `inspect` verb can judge (layers A–C). */
export type InspectArtifactKind =
  | 'block-access-list'
  | 'authorization-list'
  | 'typed-transaction'
  | 'withdrawals'
  | 'execution-requests'

export interface GenerateInput extends RunBlockInput {
  /** Defaults to `block-access-list` (EIP-7928). */
  kind?: GenerateArtifactKind
}

/** Engine API JSON account list — opaque here; validators live in @ethereumjs/util. */
export type BlockAccessListJson = unknown[]

export interface GenerateResult {
  success: boolean
  artifactKind: GenerateArtifactKind
  bal: BlockAccessListJson
  hash: string
  itemCount: number
  /** Max BAL items allowed for the lab block gas limit (EIP-7928 item cost). */
  maxItems: string
  gasUsed: string
  header: RunBlockHeaderSnapshot
  error: string | null
  provenance: Provenance
}

export interface InspectInput {
  kind?: InspectArtifactKind
  /** Shape depends on `kind` — see probe `inspectKinds`. */
  artifact: unknown
  /** Block gas limit for BAL item cap check. Decimal string; default engine max. */
  blockGasLimit?: string
  /** Optional 32-byte commitment hex (BAL hash, tx hash, withdrawalsRoot, requestsHash). */
  expectedHash?: string
  /** Fork for typed-transaction decode (default prague). */
  fork?: ForkConfig
}

export interface InspectResult {
  kind: InspectArtifactKind
  /** Layer A — parses as JSON or RLP. */
  wellFormed: boolean
  /** Layer B — canonical order, uniqueness, read/write rules, item cap when gas limit known. */
  structureOk: boolean
  /** Layer C — present when expectedHash was supplied. */
  hashMatch?: boolean
  itemCapOk?: boolean
  errors: string[]
  itemCount: number
  computedHash: string
  maxItems?: string
  /** Kind-specific fields (authorities, tx decode summary, roots, …). */
  details?: Record<string, unknown>
}

export interface InspectKindDescriptor {
  id: InspectArtifactKind
  label: string
  summary: string
}
