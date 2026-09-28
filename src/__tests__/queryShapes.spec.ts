import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { describeCapabilities } from '../forks/registry.js'
import { mcpToolForShape, QUERY_SHAPE_CATALOG, type QueryShape } from '../types/index.js'

const labCatalogPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../lab/catalog.json',
)

describe('query shape catalog', () => {
  it('maps every shape id to an advertised MCP tool name', () => {
    const ids = QUERY_SHAPE_CATALOG.map((row) => row.id)
    expect(ids).toEqual(['probe', 'simulate', 'transaction', 'block', 'generate', 'inspect'])
    expect(mcpToolForShape('simulate')).toBe('run_bytecode')
    expect(mcpToolForShape('generate')).toBe('generate_artifact')
    expect(mcpToolForShape('inspect')).toBe('inspect_artifact')
  })

  it('stays in sync with lab/catalog.json mcpTool fields', () => {
    const lab = JSON.parse(readFileSync(labCatalogPath, 'utf8')) as {
      shapes: { id: string; mcpTool: string; engineFn: string }[]
    }
    for (const row of QUERY_SHAPE_CATALOG) {
      const labRow = lab.shapes.find((entry) => entry.id === row.id)
      expect(labRow).toBeDefined()
      expect(labRow?.mcpTool).toBe(row.mcpTool)
      expect(labRow?.engineFn).toBe(row.engineFn)
    }
  })

  it('probe emits queryShapes and tools, not shape ids on eips or forks', () => {
    const caps = describeCapabilities()
    expect(caps.queryShapes).toHaveLength(6)
    const e7928 = caps.eips.find((row) => row.eip === 7928)
    expect(e7928?.tools).toEqual(['generate_artifact', 'inspect_artifact'])
    expect('shapes' in (e7928 ?? {})).toBe(false)
    const intro = caps.eipIntroductions.find((row) => row.eip === 7928)
    expect(intro?.observableTools).toEqual(['generate_artifact', 'inspect_artifact'])
    expect('observableShapes' in (intro ?? {})).toBe(false)
    const e8024 = caps.eips.find((row) => row.eip === 8024)
    expect(e8024?.tools).toEqual(['run_bytecode'])
  })

  it('covers the QueryShape union', () => {
    const covered = new Set(QUERY_SHAPE_CATALOG.map((row) => row.id))
    const all: QueryShape[] = ['simulate', 'transaction', 'block', 'generate', 'inspect', 'probe']
    expect(all.every((id) => covered.has(id))).toBe(true)
  })
})
