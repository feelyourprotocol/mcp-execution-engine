import { EngineError } from './errors.js'
import type { QueryShape } from './protocol.js'

/**
 * Advertised MCP tool names. Catalog join only — this package has no MCP transport.
 * Gateway `registerTool` strings must match `mcpTool`.
 */
export type McpToolName =
  | 'describe_capabilities'
  | 'run_bytecode'
  | 'run_transaction'
  | 'run_block'
  | 'generate_artifact'
  | 'inspect_artifact'

export interface QueryShapeCatalogEntry {
  id: QueryShape
  mcpTool: McpToolName
  engineFn: string
  summary: string
}

/** Live probe dictionary row — no engine function names. */
export interface QueryShapeDescriptor {
  id: QueryShape
  mcpTool: McpToolName
  summary: string
}

/** Shape id → MCP tool. Source of truth for the live probe `queryShapes[]` join. */
export const QUERY_SHAPE_CATALOG: readonly QueryShapeCatalogEntry[] = [
  {
    id: 'probe',
    mcpTool: 'describe_capabilities',
    engineFn: 'describeCapabilities',
    summary: 'Describe supported forks, runnable EIP modules, opcodes, and encoding.',
  },
  {
    id: 'simulate',
    mcpTool: 'run_bytecode',
    engineFn: 'simulateBytecode',
    summary: 'Run raw bytecode under a fork / EIP configuration; optional execution trace.',
  },
  {
    id: 'transaction',
    mcpTool: 'run_transaction',
    engineFn: 'runTransaction',
    summary: 'Run a value-bearing transaction (paid gas, receipt logs, EIP-8037 dimensions).',
  },
  {
    id: 'block',
    mcpTool: 'run_block',
    engineFn: 'runBlock',
    summary: 'Run 1–8 impersonated txs as a lab block; optional header slot/number/timestamp.',
  },
  {
    id: 'generate',
    mcpTool: 'generate_artifact',
    engineFn: 'generateArtifact',
    summary: 'Derive structured artifacts from a lab block (block-access-list / EIP-7928 first).',
  },
  {
    id: 'inspect',
    mcpTool: 'inspect_artifact',
    engineFn: 'inspectArtifact',
    summary: 'Judge caller-supplied structures (BAL JSON or RLP) without chain state.',
  },
]

export function mcpToolForShape(shape: QueryShape): McpToolName {
  const row = QUERY_SHAPE_CATALOG.find((entry) => entry.id === shape)
  if (row === undefined) {
    throw new EngineError(`Unknown query shape: ${String(shape)}`, 'unknown_query_shape')
  }
  return row.mcpTool
}

export function mcpToolsForShapes(shapes: readonly QueryShape[]): McpToolName[] {
  return shapes.map(mcpToolForShape)
}

/** Probe `queryShapes[]` — dictionary only; no engine function names. */
export function queryShapeDescriptors(): QueryShapeDescriptor[] {
  return QUERY_SHAPE_CATALOG.map(({ id, mcpTool, summary }) => ({ id, mcpTool, summary }))
}
