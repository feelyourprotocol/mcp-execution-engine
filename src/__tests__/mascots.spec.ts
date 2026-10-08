import { describe, expect, it } from 'vitest'

import { FORK_MASCOT_EMOJI } from '../forks/mascots.js'
import { describeCapabilities } from '../forks/registry.js'

describe('fork mascots', () => {
  it('matches engine lineage and probe namedForks', () => {
    const probe = describeCapabilities()
    for (const [id, emoji] of Object.entries(FORK_MASCOT_EMOJI)) {
      const row = probe.namedForks.find((fork) => fork.id === id)
      expect(row?.mascotEmoji).toBe(emoji)
    }
  })

  it('adds introducedAtMascotEmoji on eipIntroductions when known', () => {
    const push0 = describeCapabilities().eipIntroductions.find((row) => row.eip === 3855)
    expect(push0?.introducedAt).toBe('shapella')
    expect(push0?.introducedAtMascotEmoji).toBe('🦉')
  })
})
