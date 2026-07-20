import { Common, Hardfork, Mainnet } from '@ethereumjs/common'

import { listPresets } from '../presets/index.js'
import type { EipCapability, EngineCeilings, ForkConfig, NamedFork } from '../types.js'
import { EngineError } from '../types.js'

export const ENGINE_VERSION = '0.1.0'

export const ENGINE_CEILINGS: EngineCeilings = {
  maxGasLimit: 30_000_000n,
  defaultGasLimit: 1_000_000n,
  maxBytecodeBytes: 24_576,
  maxTraceSteps: 10_000,
}

export const ALLOWED_BASE_HARDFORKS = ['amsterdam'] as const

export type AllowedBaseHardfork = (typeof ALLOWED_BASE_HARDFORKS)[number]

export const NAMED_FORKS: NamedFork[] = [
  {
    id: 'amsterdam',
    label: 'Amsterdam (scheduled EL fork)',
    config: { baseHardfork: 'amsterdam', eips: [] },
    stabilityRollup: 'stabilizing',
  },
]

/** Curated EIP capabilities — basic provenance, optional fields, tighten over time. */
export const EIP_CAPABILITIES: EipCapability[] = [
  {
    eip: 8024,
    name: 'Backward compatible SWAPN, DUPN, EXCHANGE',
    changeNature: 'new-capability',
    shapes: ['simulate', 'compare'],
    status: 'Review',
    forkInclusion: 'Scheduled',
    implMaturity: 'Implemented in EthereumJS (website + engine)',
    testMaturity: 'Exploration parity tests',
    specAnchor: 'EIP-8024',
  },
  {
    eip: 7883,
    name: 'ModExp gas cost increase',
    changeNature: 'repricing',
    shapes: ['simulate', 'compare'],
    status: 'Review',
    forkInclusion: 'Scheduled',
    implMaturity: 'Implemented in website exploration',
    testMaturity: 'Exploration parity tests',
    specAnchor: 'EIP-7883',
  },
  {
    eip: 7928,
    name: 'Block-level access lists',
    changeNature: 'new-structure',
    shapes: ['generate', 'simulate'],
    status: 'Review',
    forkInclusion: 'Scheduled',
    implMaturity: 'Implemented in website exploration',
    testMaturity: 'Exploration parity tests',
    specAnchor: 'EIP-7928',
  },
  {
    eip: 7951,
    name: 'secp256r1 precompile',
    changeNature: 'new-capability',
    shapes: ['simulate', 'compare'],
    status: 'Review',
    forkInclusion: 'Scheduled',
    implMaturity: 'Implemented in website exploration',
    testMaturity: 'Exploration parity tests',
    specAnchor: 'EIP-7951',
  },
  {
    eip: 8141,
    name: 'Frame transactions',
    changeNature: 'new-exec-model',
    shapes: ['simulate'],
    status: 'Draft',
    forkInclusion: 'Proposed',
    implMaturity: 'Not yet in engine',
    notes: 'Far-future research EIP — speculative activation only when implemented.',
  },
]

const eipByNumber = new Map(EIP_CAPABILITIES.map((entry) => [entry.eip, entry]))

export function getEipCapability(eip: number): EipCapability | undefined {
  return eipByNumber.get(eip)
}

export function listKnownEips(): EipCapability[] {
  return [...EIP_CAPABILITIES]
}

export function normalizeForkConfig(input?: ForkConfig): ForkConfig {
  if (!input) {
    return { baseHardfork: 'amsterdam', eips: [] }
  }

  return {
    baseHardfork: input.baseHardfork,
    eips: [...(input.eips ?? [])].sort((a, b) => a - b),
  }
}

export function resolveNamedFork(id: string): ForkConfig {
  const named = NAMED_FORKS.find((entry) => entry.id === id)
  if (!named) {
    throw new EngineError(`Unknown named fork: ${id}`, 'unknown_named_fork')
  }
  return normalizeForkConfig(named.config)
}

export function hardforkToEnum(baseHardfork: string): Hardfork {
  if (baseHardfork === 'amsterdam') {
    return Hardfork.Amsterdam
  }
  throw new EngineError(`Unsupported base hardfork: ${baseHardfork}`, 'unsupported_hardfork')
}

export function buildCommon(config: ForkConfig): Common {
  const fork = normalizeForkConfig(config)
  assertForkAllowed(fork)

  const hardfork = hardforkToEnum(fork.baseHardfork)
  const eips = fork.eips ?? []

  return new Common({
    chain: Mainnet,
    hardfork,
    eips,
  })
}

export function assertForkAllowed(config: ForkConfig): void {
  const fork = normalizeForkConfig(config)

  if (!ALLOWED_BASE_HARDFORKS.includes(fork.baseHardfork as AllowedBaseHardfork)) {
    throw new EngineError(
      `Base hardfork not allowed: ${fork.baseHardfork}. Allowed: ${ALLOWED_BASE_HARDFORKS.join(', ')}`,
      'unsupported_hardfork',
    )
  }

  for (const eip of fork.eips ?? []) {
    if (!eipByNumber.has(eip)) {
      throw new EngineError(
        `EIP ${eip} is not registered in the capability registry`,
        'unknown_eip',
      )
    }
  }
}

export function describeCapabilities() {
  return {
    engineVersion: ENGINE_VERSION,
    ceilings: {
      maxGasLimit: ENGINE_CEILINGS.maxGasLimit.toString(),
      defaultGasLimit: ENGINE_CEILINGS.defaultGasLimit.toString(),
      maxBytecodeBytes: ENGINE_CEILINGS.maxBytecodeBytes,
      maxTraceSteps: ENGINE_CEILINGS.maxTraceSteps,
    },
    namedForks: NAMED_FORKS,
    eips: EIP_CAPABILITIES,
    allowedBaseHardforks: [...ALLOWED_BASE_HARDFORKS],
    presets: listPresets(),
  }
}
