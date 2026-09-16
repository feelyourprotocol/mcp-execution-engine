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
  maxTxsPerBlock: 8,
}

export const BASELINE_FORK_ID = 'osaka'

export const ALLOWED_BASE_HARDFORKS = ['prague', 'osaka', 'amsterdam'] as const

export type AllowedBaseHardfork = (typeof ALLOWED_BASE_HARDFORKS)[number]

const FORK_SHAPES: NamedFork['shapes'] = ['simulate', 'transaction', 'block']

/** Runnable catalog EIPs whose `relatedForks` include this named fork or an alias.
 *  Do not call at module init — EIP modules import the lab path which loads this file.
 */
export function advertisedEipsForFork(id: string, aliases: string[] = []): number[] {
  const names = new Set([id, ...aliases])
  return EIP_MODULES.filter((mod) => mod.relatedForks.some((fork) => names.has(fork)))
    .map((mod) => mod.eip)
    .sort((a, b) => a - b)
}

/**
 * Advertised modules for provenance on a run. Explicit `eips[]` wins;
 * otherwise the named-fork catalog row (generic hardfork run).
 */
export function advertisedEipsForForkConfig(config: ForkConfig): number[] {
  if (config.eips !== undefined && config.eips.length > 0) {
    return [...config.eips].sort((a, b) => a - b)
  }
  const named = NAMED_FORKS.find((entry) => entry.config.baseHardfork === config.baseHardfork)
  return named?.relatedEips ?? []
}

export const NAMED_FORKS: NamedFork[] = [
  {
    id: 'prague',
    label: 'Prague (pre-Fusaka ModExp)',
    config: { baseHardfork: 'prague', eips: [] },
    stabilityRollup: 'firm',
    role: 'baseline',
    summary:
      'Run caller-supplied bytecode, a transaction, or a lab block under Prague. Historical EL fork — use it to compare ModExp gas against Osaka (Fusaka). You do not need to name an EIP.',
    keywords: ['prague', 'pre-fusaka', 'historical fork', 'ModExp compare'],
    shapes: FORK_SHAPES,
    relatedEips: [7883],
    comparison: {
      baselineForkId: 'prague',
      previewForkId: 'osaka',
      note: 'ModExp (0x05) gas formula changed at Fusaka. Run the same program on prague then osaka.',
    },
    notes:
      'Prague is in the catalog for Osaka-era ModExp compare (EIP-7883). Generic runs are supported; omit eips[].',
  },
  {
    id: 'osaka',
    label: 'Osaka (current mainnet EL)',
    config: { baseHardfork: 'osaka', eips: [] },
    stabilityRollup: 'firm',
    role: 'baseline',
    aliases: ['mainnet-el'],
    summary:
      'Run caller-supplied bytecode, a transaction, or a lab block under Osaka (current mainnet EL; alias mainnet-el). Use as the baseline when comparing against Amsterdam, or for Osaka-era precompiles. You do not need to name an EIP.',
    keywords: ['osaka', 'mainnet', 'mainnet-el', 'fusaka', 'current mainnet', 'baseline fork'],
    shapes: FORK_SHAPES,
    relatedEips: [7883, 7951],
    comparison: {
      baselineForkId: 'osaka',
      previewForkId: 'amsterdam',
      note: 'Current mainnet EL. Run twice against amsterdam for upcoming-fork deltas. Prague is the historical ModExp baseline.',
    },
    notes:
      'Osaka is the default comparison baseline (baselineForkId). Omit eips[] for a generic mainnet-rules run.',
  },
  {
    id: 'amsterdam',
    label: 'Amsterdam (scheduled EL fork)',
    config: { baseHardfork: 'amsterdam', eips: [] },
    stabilityRollup: 'stabilizing',
    role: 'preview',
    aliases: ['glamsterdam'],
    summary:
      'Run caller-supplied bytecode, a transaction, or a lab block under Amsterdam (alias glamsterdam). Default fork. Upcoming EL preview — compare against Osaka for mainnet today. You do not need to name an EIP.',
    keywords: [
      'amsterdam',
      'glamsterdam',
      'preview fork',
      'upcoming hardfork',
      'future protocol',
      'scheduled EL',
    ],
    shapes: FORK_SHAPES,
    // Advertised catalog only — keep in sync with advertisedEipsForFork (tested).
    relatedEips: [7708, 7843, 8024, 8037, 8038],
    plannedEips: [7928],
    comparison: {
      baselineForkId: 'osaka',
      previewForkId: 'amsterdam',
      note: 'Default lab fork. Omit fork (or pass amsterdam with empty eips[]) for a generic preview run. Optionally run the same input on osaka to diff gas, success, logs, or traces.',
    },
    notes:
      'Amsterdam in EthereumJS v10 already bundles the advertised modules. Passing eips:[8024] is accepted but is not a pre/post toggle. Other bundled protocol changes may execute but are not catalogued until a shipped verb can honestly show them. EIP-7928 BAL generate is planned.',
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
  return getNamedFork(id)?.config.baseHardfork ?? id
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

export function getNamedFork(id: string): NamedFork | undefined {
  return NAMED_FORKS.find((entry) => entry.id === id || (entry.aliases?.includes(id) ?? false))
}

export function resolveNamedFork(id: string): ForkConfig {
  const named = getNamedFork(id)
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
      maxTxsPerBlock: ENGINE_CEILINGS.maxTxsPerBlock,
    },
    namedForks: NAMED_FORKS,
    baselineForkId: BASELINE_FORK_ID,
    eips: EIP_CAPABILITIES,
    allowedBaseHardforks: [...ALLOWED_BASE_HARDFORKS],
  }
}
