import { predecessorFork } from '../forks/lineage.js'
import {
  advertisedEipsForForkConfig,
  getEipCapability,
  getNamedFork,
  NAMED_FORKS,
} from '../forks/registry.js'
import type { EipProvenance, ForkConfig, Provenance, StabilityRollup } from '../types/index.js'

export const PROVENANCE_AS_OF = '2026-07-20'

function rollupFromForkConfig(config: ForkConfig): StabilityRollup | undefined {
  const eips = config.eips ?? []
  if (eips.length > 0) {
    const statuses = eips
      .map((eip) => getEipCapability(eip)?.status)
      .filter((value): value is string => Boolean(value))

    if (statuses.some((status) => status === 'Draft')) {
      return 'experimental'
    }
    if (statuses.some((status) => status === 'Review' || status === 'Last Call')) {
      return 'emerging'
    }

    return 'emerging'
  }

  const named = NAMED_FORKS.find((entry) => entry.config.baseHardfork === config.baseHardfork)
  if (named?.stabilityRollup) {
    return named.stabilityRollup
  }

  return 'stabilizing'
}

function buildPerEipProvenance(config: ForkConfig): EipProvenance[] | undefined {
  const eips = advertisedEipsForForkConfig(config)
  if (eips.length === 0) {
    return undefined
  }

  return eips.map((eip) => {
    const capability = getEipCapability(eip)
    return {
      eip,
      status: capability?.status,
      implMaturity: capability?.implMaturity,
      testMaturity: capability?.testMaturity,
      specAnchor: capability?.specAnchor,
    }
  })
}

function forkDisplayName(config: ForkConfig): string {
  const named = getNamedFork(config.baseHardfork)
  if (config.baseHardfork === 'paris') {
    return 'paris (The Merge)'
  }
  return named?.label ?? config.baseHardfork
}

function buildCaveat(engineVersion: string, config: ForkConfig, rollup?: StabilityRollup): string {
  const explicit = [...(config.eips ?? [])]
  const advertised = advertisedEipsForForkConfig(config)
  const eipList =
    explicit.length > 0
      ? ` with EIP(s) ${explicit.join(', ')}`
      : advertised.length > 0
        ? ` (advertised modules: ${advertised.join(', ')})`
        : ''
  const rollupNote = rollup ? ` Stability: ${rollup}.` : ''
  const named = getNamedFork(config.baseHardfork)
  let activationNote: string
  if (named?.role === 'current') {
    activationNote =
      ' Rules reflect the current mainnet EL baseline as implemented in this engine build.'
  } else if (named?.role === 'preview') {
    activationNote =
      ' Fork rules may change before mainnet activation — verify against latest spec.'
  } else {
    activationNote =
      ' Historical fork rules — compare with predecessorForkId or eipIntroductions for before/after pairs.'
  }
  return (
    `Result from mcp-execution-engine v${engineVersion} simulating ${forkDisplayName(config)}${eipList}.` +
    `${rollupNote}${activationNote}`
  )
}

export function buildProvenance(engineVersion: string, forkConfig: ForkConfig): Provenance {
  const config = { ...forkConfig, eips: [...(forkConfig.eips ?? [])] }
  const stabilityRollup = rollupFromForkConfig(config)
  const pred = predecessorFork(config.baseHardfork)

  return {
    engineVersion,
    forkConfig: config,
    predecessorForkId: pred,
    perEip: buildPerEipProvenance(config),
    stabilityRollup,
    caveat: buildCaveat(engineVersion, config, stabilityRollup),
    asOf: PROVENANCE_AS_OF,
  }
}
