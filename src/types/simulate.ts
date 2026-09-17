import type {
  Provenance,
  SimulateDecodedLog,
  SimulatePrefundAccount,
  SimulateRawLog,
  StepTrace,
} from './lab.js'
import type { ForkConfig } from './protocol.js'

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
   * Present when non-zero (typically Glamsterdam new-slot SSTORE).
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
