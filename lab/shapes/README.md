# Query shapes

Intent-driven verbs that frame how agents and integrators think about protocol work. The gateway maps MCP tools to these shapes; the engine implements them.

| Shape | What it answers | Engine entry (v0.1) | Notes |
| --- | --- | --- | --- |
| [simulate](./simulate/about.md) | "What happens if I run this bytecode under fork X?" | `simulateBytecode()` | Optional opcode trace; call twice to compare gas |
| [transaction](./transaction/about.md) | "What does this transaction cost or put in the receipt?" | `runTransaction()` | Paid gas, 8037 dimensions, 7708 tx-value logs |
| [probe](./probe/about.md) | "What can this server do?" | `describeCapabilities()` | Registry, ceilings, EIP modules |
| [generate](./generate/README.md) | "Produce structured protocol output (e.g. BAL)" | `generateBal()` — **planned** | Step 6 |

## Fork model (all shapes)

A fork is a **capability set**: `{ baseHardfork, eips[] }` à la carte. Named forks (e.g. `amsterdam`) are curated shortcuts.

Every simulate result includes **provenance** — engine version, resolved fork, stability caveat. Always cite it when reporting outcomes.

## Runnable examples

```bash
npm run lab -- list
npm run lab -- run simulate/01-push1-stop
npm run lab -- run transaction/01-first-touch
npm run lab -- run probe/01-capabilities
```

See [catalog.json](../catalog.json) for the full index.
