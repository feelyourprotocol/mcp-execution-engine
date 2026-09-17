import type { ForkRole, QueryShape, StabilityRollup } from '../types/index.js'
import { EngineError } from '../types/index.js'

/**
 * Catalog ids for named forks (Berlin→Glamsterdam).
 * From Shapella on, the combined upgrade name is canonical; the EL city name is an alias.
 * EthereumJS Common still uses `elId` (shanghai, cancun, prague, osaka, amsterdam).
 */
export const LINEAGE_FORK_IDS = [
  'berlin',
  'london',
  'paris',
  'shapella',
  'dencun',
  'pectra',
  'fusaka',
  'glamsterdam',
] as const

export type LineageForkId = (typeof LINEAGE_FORK_IDS)[number]

export const BASELINE_FORK_ID: LineageForkId = 'fusaka'

export const DEFAULT_PREVIEW_FORK_ID: LineageForkId = 'glamsterdam'

const FORK_SHAPES: QueryShape[] = ['simulate', 'transaction', 'block']

/** Hardfork ids that exist in the client but are not MCP catalog targets. */
const UNSUPPORTED_HARDFORK_IDS = new Set([
  'bpo1',
  'bpo2',
  'bpo3',
  'bpo4',
  'bpo5',
  'mergeNetsplitBlock',
  'merge-netsplit-block',
  // Difficulty-bomb delay forks — not catalog run targets (lineage jumps Berlin → London → Paris).
  'arrowglacier',
  'arrow-glacier',
  'grayglacier',
  'gray-glacier',
  'muirglacier',
  'muir-glacier',
])

export interface LineageForkDefinition {
  id: LineageForkId
  /** EthereumJS `Hardfork` name — same as `id` until Shapella. */
  elId: string
  order: number
  label: string
  aliases: string[]
  role: ForkRole
  stabilityRollup: StabilityRollup
  activatedEips: number[]
  keywords: string[]
  summary: string
  notes?: string
  plannedEips?: number[]
}

export const FORK_LINEAGE: LineageForkDefinition[] = [
  {
    id: 'berlin',
    elId: 'berlin',
    order: 0,
    label: 'Berlin',
    aliases: [],
    role: 'historical',
    stabilityRollup: 'firm',
    activatedEips: [2565, 2718, 2929, 2930],
    keywords: ['berlin', 'access list', '2929', '2930', 'modexp'],
    summary:
      'Run under Berlin. ModExp repricing (EIP-2565), typed transaction envelope (2718), access-list txs (2930), and EIP-2929 cold/warm gas rules. Lineage floor for this lab.',
    notes: 'Pre-Berlin hardforks (Istanbul and earlier) are not catalog targets in this round.',
  },
  {
    id: 'london',
    elId: 'london',
    order: 1,
    label: 'London',
    aliases: [],
    role: 'historical',
    stabilityRollup: 'firm',
    activatedEips: [1559, 3198, 3529, 3541],
    keywords: ['london', '1559', 'eip-1559', 'base fee', 'fee market', 'basefee opcode'],
    summary:
      'Run under London. EIP-1559 fee market, BASEFEE opcode (3198), SELFDESTRUCT refund removal (3529), and EIP-3541 initcode prefix rule. Compare with Berlin for pre-1559 paid gas.',
  },
  {
    id: 'paris',
    elId: 'paris',
    order: 2,
    label: 'Paris (The Merge)',
    aliases: ['merge', 'the-merge'],
    role: 'historical',
    stabilityRollup: 'firm',
    activatedEips: [3675, 4399],
    keywords: ['paris', 'merge', 'the merge', 'proof of stake', 'pos'],
    summary:
      'Run caller-supplied bytecode, a transaction, or a lab block under Paris (The Merge). Proof-of-stake transition rules on the EL; alias merge. Isolated lab does not replay consensus — compare with predecessor forks for EL opcode and gas deltas.',
    notes:
      'Canonical name for the Merge execution-layer upgrade (EIP-8133). No Shapella-style portmanteau.',
  },
  {
    id: 'shapella',
    elId: 'shanghai',
    order: 3,
    label: 'Shapella',
    aliases: ['shanghai'],
    role: 'historical',
    stabilityRollup: 'firm',
    activatedEips: [3651, 3855, 3860, 4895],
    keywords: ['shapella', 'shanghai', 'push0', 'withdrawals'],
    summary:
      'Run under Shapella (EL alias shanghai). PUSH0, warm coinbase, initcode metering, and withdrawal operations activate here. Compare with Paris for pre-PUSH0 bytecode.',
    notes:
      'Withdrawals (4895) are not fully observable in this isolated EL lab — listed in eipIntroductions for when they appeared.',
  },
  {
    id: 'dencun',
    elId: 'cancun',
    order: 4,
    label: 'Dencun',
    aliases: ['cancun'],
    role: 'historical',
    stabilityRollup: 'firm',
    activatedEips: [1153, 4844, 4788, 5656, 6780, 7516],
    keywords: ['dencun', 'cancun', 'blobs', '4844', 'tload', 'transient storage'],
    summary:
      'Run under Dencun (EL alias cancun). Transient storage, MCOPY, blob fee opcode, selfdestruct rules, and beacon-root push activate here. Blob txs are not in scope for this lab.',
  },
  {
    id: 'pectra',
    elId: 'prague',
    order: 5,
    label: 'Pectra',
    aliases: ['prague'],
    role: 'historical',
    stabilityRollup: 'firm',
    activatedEips: [2537, 2935, 6110, 7002, 7251, 7623, 7685, 7691, 7702],
    keywords: ['pectra', 'prague', '7702', 'account abstraction'],
    summary:
      'Run under Pectra (EL alias prague). Includes EIP-7702 set-code delegation and other Pectra EL changes. Compare with Dencun for pre-7702 behavior.',
  },
  {
    id: 'fusaka',
    elId: 'osaka',
    order: 6,
    label: 'Fusaka',
    aliases: ['osaka', 'mainnet-el'],
    role: 'current',
    stabilityRollup: 'firm',
    activatedEips: [7594, 7823, 7825, 7883, 7892, 7939, 7951, 7918],
    keywords: ['fusaka', 'osaka', 'mainnet', 'mainnet-el', 'current mainnet'],
    summary:
      'Run under Fusaka (EL alias osaka, role alias mainnet-el) — current mainnet EL baseline. ModExp repricing and secp256r1 precompile activate here. Compare with predecessor Pectra for fork deltas.',
  },
  {
    id: 'glamsterdam',
    elId: 'amsterdam',
    order: 7,
    label: 'Glamsterdam',
    aliases: ['amsterdam'],
    role: 'preview',
    stabilityRollup: 'stabilizing',
    activatedEips: [
      2780, 7708, 7843, 7778, 7928, 7954, 7976, 7981, 7997, 8024, 8037, 8038, 8246, 8282,
    ],
    keywords: ['glamsterdam', 'amsterdam', 'preview fork', 'upcoming hardfork'],
    summary:
      'Run under Glamsterdam (EL alias amsterdam) — default preview fork. Upcoming EL bundle; compare with Fusaka for mainnet-today deltas. You do not need to name an EIP.',
    notes:
      'Advertised FYP runnable modules are a subset of the bundled fork. Other bundled changes may execute but are not catalogued until a shipped verb can show them honestly.',
  },
]

export function lineageForkIds(): LineageForkId[] {
  return [...LINEAGE_FORK_IDS]
}

export function getLineageDefinition(id: string): LineageForkDefinition | undefined {
  const canonical = resolveForkAlias(id)
  if (!canonical) {
    return undefined
  }
  return FORK_LINEAGE.find((entry) => entry.id === canonical)
}

/** EthereumJS hardfork name for a catalog id or alias. */
export function lineageElId(id: string): string | undefined {
  return getLineageDefinition(id)?.elId
}

/** Map alias or id to canonical lineage fork id. Returns undefined for unsupported ids. */
export function resolveForkAlias(id: string): LineageForkId | undefined {
  const normalized = id.trim().toLowerCase()
  if (UNSUPPORTED_HARDFORK_IDS.has(normalized)) {
    return undefined
  }
  if (LINEAGE_FORK_IDS.includes(normalized as LineageForkId)) {
    return normalized as LineageForkId
  }
  const byAlias = FORK_LINEAGE.find((entry) =>
    entry.aliases.some((alias) => alias.toLowerCase() === normalized),
  )
  return byAlias?.id
}

export function assertResolvableForkId(id: string): LineageForkId {
  const resolved = resolveForkAlias(id)
  if (!resolved) {
    if (UNSUPPORTED_HARDFORK_IDS.has(id.trim().toLowerCase())) {
      throw new EngineError(
        `Hardfork not supported in the lab catalog: ${id}`,
        'unsupported_hardfork',
      )
    }
    throw new EngineError(`Unknown named fork: ${id}`, 'unknown_named_fork')
  }
  return resolved
}

export function predecessorFork(id: string): LineageForkId | undefined {
  const canonical = resolveForkAlias(id)
  if (!canonical) {
    return undefined
  }
  const entry = FORK_LINEAGE.find((row) => row.id === canonical)
  if (!entry || entry.order === 0) {
    return undefined
  }
  return FORK_LINEAGE[entry.order - 1]?.id
}

export function successorFork(id: string): LineageForkId | undefined {
  const canonical = resolveForkAlias(id)
  if (!canonical) {
    return undefined
  }
  const entry = FORK_LINEAGE.find((row) => row.id === canonical)
  if (!entry || entry.order >= FORK_LINEAGE.length - 1) {
    return undefined
  }
  return FORK_LINEAGE[entry.order + 1]?.id
}

export function defaultForkShapes(): QueryShape[] {
  return [...FORK_SHAPES]
}
