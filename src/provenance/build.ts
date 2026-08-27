import { getEipCapability, NAMED_FORKS } from '../forks/registry.js'
import type { EipProvenance, ForkConfig, Provenance, StabilityRollup } from '../types.js'

export const PROVENANCE_AS_OF = '2026-07-20'

function rollupFromForkConfig(config: ForkConfig): StabilityRollup | undefined {
  const named = NAMED_FORKS.find(
    (entry) =>
      entry.config.baseHardfork === config.baseHardfork &&
      JSON.stringify(entry.config.eips ?? []) === JSON.stringify(config.eips ?? []),
  )
  if (named?.stabilityRollup) {
    return named.stabilityRollup
  }

  const eips = config.eips ?? []
  if (eips.length === 0) {
    return 'stabilizing'
  }

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

function buildPerEipProvenance(config: ForkConfig): EipProvenance[] | undefined {
  const eips = config.eips ?? []
  if (eips.length === 0) {
    return undefined
  }

  return eips.map((eip) => {
    const capability = getEipCapability(eip)
    return {
      eip,
      status: capability?.status,
      forkInclusion: capability?.forkInclusion,
      implMaturity: capability?.implMaturity,
      testMaturity: capability?.testMaturity,
      specAnchor: capability?.specAnchor,
    }
  })
}

function buildCaveat(engineVersion: string, config: ForkConfig, rollup?: StabilityRollup): string {
  const eipList =
    config.eips && config.eips.length > 0 ? ` with EIP(s) ${config.eips.join(', ')}` : ''
  const rollupNote = rollup ? ` Stability: ${rollup}.` : ''
  return (
    `Result from mcp-execution-engine v${engineVersion} simulating ${config.baseHardfork}${eipList}.` +
    `${rollupNote} Fork rules may change before mainnet activation — verify against latest spec.`
  )
}

export function buildProvenance(engineVersion: string, forkConfig: ForkConfig): Provenance {
  const stabilityRollup = rollupFromForkConfig(forkConfig)

  return {
    engineVersion,
    forkConfig,
    perEip: buildPerEipProvenance(forkConfig),
    stabilityRollup,
    caveat: buildCaveat(engineVersion, forkConfig, stabilityRollup),
    asOf: PROVENANCE_AS_OF,
  }
}
