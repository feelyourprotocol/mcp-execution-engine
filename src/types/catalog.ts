import type { InspectKindDescriptor } from './artifacts.js'
import type {
  ChangeNature,
  EipComparison,
  EipOpcode,
  ForkConfig,
  ForkRole,
  QueryShape,
  StabilityRollup,
} from './protocol.js'

/**
 * Catalog entry for one named hardfork. First-class next to EIP modules:
 * callers can run bytecode / a tx / a lab block under the fork without
 * naming an EIP. `id` is the combined upgrade name from Shapella on.
 * `relatedEips` are advertised runnable modules, not a complete EthereumJS bundle list.
 */
export interface NamedFork {
  id: string
  label: string
  config: ForkConfig
  stabilityRollup?: StabilityRollup
  /** Baseline (mainnet today) vs preview (upcoming fork). */
  role?: ForkRole
  /** EL city names and role aliases (e.g. amsterdam → glamsterdam, mainnet-el → fusaka). */
  aliases?: string[]
  /** One-line capability: what callers can do on this fork. */
  summary: string
  keywords: string[]
  /** Query shapes that work for a generic run on this fork. */
  shapes: QueryShape[]
  /** Position in the Berlin→Glamsterdam lineage (0 = Berlin). */
  order: number
  /** Previous lineage fork, if any. */
  predecessorId?: string
  /** Next lineage fork, if any. */
  successorId?: string
  /** Protocol EIPs activated at this fork (facts — see also eipIntroductions). */
  activatedEips: number[]
  /** Runnable catalog EIP numbers advertised as twins introduced at this fork. */
  relatedEips: number[]
  /** Exploration twins that are Planned (not in the live EIP catalog). */
  plannedEips?: number[]
  notes?: string
}

/** When an EIP activated — compact facts for agents (encoding lives in runnable modules). */
export interface EipIntroduction {
  eip: number
  name: string
  summary: string
  keywords: string[]
  introducedAt: string
  /** Query shapes where a shipped verb can honestly show the effect. */
  observableShapes?: QueryShape[]
}

export interface EngineCeilings {
  maxGasLimit: bigint
  defaultGasLimit: bigint
  maxBytecodeBytes: number
  maxTraceSteps: number
  /** Hard cap on transactions in one `runBlock` lab request. */
  maxTxsPerBlock: number
}

/**
 * Catalog entry for one EIP module. Only `runnable: true` entries belong in
 * `describeCapabilities()`. Describes what became possible, not demo programs.
 *
 * Several fields replicate website `CANONICAL` (`changeNature`, `shapes`,
 * `keywords`, `comparison`, maturity). Lab-only extras: `runnable`, `opcodes`,
 * `relatedForks`.
 */
export interface EipCapability {
  eip: number
  name: string
  /** One-line capability: what callers can do. */
  summary: string
  changeNature: ChangeNature
  runnable: boolean
  shapes: QueryShape[]
  keywords: string[]
  relatedForks: string[]
  opcodes?: EipOpcode[]
  /** Optional baseline vs preview fork pair when comparing against mainnet. */
  comparison?: EipComparison
  status?: string
  implMaturity?: string
  testMaturity?: string
  specAnchor?: string
  notes?: string
}

export interface CapabilityDescription {
  engineVersion: string
  ceilings: {
    maxGasLimit: string
    defaultGasLimit: string
    maxBytecodeBytes: number
    maxTraceSteps: number
    maxTxsPerBlock: number
  }
  /** Named hardforks as catalog capabilities (lineage, activated EIPs, related twins). */
  namedForks: NamedFork[]
  /** When each catalogued EIP activated (compare with predecessor of introducedAt). */
  eipIntroductions: EipIntroduction[]
  /** Current mainnet EL baseline for fork comparisons (Fusaka). */
  baselineForkId: string
  eips: EipCapability[]
  allowedBaseHardforks: string[]
  /** Kinds accepted by the generic `inspect` verb (structure + hash, no chain state). */
  inspectKinds: InspectKindDescriptor[]
}
