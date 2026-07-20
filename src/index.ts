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
export { getPreset, listPresets, PRESETS } from './presets/index.js'
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
  EipProvenance,
  EngineCeilings,
  ForkConfig,
  NamedFork,
  PresetDefinition,
  Provenance,
  QueryShape,
  SimulateBytecodeInput,
  SimulateBytecodeResult,
  StabilityRollup,
  StepTrace,
} from './types.js'
export { EngineError } from './types.js'
