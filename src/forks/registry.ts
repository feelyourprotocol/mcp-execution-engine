import { Common, Hardfork, Mainnet } from '@ethereumjs/common'

import { EIP_MODULES, getEipModule } from '../modules/index.js'
import type { EipCapability, EngineCeilings, ForkConfig, NamedFork } from '../types/index.js'
import { EngineError } from '../types/index.js'
import { derivedComparisonForEip, listEipIntroductions } from './introductions.js'
import {
  BASELINE_FORK_ID,
  DEFAULT_PREVIEW_FORK_ID,
  defaultForkShapes,
  FORK_LINEAGE,
  lineageElId,
  lineageForkIds,
  predecessorFork,
  resolveForkAlias,
  successorFork,
} from './lineage.js'

export { BASELINE_FORK_ID, DEFAULT_PREVIEW_FORK_ID }

export const ENGINE_VERSION = '0.1.0'

export const ENGINE_CEILINGS: EngineCeilings = {
  maxGasLimit: 30_000_000n,
  defaultGasLimit: 1_000_000n,
  maxBytecodeBytes: 24_576,
  maxTraceSteps: 10_000,
  maxTxsPerBlock: 8,
}

export const ALLOWED_BASE_HARDFORKS = lineageForkIds()

export type AllowedBaseHardfork = (typeof ALLOWED_BASE_HARDFORKS)[number]

/** Runnable catalog EIPs whose `relatedForks` include this named fork or an alias.
 *  Do not call at module init — EIP modules import the lab path which loads this file.
 */
export function advertisedEipsForFork(id: string, aliases: string[] = []): number[] {
  const names = new Set([id, ...aliases])
  return EIP_MODULES.filter((mod) => mod.relatedForks.some((fork) => names.has(fork)))
    .map((mod) => mod.eip)
    .sort((a, b) => a - b)
}

function buildNamedForks(): NamedFork[] {
  return FORK_LINEAGE.map((def) => ({
    id: def.id,
    label: def.label,
    config: { baseHardfork: def.id, eips: [] },
    stabilityRollup: def.stabilityRollup,
    role: def.role,
    aliases: def.aliases.length > 0 ? def.aliases : undefined,
    summary: def.summary,
    keywords: def.keywords,
    shapes: defaultForkShapes(),
    order: def.order,
    predecessorId: predecessorFork(def.id),
    successorId: successorFork(def.id),
    activatedEips: [...def.activatedEips],
    relatedEips: advertisedEipsForFork(def.id, def.aliases),
    plannedEips: def.plannedEips,
    notes: def.notes,
  }))
}

export const NAMED_FORKS: NamedFork[] = buildNamedForks()

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

/** Live catalog — derived from EIP modules. Unimplemented EIPs are not listed. */
export const EIP_CAPABILITIES = EIP_MODULES

function enrichEipCapabilities(): EipCapability[] {
  return EIP_CAPABILITIES.map((cap) => ({
    ...cap,
    comparison: derivedComparisonForEip(cap.eip),
  }))
}

export function getEipCapability(eip: number) {
  return getEipModule(eip)
}

export function listKnownEips() {
  return [...EIP_CAPABILITIES]
}

function resolveBaseHardfork(id: string): string {
  const canonical = resolveForkAlias(id)
  if (canonical) {
    return canonical
  }
  if (ALLOWED_BASE_HARDFORKS.includes(id as AllowedBaseHardfork)) {
    return id
  }
  return getNamedFork(id)?.config.baseHardfork ?? id
}

export function normalizeForkConfig(input?: ForkConfig): ForkConfig {
  if (!input) {
    return { baseHardfork: DEFAULT_PREVIEW_FORK_ID, eips: [] }
  }

  return {
    baseHardfork: resolveBaseHardfork(input.baseHardfork),
    eips: [...(input.eips ?? [])].sort((a, b) => a - b),
  }
}

export function getNamedFork(id: string): NamedFork | undefined {
  const canonical = resolveForkAlias(id)
  if (canonical) {
    return NAMED_FORKS.find((entry) => entry.id === canonical)
  }
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
  const elId = lineageElId(baseHardfork)
  switch (elId) {
    case 'berlin':
      return Hardfork.Berlin
    case 'london':
      return Hardfork.London
    case 'paris':
      return Hardfork.Paris
    case 'shanghai':
      return Hardfork.Shanghai
    case 'cancun':
      return Hardfork.Cancun
    case 'prague':
      return Hardfork.Prague
    case 'osaka':
      return Hardfork.Osaka
    case 'amsterdam':
      return Hardfork.Amsterdam
    default:
      throw new EngineError(`Unsupported base hardfork: ${baseHardfork}`, 'unsupported_hardfork')
  }
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
    eipIntroductions: listEipIntroductions(),
    baselineForkId: BASELINE_FORK_ID,
    eips: enrichEipCapabilities(),
    allowedBaseHardforks: [...ALLOWED_BASE_HARDFORKS],
    inspectKinds: [
      {
        id: 'block-access-list',
        label: 'Block access list (EIP-7928)',
        summary:
          'JSON (Engine API) or RLP hex. Checks encoding, canonical structure, optional item cap vs block gas limit, and optional blockAccessListHash — not consensus replay against mainnet.',
      },
      {
        id: 'authorization-list',
        label: 'Set-code authorization list',
        summary:
          'One or more signed authorization JSON objects (Pectra+ type-4 txs). Recovers authority address and signing digest per item — not full tx execution.',
      },
      {
        id: 'typed-transaction',
        label: 'EIP-2718 typed transaction',
        summary:
          'Signed tx RLP hex. Decodes type, hash, sender, fee fields; optional hash match. Blob sidecars/KZG not validated.',
      },
      {
        id: 'withdrawals',
        label: 'EIP-4895 withdrawals',
        summary:
          'JSON withdrawal array. Field parse and optional withdrawalsRoot recomputation — list is caller-supplied, not generated from the lab.',
      },
      {
        id: 'execution-requests',
        label: 'EIP-7685 execution requests',
        summary:
          'JSON array of { type, data } request envelopes. Sorted-type check and requestsHash — opaque body bytes, not full SSZ validation.',
      },
    ],
  }
}
