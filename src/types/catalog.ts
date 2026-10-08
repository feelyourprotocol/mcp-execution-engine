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
import type { McpToolName, QueryShapeDescriptor } from './queryShapes.js'

/**
 * Catalog entry for one named hardfork. First-class next to EIP modules:
 * callers can run bytecode / a tx / a lab block under the fork without
 * naming an EIP. `id` is the combined upgrade name from Shapella on.
 * `relatedEips` are advertised runnable modules, not a complete EthereumJS bundle list.
 */
export interface NamedFork {
  id: string
  /** Display name for agents (mascot prefix when assigned; `id` stays the catalog key). */
  label: string
  /** Upgrade mascot emoji when assigned (EIP-8066 tradition). */
  mascotEmoji?: string
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

/**
 * How an introduction appears on the probe.
 * `twin` is derived from `EIP_MODULES`. `supported`, `unshown`, `consensus`,
 * `networking`, and `informational` are hand-set. Everything else is `listed`.
 */
export type EipLabCoverage =
  | 'twin'
  | 'supported'
  | 'listed'
  | 'unshown'
  | 'consensus'
  | 'networking'
  | 'informational'

/** When an EIP activated — compact facts for agents (encoding lives in runnable modules). */
export interface EipIntroduction {
  eip: number
  name: string
  summary: string
  keywords: string[]
  introducedAt: string
  /**
   * `supported`: the execution hardfork already applies it. No module and no exploration.
   * `unshown`: execution-layer, in the bundle, and this lab does not demonstrate it.
   * `consensus`: consensus-layer only. This lab does not execute it.
   * `networking`: wire protocol. This lab does not speak it.
   * `informational`: analysis or a schedule. This lab does not execute it.
   * Omit for the default `listed`. The probe sets `twin` when the number is a module.
   */
  coverage?: 'supported' | 'unshown' | 'consensus' | 'networking' | 'informational'
  /** Query shapes where a shipped verb can honestly show the effect. Omit on `supported`, `unshown`, `consensus`, `networking`, and `informational` rows. */
  observableShapes?: QueryShape[]
}

export interface EngineCeilings {
  maxGasLimit: bigint
  /** Higher tx-only ceiling for Glamsterdam's EIP-8037 state-gas reservoir. */
  maxTransactionGasLimit: bigint
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
 * `keywords`, `comparison`, `status`, `specUrl`, `specDate`, `testReleaseUrl`,
 * `testReleaseName`). Lab-only extras: `runnable`, `opcodes`, `relatedForks`.
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
  specUrl?: string
  specDate?: string
  testReleaseUrl?: string
  testReleaseName?: string
  notes?: string
}

/** Live probe row — MCP tool names, not internal shape ids. */
export type NamedForkProbe = Omit<NamedFork, 'shapes'> & { tools: McpToolName[] }

/** Live probe row — MCP tool names, not internal shape ids. */
export type EipCapabilityProbe = Omit<EipCapability, 'shapes'> & { tools: McpToolName[] }

/** Live probe row — MCP tool names, not internal `observableShapes`. `coverage` is always set. */
export type EipIntroductionProbe = Omit<EipIntroduction, 'observableShapes' | 'coverage'> & {
  coverage: EipLabCoverage
  /** Human fork name for `introducedAt` (mascot baked into label when assigned). */
  introducedAtLabel?: string
  /** Mascot emoji for `introducedAt` when the fork has one. */
  introducedAtMascotEmoji?: string
  observableTools?: McpToolName[]
}

export interface CapabilityDescription {
  engineVersion: string
  ceilings: {
    maxGasLimit: string
    maxTransactionGasLimit: string
    defaultGasLimit: string
    maxBytecodeBytes: number
    maxTraceSteps: number
    maxTxsPerBlock: number
  }
  /** Shape id → MCP tool dictionary. Agents pick `mcpTool`; they do not call `id`. */
  queryShapes: QueryShapeDescriptor[]
  /** Named hardforks as catalog capabilities (lineage, activated EIPs, related twins). */
  namedForks: NamedForkProbe[]
  /** When each catalogued EIP activated (compare with predecessor of introducedAt). */
  eipIntroductions: EipIntroductionProbe[]
  /** Current mainnet EL baseline for fork comparisons (Fusaka). */
  baselineForkId: string
  eips: EipCapabilityProbe[]
  allowedBaseHardforks: string[]
  /** Kinds accepted by `inspect_artifact` (structure + hash, no chain state). */
  inspectKinds: InspectKindDescriptor[]
}
