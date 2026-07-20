# Query shapes

Intent-driven verbs that frame how agents and integrators think about protocol work. The gateway maps MCP tools to these shapes; the engine implements them.

| Shape | What it answers | Engine entry (v0.1) | Notes |
| --- | --- | --- | --- |
| [simulate](./simulate/about.md) | "What happens if I run this bytecode under fork X?" | `simulateBytecode()` | Optional opcode trace |
| [compare](./compare/about.md) | "How do these variants differ?" | `compareVariants()` | Each variant has own fork + bytecode |
| [probe](./probe/about.md) | "What can this server do?" | `describeCapabilities()` | Registry, ceilings, presets |
| [generate](./generate/README.md) | "Produce structured protocol output (e.g. BAL)" | `generateBal()` — **planned** | Step 6 |

## Fork model (all shapes)

A fork is a **capability set**: `{ baseHardfork, eips[] }` à la carte. Named forks (e.g. `amsterdam`) are curated shortcuts.

Every simulate/compare result includes **provenance** — engine version, resolved fork, stability caveat. Always cite it when reporting outcomes.

## Runnable examples

```bash
npm run lab -- list
npm run lab -- run simulate/01-push1-stop
npm run lab -- run compare/01-two-bytecodes
npm run lab -- run probe/01-capabilities
```

See [catalog.json](../catalog.json) for the full index.
