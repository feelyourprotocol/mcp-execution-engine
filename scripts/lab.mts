#!/usr/bin/env node
/**
 * Lab runner — explore query shapes, I/O contracts, and examples.
 * Runs against src/ via tsx (no build required).
 *
 *   npm run lab
 *   npm run lab -- overview
 *   npm run lab -- list
 *   npm run lab -- run simulate/01-push1-stop
 *   npm run lab -- io simulate
 *   npm run lab -- endpoints
 *   npm run lab -- shapes
 */

import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { runBlock } from '../src/block/runBlock.js'
import { describeCapabilities } from '../src/forks/registry.js'
import { simulateBytecode } from '../src/simulate/simulateBytecode.js'
import { runTransaction } from '../src/transaction/runTransaction.js'
import type { RunBlockInput, RunTransactionInput, SimulateBytecodeInput } from '../src/types.js'
import { EngineError } from '../src/types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LAB_ROOT = join(__dirname, '..', 'lab')

interface CatalogShape {
  id: string
  status: string
  engineFn: string
  mcpTool: string | null
  transport: Record<string, string>
  summary: string
}

interface CatalogExample {
  id: string
  shape: string
  title: string
  input: string | null
  notes: string
}

interface Catalog {
  engineVersion: string
  mcpDocs: string
  shapes: CatalogShape[]
  examples: CatalogExample[]
}

function loadCatalog(): Catalog {
  const raw = readFileSync(join(LAB_ROOT, 'catalog.json'), 'utf8')
  return JSON.parse(raw) as Catalog
}

function readLabFile(relativePath: string): string {
  return readFileSync(join(LAB_ROOT, relativePath), 'utf8')
}

function printJson(value: unknown): void {
  console.log(JSON.stringify(value, null, 2))
}

function usage(): void {
  console.log(`fyp-engine lab — explore shapes, I/O, and examples

Commands:
  overview          What we have (shapes + engine version)
  shapes            List query shapes and status
  endpoints         Print lab/endpoints/README.md (engine vs gateway vs URL)
  io <shape>        Print lab/shapes/<shape>/io.md (simulate, transaction, block)
  list              Runnable examples
  run <example-id>  Run an example (e.g. simulate/01-push1-stop)

Examples:
  npm run lab
  npm run lab -- run simulate/01-push1-stop
  npm run lab -- io simulate
  npm run lab -- endpoints

Read first: lab/START.md
`)
}

function cmdOverview(catalog: Catalog): void {
  console.log(`mcp-execution-engine v${catalog.engineVersion}`)
  console.log(`MCP docs: ${catalog.mcpDocs}`)
  console.log('')
  console.log('Query shapes:')
  for (const shape of catalog.shapes) {
    const tool = shape.mcpTool ?? '(TBD)'
    console.log(`  ${shape.id.padEnd(10)} [${shape.status.padEnd(8)}] ${shape.engineFn.padEnd(22)} → ${tool}`)
  }
  console.log('')
  console.log('Next: npm run lab -- list')
  console.log('      npm run lab -- run simulate/01-push1-stop')
  console.log('      Read lab/START.md for the full picture')
}

function cmdShapes(catalog: Catalog): void {
  for (const shape of catalog.shapes) {
    console.log(`${shape.id} (${shape.status})`)
    console.log(`  ${shape.summary}`)
    console.log(`  Engine: ${shape.engineFn}  MCP tool: ${shape.mcpTool ?? 'TBD'}`)
    console.log('')
  }
}

function cmdEndpoints(): void {
  console.log(readLabFile('endpoints/README.md'))
}

function cmdIo(shape: string): void {
  const ioPath = join('shapes', shape, 'io.md')
  try {
    console.log(readLabFile(ioPath))
  } catch {
    if (shape === 'probe') {
      console.log('Probe (`describeCapabilities`) takes no input.\nSee lab/shapes/probe/about.md')
      return
    }
    if (shape === 'generate') {
      console.log(readLabFile('shapes/generate/README.md'))
      return
    }
    throw new EngineError(`Unknown shape "${shape}" or no io.md`, 'lab_unknown_shape')
  }
}

function cmdList(catalog: Catalog): void {
  console.log('Runnable examples:\n')
  for (const ex of catalog.examples) {
    console.log(`  ${ex.id.padEnd(28)} ${ex.title}`)
  }
  console.log('\nRun: npm run lab -- run <id>')
}

async function cmdRun(catalog: Catalog, exampleId: string): Promise<void> {
  const ex = catalog.examples.find((entry) => entry.id === exampleId)
  if (!ex) {
    throw new EngineError(
      `Unknown example "${exampleId}". Try: npm run lab -- list`,
      'lab_unknown_example',
    )
  }

  console.log(`# ${ex.title} (${ex.shape})`)
  console.log('')

  let result: unknown
  switch (ex.shape) {
    case 'simulate': {
      const input = JSON.parse(readLabFile(ex.input!)) as SimulateBytecodeInput
      result = await simulateBytecode(input)
      break
    }
    case 'transaction': {
      const input = JSON.parse(readLabFile(ex.input!)) as RunTransactionInput
      result = await runTransaction(input)
      break
    }
    case 'block': {
      const input = JSON.parse(readLabFile(ex.input!)) as RunBlockInput
      result = await runBlock(input)
      break
    }
    case 'probe':
      result = describeCapabilities()
      break
    default:
      throw new EngineError(`Shape "${ex.shape}" not runnable yet`, 'lab_shape_not_runnable')
  }

  printJson(result)

  console.log('')
  console.log('—'.repeat(72))
  console.log(readLabFile(ex.notes))
}

function parseArgs(argv: string[]): { command: string; rest: string[] } {
  const args = argv.filter((arg) => arg !== '--')
  const command = args[0] ?? 'overview'
  return { command, rest: args.slice(1) }
}

async function main(): Promise<void> {
  const catalog = loadCatalog()
  const { command, rest } = parseArgs(process.argv.slice(2))

  if (command === 'help' || command === '-h') {
    usage()
    return
  }

  switch (command) {
    case 'overview':
      cmdOverview(catalog)
      return
    case 'shapes':
      cmdShapes(catalog)
      return
    case 'endpoints':
      cmdEndpoints()
      return
    case 'io':
      if (!rest[0]) throw new EngineError('io requires a shape name', 'lab_missing_arg')
      cmdIo(rest[0])
      return
    case 'list':
      cmdList(catalog)
      return
    case 'run':
      if (!rest[0]) throw new EngineError('run requires an example id', 'lab_missing_arg')
      await cmdRun(catalog, rest[0])
      return
    default:
      usage()
      process.exitCode = 1
  }
}

main().catch((error: unknown) => {
  if (error instanceof EngineError) {
    console.error(`EngineError [${error.code}]: ${error.message}`)
  } else if (error instanceof Error) {
    console.error(error.message)
  } else {
    console.error(String(error))
  }
  process.exitCode = 1
})
