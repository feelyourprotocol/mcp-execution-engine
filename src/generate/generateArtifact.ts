import {
  type BALJSONBlockAccessList,
  BLOCK_ACCESS_LIST_ITEM_COST,
  bytesToHex,
  countBlockAccessListItems,
} from '@ethereumjs/util'

import { executeLabBlock } from '../block/executeLabBlock.js'
import { LAB_BLOCK_GAS_LIMIT } from '../transaction/lab.js'
import type { GenerateInput, GenerateResult } from '../types.js'
import { EngineError } from '../types.js'

const DEFAULT_ARTIFACT_KIND = 'block-access-list' as const

export async function generateArtifact(input: GenerateInput): Promise<GenerateResult> {
  const kind = input.kind ?? DEFAULT_ARTIFACT_KIND
  if (kind !== 'block-access-list') {
    throw new EngineError(`Unsupported generate kind: ${kind}`, 'invalid_input')
  }

  let execution
  try {
    execution = await executeLabBlock(input)
  } catch (error) {
    if (error instanceof EngineError) {
      throw error
    }
    const message = error instanceof Error ? error.message : String(error)
    throw new EngineError(message, 'execution_failed')
  }

  const { provenance, common, headerSnapshotBase, vmResult } = execution

  if (!common.isActivatedEIP(7928)) {
    throw new EngineError(
      'Block access lists require a fork that activates EIP-7928 (Amsterdam)',
      'bal_not_available',
    )
  }

  const bal = vmResult.blockLevelAccessList
  const maxItems = LAB_BLOCK_GAS_LIMIT / BigInt(BLOCK_ACCESS_LIST_ITEM_COST)

  if (bal === undefined) {
    return {
      success: false,
      artifactKind: 'block-access-list',
      bal: [],
      hash: '0x',
      itemCount: 0,
      maxItems: maxItems.toString(),
      gasUsed: vmResult.gasUsed.toString(),
      header: { ...headerSnapshotBase, gasUsed: vmResult.gasUsed.toString() },
      error: 'VM did not return a block access list',
      provenance,
    }
  }

  const balJson = bal.toJSON() as BALJSONBlockAccessList
  const itemCount = countBlockAccessListItems(bal)

  return {
    success: true,
    artifactKind: 'block-access-list',
    bal: balJson,
    hash: bytesToHex(bal.hash()),
    itemCount,
    maxItems: maxItems.toString(),
    gasUsed: vmResult.gasUsed.toString(),
    header: { ...headerSnapshotBase, gasUsed: vmResult.gasUsed.toString() },
    error: null,
    provenance,
  }
}
