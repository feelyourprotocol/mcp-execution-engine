import { Common, Hardfork, Mainnet } from '@ethereumjs/common'

import { EIP_MODULES, getEipModule } from '../modules/index.js'
import type { EngineCeilings, ForkConfig, NamedFork } from '../types.js'
import { EngineError } from '../types.js'

export const ENGINE_VERSION = '0.1.0'

export const ENGINE_CEILINGS: EngineCeilings = {
  maxGasLimit: 30_000_000n,
  defaultGasLimit: 1_000_000n,
  maxBytecodeBytes: 24_576,
  maxTraceSteps: 10_000,
}

export const BASELINE_FORK_ID = 'osaka'

export const ALLOWED_BASE_HARDFORKS = ['prague', 'osaka', 'amsterdam'] as const

export type AllowedBaseHardfork = (typeof ALLOWED_BASE_HARDFORKS)[number]

export const NAMED_FORKS: NamedFork[] = [
  {
    id: 'prague',
    label: 'Prague (pre-Fusaka ModExp)',
    config: { baseHardfork: 'prague', eips: [] },
    stabilityRollup: 'firm',
    role: 'baseline',
  },
  {
    id: 'osaka',
    label: 'Osaka (current mainnet EL)',
    config: { baseHardfork: 'osaka', eips: [] },
    stabilityRollup: 'firm',
    role: 'baseline',
    aliases: ['mainnet-el'],
  },
  {
    id: 'amsterdam',
    label: 'Amsterdam (scheduled EL fork)',
    config: { baseHardfork: 'amsterdam', eips: [] },
    stabilityRollup: 'stabilizing',
    role: 'preview',
    aliases: ['glamsterdam'],
  },
]

/** Live catalog — derived from EIP modules. Unimplemented EIPs are not listed. */
export const EIP_CAPABILITIES = EIP_MODULES

export function getEipCapability(eip: number) {
  return getEipModule(eip)
}

export function listKnownEips() {
  return [...EIP_CAPABILITIES]
}

function resolveBaseHardfork(id: string): string {
  if (ALLOWED_BASE_HARDFORKS.includes(id as AllowedBaseHardfork)) {
    return id
  }
  const named = NAMED_FORKS.find((entry) => entry.aliases?.includes(id))
  if (named) {
    return named.config.baseHardfork
  }
  return id
}

export function normalizeForkConfig(input?: ForkConfig): ForkConfig {
  if (!input) {
    return { baseHardfork: 'amsterdam', eips: [] }
  }

  return {
    baseHardfork: resolveBaseHardfork(input.baseHardfork),
    eips: [...(input.eips ?? [])].sort((a, b) => a - b),
  }
}

export function resolveNamedFork(id: string): ForkConfig {
  const named = NAMED_FORKS.find(
    (entry) => entry.id === id || (entry.aliases?.includes(id) ?? false),
  )
  if (!named) {
    throw new EngineError(`Unknown named fork: ${id}`, 'unknown_named_fork')
  }
  return normalizeForkConfig(named.config)
}

export function hardforkToEnum(baseHardfork: string): Hardfork {
  if (baseHardfork === 'prague') {
    return Hardfork.Prague
  }
  if (baseHardfork === 'osaka') {
    return Hardfork.Osaka
  }
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
    if (getEipModule(eip) === undefined) {
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
    baselineForkId: BASELINE_FORK_ID,
    eips: EIP_CAPABILITIES,
    allowedBaseHardforks: [...ALLOWED_BASE_HARDFORKS],
  }
}
