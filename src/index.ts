export {
  ALLOWED_BASE_HARDFORKS,
  BASELINE_FORK_ID,
  buildCommon,
  describeCapabilities,
  EIP_CAPABILITIES,
  ENGINE_CEILINGS,
  ENGINE_VERSION,
  getEipCapability,
  listKnownEips,
  NAMED_FORKS,
  normalizeForkConfig,
  resolveNamedFork,
} from './forks/registry.js'
export { parseBytecodeHex, parseGasLimit, resolveFork } from './forks/resolve.js'
export { EIP_7708_MODULE } from './modules/eip-7708/index.js'
export { EIP_8024_MODULE } from './modules/eip-8024/index.js'
export {
  DUPN,
  DUPN_SWAPN_MAX_DEPTH,
  DUPN_SWAPN_MIN_DEPTH,
  encodeDupnSwapnImmediate,
  encodeExchangeImmediate,
  EXCHANGE,
  EXCHANGE_XOR_MASK,
  SWAPN,
} from './modules/eip-8024/opcodes.js'
export { EIP_8037_MODULE } from './modules/eip-8037/index.js'
export { EIP_MODULES, getEipModule, listEipModules } from './modules/index.js'
export { buildProvenance, PROVENANCE_AS_OF } from './provenance/build.js'
export { countEthTransferLogs, mapExecLogs, systemAddressHex } from './simulate/logs.js'
export { simulateBytecode } from './simulate/simulateBytecode.js'
export { stepToTrace } from './simulate/trace.js'
export { runTransaction } from './transaction/runTransaction.js'
export type {
  CapabilityDescription,
  ChangeNature,
  EipCapability,
  EipComparison,
  EipOpcode,
  EipOpcodeImmediate,
  EipProvenance,
  EngineCeilings,
  ForkConfig,
  ForkRole,
  NamedFork,
  Provenance,
  QueryShape,
  RunTransactionInput,
  RunTransactionResult,
  SimulateBytecodeInput,
  SimulateBytecodeResult,
  SimulateDecodedLog,
  SimulateEthBurnLog,
  SimulateEthTransferLog,
  SimulateLogDecoration,
  SimulatePrefundAccount,
  SimulateRawLog,
  StabilityRollup,
  StepTrace,
} from './types.js'
export { EngineError } from './types.js'
