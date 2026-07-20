/** Query shapes the MCP surface exposes (generic verbs). */
export type QueryShape = 'simulate' | 'compare' | 'generate' | 'probe'

/** Nature of a protocol change — drives which query shapes apply. */
export type ChangeNature =
  | 'repricing'
  | 'new-capability'
  | 'new-structure'
  | 'new-exec-model'
  | 'limit'
  | 'economic'

export type StabilityRollup = 'experimental' | 'emerging' | 'stabilizing' | 'firm'

/** À-la-carte or named fork capability set. */
export interface ForkConfig {
  baseHardfork: string
  eips?: number[]
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
}

export interface EipCapability {
  eip: number
  name?: string
  changeNature?: ChangeNature
  shapes?: QueryShape[]
  status?: string
  forkInclusion?: string
  implMaturity?: string
  testMaturity?: string
  specAnchor?: string
  notes?: string
}

export interface NamedFork {
  id: string
  label: string
  config: ForkConfig
  stabilityRollup?: StabilityRollup
}

export interface StepTrace {
  pc: number
  op: string
  gasCost: string
  gasLeft: string
  stack: string[]
}

export interface SimulateBytecodeInput {
  bytecode: string
  fork?: ForkConfig
  gasLimit?: string
  trace?: boolean
}

export interface SimulateBytecodeResult {
  success: boolean
  gasUsed: string
  returnValue: string
  finalStack: string[]
  error: string | null
  steps?: StepTrace[]
  provenance: Provenance
}

export interface CompareVariantInput {
  label: string
  fork: ForkConfig
  bytecode: string
  gasLimit?: string
  trace?: boolean
}

export interface CompareVariantsInput {
  variants: CompareVariantInput[]
}

export interface CompareVariantResult {
  label: string
  result: SimulateBytecodeResult
}

export interface CompareDiffEntry {
  dimension: string
  byLabel: Record<string, string | boolean | null>
  note?: string
}

export interface CompareVariantsResult {
  variants: CompareVariantResult[]
  diffs: CompareDiffEntry[]
  provenance: Provenance
}

export interface CapabilityDescription {
  engineVersion: string
  ceilings: {
    maxGasLimit: string
    defaultGasLimit: string
    maxBytecodeBytes: number
    maxTraceSteps: number
  }
  namedForks: NamedFork[]
  eips: EipCapability[]
  allowedBaseHardforks: string[]
  presets: PresetDefinition[]
}

export interface PresetDefinition {
  id: string
  name: string
  shape: QueryShape
  description: string
  /** Seed only — may omit concrete bytecode until curated. */
  seed?: boolean
  relatedEips?: number[]
}

export class EngineError extends Error {
  readonly code: string

  constructor(message: string, code: string) {
    super(message)
    this.name = 'EngineError'
    this.code = code
  }
}
