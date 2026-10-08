import type { LineageForkId } from './lineage.js'

/**
 * Community upgrade mascots (EIP-8066 tradition). Berlin and London predate the
 * formal process — no assigned mascot. Keep in sync with website `FORK_MASCOT_EMOJI`.
 */
export const FORK_MASCOT_EMOJI: Partial<Record<LineageForkId, string>> = {
  paris: '🐼',
  shapella: '🦉',
  dencun: '🐡',
  pectra: '🦒',
  fusaka: '🦓',
  glamsterdam: '🐻‍❄️',
}

export function forkMascotEmoji(id: string): string | undefined {
  const normalized = id.trim().toLowerCase() as LineageForkId
  return FORK_MASCOT_EMOJI[normalized]
}

/** Display label with leading mascot when known (e.g. "🦓 Fusaka"). */
export function forkLabelWithMascot(label: string, id: string): string {
  const emoji = forkMascotEmoji(id)
  return emoji ? `${emoji} ${label}` : label
}
