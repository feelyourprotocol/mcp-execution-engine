import type { PresetDefinition } from '../types.js'

/** Light seed presets — curated parameterizations of generic query shapes. */
export const PRESETS: PresetDefinition[] = [
  {
    id: 'eip7883-modexp-repricing',
    name: 'EIP-7883 ModExp gas repricing',
    shape: 'compare',
    description:
      'Identical ModExp inputs under pre- and post-repricing fork configs to surface gas delta.',
    seed: true,
    relatedEips: [7883],
  },
  {
    id: 'eip8024-opcode-equivalence',
    name: 'EIP-8024 opcode equivalence',
    shape: 'compare',
    description:
      'Semantic compare: legacy stack-manipulation bytecode vs DUPN/SWAPN/EXCHANGE idioms on Amsterdam+EIP-8024.',
    seed: true,
    relatedEips: [8024],
  },
]

export function listPresets(): PresetDefinition[] {
  return [...PRESETS]
}

export function getPreset(id: string): PresetDefinition | undefined {
  return PRESETS.find((preset) => preset.id === id)
}
