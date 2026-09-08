/** Query shapes the MCP surface exposes (generic verbs). */
export type QueryShape = 'simulate' | 'transaction' | 'generate' | 'probe'

/** Nature of a protocol change — drives which query shapes apply. */
export type ChangeNature =
  | 'repricing'
  | 'new-capability'
  | 'new-structure'
  | 'new-exec-model'
  | 'limit'
  | 'economic'

export type StabilityRollup = 'experimental' | 'emerging' | 'stabilizing' | 'firm'

/** Named fork role for fork comparisons (baseline vs preview). */
export type ForkRole = 'baseline' | 'preview'

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

export interface NamedFork {
  id: string
  label: string
  config: ForkConfig
  stabilityRollup?: StabilityRollup
  /** Baseline (mainnet today) vs preview (upcoming fork). */
  role?: ForkRole
  /** Alternate names agents may use (e.g. glamsterdam → amsterdam). */
  aliases?: string[]
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

export interface SimulatePrefundAccount {
  address: string
  balance?: string
  code?: string
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
  /** Extra accounts to prefund before execution (calldata targets, revert callees, etc.). */
  accounts?: SimulatePrefundAccount[]
  fork?: ForkConfig
  gasLimit?: string
  trace?: boolean
}

export interface SimulateBytecodeResult {
  success: boolean
  /** Call-frame gas (`runCode`). Does not include transaction intrinsic. */
  gasUsed: string
  /** How `gasUsed` was measured. Always `call-frame` for the bytecode verb. */
  gasUsedScope: 'call-frame'
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
  }
  namedForks: NamedFork[]
  /** Current mainnet EL baseline for fork comparisons (see `namedForks` with `role: baseline`). */
  baselineForkId: string
  eips: EipCapability[]
  allowedBaseHardforks: string[]
}

export class EngineError extends Error {
  readonly code: string

  constructor(message: string, code: string) {
    super(message)
    this.name = 'EngineError'
    this.code = code
  }
}
