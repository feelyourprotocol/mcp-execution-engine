import { ENGINE_VERSION } from '../forks/registry.js'
import { normalizeForkConfig } from '../forks/registry.js'
import { mergeProvenanceForCompare } from '../provenance/build.js'
import { simulateBytecode } from '../simulate/simulateBytecode.js'
import type {
  CompareDiffEntry,
  CompareVariantResult,
  CompareVariantsInput,
  CompareVariantsResult,
  SimulateBytecodeResult,
} from '../types.js'
import { EngineError } from '../types.js'

function diffDimension(
  dimension: string,
  variants: CompareVariantResult[],
  pick: (result: SimulateBytecodeResult) => string | boolean | null,
  note?: string,
): CompareDiffEntry {
  const byLabel: Record<string, string | boolean | null> = {}
  for (const variant of variants) {
    byLabel[variant.label] = pick(variant.result)
  }
  return { dimension, byLabel, note }
}

export async function compareVariants(input: CompareVariantsInput): Promise<CompareVariantsResult> {
  if (!input.variants.length) {
    throw new EngineError('compareVariants requires at least one variant', 'empty_variants')
  }

  if (input.variants.length < 2) {
    throw new EngineError('compareVariants requires at least two variants', 'insufficient_variants')
  }

  const labels = input.variants.map((variant) => variant.label)
  if (new Set(labels).size !== labels.length) {
    throw new EngineError('compare variant labels must be unique', 'duplicate_variant_label')
  }

  const variants: CompareVariantResult[] = []

  for (const variant of input.variants) {
    const result = await simulateBytecode({
      bytecode: variant.bytecode,
      fork: variant.fork,
      gasLimit: variant.gasLimit,
      trace: variant.trace,
    })
    variants.push({ label: variant.label, result })
  }

  const forkConfigs = input.variants.map((variant) => normalizeForkConfig(variant.fork))

  const diffs: CompareDiffEntry[] = [
    diffDimension('success', variants, (result) => result.success),
    diffDimension('gasUsed', variants, (result) => result.gasUsed),
    diffDimension('error', variants, (result) => result.error),
    diffDimension(
      'bytecodeLengthBytes',
      variants,
      () => null,
      'Compare uses per-variant bytecode; lengths may differ for semantic equivalence checks.',
    ),
  ]

  for (const variant of input.variants) {
    diffs[3].byLabel[variant.label] = String(
      (variant.bytecode.startsWith('0x') ? variant.bytecode.slice(2) : variant.bytecode).length / 2,
    )
  }

  return {
    variants,
    diffs,
    provenance: mergeProvenanceForCompare(ENGINE_VERSION, forkConfigs),
  }
}
