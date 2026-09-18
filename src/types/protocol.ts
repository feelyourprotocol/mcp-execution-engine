/**
 * Protocol vocabulary shared with the explorations website.
 *
 * Matching names (no shared npm package). Data homes:
 * website `.cursor/rules/eip-canonical-data.mdc`. Add new shared fields here
 * and in website `canonicalTypes.ts` / `TIMELINE.ts` together.
 *
 * | Engine | Website sibling |
 * | --- | --- |
 * | `ChangeNature` | `ChangeNature` |
 * | `QueryShape` | `McpQueryShape` |
 * | `ForkRole` | `TIMELINE` role |
 * | `ForkConfig.baseHardfork` | `taxonomy.timeline` (catalog fork id) |
 * | `EipComparison` | `mcp.comparison` |
 * | `EipProvenance` | `ProtocolChangeIdentity` (`status`, `specUrl`, `specDate`, `testReleaseUrl`) |
 *
 * Website still owns `ProtocolChangeCanonical` (identity, question, tags,
 * `docsStatus`). `EipOpcode` has no website twin yet (encoding facts).
 */

/** Query shapes the MCP surface exposes (generic verbs). */
export type QueryShape = 'simulate' | 'transaction' | 'block' | 'generate' | 'inspect' | 'probe'

/** Nature of a protocol change — drives which query shapes apply. */
export type ChangeNature =
  | 'repricing'
  | 'new-capability'
  | 'new-structure'
  | 'new-exec-model'
  | 'limit'
  | 'economic'

export type StabilityRollup = 'experimental' | 'emerging' | 'stabilizing' | 'firm'

/**
 * Named fork role in the Berlin→Glamsterdam lineage.
 * Roles rotate as mainnet moves; advertised EIP twins stay on the fork
 * that introduced them until an explicit cleanup — not when they activate.
 */
export type ForkRole = 'historical' | 'current' | 'preview'

/** À-la-carte or named fork capability set. */
export interface ForkConfig {
  /**
   * Catalog fork id (combined upgrade name from Shapella on: shapella, dencun,
   * pectra, fusaka, glamsterdam). EL city names (shanghai, osaka, amsterdam, …)
   * and `mainnet-el` are aliases — `normalizeForkConfig` maps them to the catalog id.
   * EthereumJS Common uses lineage `elId`.
   */
  baseHardfork: string
  eips?: number[]
}

/** How to compare a preview EIP against the live baseline fork. */
export interface EipComparison {
  baselineForkId: string
  previewForkId: string
  note?: string
}

export interface EipProvenance {
  eip: number
  status?: string
  /** Commit-pinned GitHub blob URL of the EIP markdown this module implements. */
  specUrl?: string
  /** UTC calendar date (`YYYY-MM-DD`) of the GitHub commit in `specUrl`. */
  specDate?: string
  /** execution-specs test release this snapshot was aligned with. */
  testReleaseUrl?: string
}

/** EST tag EthereumJS Glamsterdam preview currently aligns with. Refresh with website update-ethereumjs. */
export const GLAMSTERDAM_DEVNET_TEST_RELEASE_URL =
  'https://github.com/ethereum/execution-specs/releases/tag/tests-glamsterdam-devnet@v8.1.0'

export interface EipOpcodeImmediate {
  /** Spec formula so agents can construct bytecode (not a demo program). */
  encoding: string
  minDepth?: number
  maxDepth?: number
  notes?: string
}

/** Opcode this EIP adds or changes — facts for constructing requests. */
export interface EipOpcode {
  name: string
  opcode: number
  opcodeHex: string
  effect: string
  immediate?: EipOpcodeImmediate
}
