export { compareVariants } from './diff/diffResults.js'
export {
  ALLOWED_BASE_HARDFORKS,
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
export { EIP_MODULES, getEipModule, listEipModules } from './modules/index.js'
export { buildProvenance, mergeProvenanceForCompare, PROVENANCE_AS_OF } from './provenance/build.js'
export { simulateBytecode } from './simulate/simulateBytecode.js'
export { stepToTrace } from './simulate/trace.js'
export type {
  CapabilityDescription,
  ChangeNature,
  CompareDiffEntry,
  CompareVariantInput,
  CompareVariantResult,
  CompareVariantsInput,
  CompareVariantsResult,
  EipCapability,
  EipOpcode,
  EipOpcodeImmediate,
  EipProvenance,
  EngineCeilings,
  ForkConfig,
  NamedFork,
  Provenance,
  QueryShape,
  SimulateBytecodeInput,
  SimulateBytecodeResult,
  StabilityRollup,
  StepTrace,
} from './types.js'
export { EngineError } from './types.js'
