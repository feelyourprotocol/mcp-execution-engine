import { ENGINE_VERSION } from '../forks/registry.js'
import { resolveFork } from '../forks/resolve.js'
import { buildProvenance } from '../provenance/build.js'
import { txFieldsFromRunTx } from '../transaction/lab.js'
import type { RunBlockInput, RunBlockResult, RunBlockTxResult } from '../types/index.js'
import { EngineError } from '../types/index.js'
import { executeLabBlock } from './executeLabBlock.js'

function emptyBlockResult(
  error: string,
  provenance: RunBlockResult['provenance'],
  header: RunBlockResult['header'],
): RunBlockResult {
  return {
    success: false,
    gasUsed: '0',
    gasUsedScope: 'block',
    header: { ...header, gasUsed: '0' },
    transactions: [],
    error,
    provenance,
  }
}

export async function runBlock(input: RunBlockInput): Promise<RunBlockResult> {
  const { config } = resolveFork(input.fork)
  const provenance = buildProvenance(ENGINE_VERSION, config)

  try {
    const { provenance: runProvenance, headerSnapshotBase, vmResult } = await executeLabBlock(input)

    const txResults: RunBlockTxResult[] = vmResult.results.map((txResult) =>
      txFieldsFromRunTx(txResult),
    )
    const allOk = txResults.every((tx) => tx.success)
    const firstError = txResults.find((tx) => tx.error !== null)?.error ?? null

    return {
      success: allOk,
      gasUsed: vmResult.gasUsed.toString(),
      gasUsedScope: 'block',
      header: {
        ...headerSnapshotBase,
        gasUsed: vmResult.gasUsed.toString(),
      },
      transactions: txResults,
      error: firstError,
      provenance: runProvenance,
    }
  } catch (error) {
    if (error instanceof EngineError) {
      throw error
    }
    const message = error instanceof Error ? error.message : String(error)
    return emptyBlockResult(message, provenance, {
      number: '1',
      timestamp: '1',
      gasUsed: '0',
    })
  }
}
