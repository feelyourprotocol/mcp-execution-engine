/** Query shapes the MCP surface exposes (generic verbs). */
export type QueryShape = 'simulate' | 'transaction' | 'block' | 'generate' | 'inspect' | 'probe'

/** Structured artifacts the `generate` verb can derive from a lab block run. */
export type GenerateArtifactKind = 'block-access-list'

/** Caller-supplied structures the `inspect` verb can judge (layers A–C). */
export type InspectArtifactKind = 'block-access-list'

/** Nature of a protocol change — drives which query shapes apply. */
export type ChangeNature =
  | 'repricing'
  | 'new-capability'
  | 'new-structure'
  | 'new-exec-model'
  | 'limit'
  | 'economic'

export type StabilityRollup = 'experimental' | 'emerging' | 'stabilizing' | 'firm'

/** Named fork role in the Berlin→Amsterdam lineage. */
export type ForkRole = 'historical' | 'current' | 'preview'

/** À-la-carte or named fork capability set. */
export interface ForkConfig {
  baseHardfork: string
  eips?: number[]
}

/**
 * Catalog entry for one named hardfork. First-class next to EIP modules:
 * callers can run bytecode / a tx / a lab block under the fork without
 * naming an EIP. `relatedEips` are advertised runnable modules, not a
 * complete EthereumJS bundle list.
 */
export interface NamedFork {
  id: string
  label: string
  config: ForkConfig
  stabilityRollup?: StabilityRollup
  /** Baseline (mainnet today) vs preview (upcoming fork). */
  role?: ForkRole
  /** Alternate names agents may use (e.g. glamsterdam → amsterdam). */
  aliases?: string[]
  /** One-line capability: what callers can do on this fork. */
  summary: string
  keywords: string[]
  /** Query shapes that work for a generic run on this fork. */
  shapes: QueryShape[]
  /** Position in the Berlin→Amsterdam lineage (0 = Berlin). */
  order: number
  /** Previous lineage fork, if any. */
  predecessorId?: string
  /** Next lineage fork, if any. */
  successorId?: string
  /** Protocol EIPs activated at this fork (facts — see also eipIntroductions). */
  activatedEips: number[]
  /** Runnable catalog EIP numbers advertised on this fork. */
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

export interface EipProvenance {
  eip: number
  status?: string
  forkInclusion?: string
  implMaturity?: string
  testMaturity?: string
  specAnchor?: string
}

export interface Provenance {
  engineVersion: string
  forkConfig: ForkConfig
  /** Lineage predecessor for generic historical runs (compare pair hint). */
  predecessorForkId?: string
  perEip?: EipProvenance[]
  stabilityRollup?: StabilityRollup
  caveat?: string
  asOf?: string
}

export interface EngineCeilings {
  maxGasLimit: bigint
  defaultGasLimit: bigint
  maxBytecodeBytes: number
  maxTraceSteps: number
  /** Hard cap on transactions in one `runBlock` lab request. */
  maxTxsPerBlock: number
}

/** How to compare a preview EIP against the live baseline fork. */
export interface EipComparison {
  baselineForkId: string
  previewForkId: string
  note?: string
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
  balance?: string
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

export interface SimulateBytecodeInput {
  bytecode: string
  /** Extra accounts to prefund (code/balance/storage) before the message-call. */
  accounts?: SimulatePrefundAccount[]
  fork?: ForkConfig
  gasLimit?: string
  trace?: boolean
}

export interface SimulateBytecodeResult {
  success: boolean
  /** Call-frame gas (VM message-call). Does not include transaction intrinsic. */
  gasUsed: string
  /** How `gasUsed` was measured. Always `call-frame` for the bytecode verb. */
  gasUsedScope: 'call-frame'
  /**
   * EIP-8037 state gas spilled into this frame's regular gas.
   * Present when non-zero (typically Amsterdam new-slot SSTORE).
   * Program write cost ≈ `gasUsed` − `stateGasSpilled`.
   */
  stateGasSpilled?: string
  returnValue: string
  finalStack: string[]
  error: string | null
  steps?: StepTrace[]
  /** Raw logs emitted during execution (empty when none). */
  logs?: SimulateRawLog[]
  /** EIP-7708 and other decodable logs indexed in emission order. */
  decodedLogs?: SimulateDecodedLog[]
  provenance: Provenance
}

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
}

export interface RunTransactionResult {
  success: boolean
  /** Paid transaction gas (`totalGasSpent`: intrinsic + execution − refund, with floor). */
  gasUsed: string
  gasUsedScope: 'transaction'
  /** EIP-8037 regular-gas total. Present on Amsterdam; omitted on Osaka. */
  txRegularGas?: string
  /** EIP-8037 state-gas total. Present on Amsterdam; omitted on Osaka. */
  txStateGas?: string
  returnValue: string
  error: string | null
  logs?: SimulateRawLog[]
  decodedLogs?: SimulateDecodedLog[]
  provenance: Provenance
}

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
  /** Beacon slot (EIP-7843). Decimal string. Amsterdam only. */
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
  /** BAL JSON array (Engine API shape) or RLP-encoded list as hex. */
  artifact: unknown
  /** Block gas limit for the item cap check. Decimal string; default engine max. */
  blockGasLimit?: string
  /** Optional `blockAccessListHash` to compare (32-byte hex). */
  expectedHash?: string
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
}

export interface InspectKindDescriptor {
  id: InspectArtifactKind
  label: string
  summary: string
}

export interface EipOpcodeImmediate {
  /** Spec formula so agents can construct bytecode (not a demo program). */
  encoding: string
  minDepth?: number
  maxDepth?: number
  notes?: string
}

/** Opcode this EIP adds or changes — facts for constructing requests. */
export interface EipOpcode {
  name: string
  opcode: number
  opcodeHex: string
  effect: string
  immediate?: EipOpcodeImmediate
}

/**
 * Catalog entry for one EIP module. Only `runnable: true` entries belong in
 * `describeCapabilities()`. Describes what became possible, not demo programs.
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
  forkInclusion?: string
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
  /** Current mainnet EL baseline for fork comparisons (Osaka). */
  baselineForkId: string
  eips: EipCapability[]
  allowedBaseHardforks: string[]
  /** Kinds accepted by the generic `inspect` verb (structure + hash, no chain state). */
  inspectKinds: InspectKindDescriptor[]
}

export class EngineError extends Error {
  readonly code: string

  constructor(message: string, code: string) {
    super(message)
    this.name = 'EngineError'
    this.code = code
  }
}
