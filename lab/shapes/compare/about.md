# Compare

> **Status:** Shipped (engine v0.1). Dedicated MCP tool — TBD with gateway.

## When to use

- Run **multiple labelled variants** — each with its **own fork + bytecode** — and diff key dimensions (success, gas, error).
- Repricing EIPs: same bytecode, different fork configs.
- Semantic equivalence: **different bytecode per side** (e.g. legacy stack idiom vs DUPN idiom).

Comparison is **not** one-size-fits-all — it fits repricing and semantic/variant checks, not every EIP nature.

## What you send

An array of variants with unique `label` fields. See [io.md](./io.md) and [schemas/compare.input.json](../../schemas/compare.input.json).

## What you get back

Per-variant full simulate results, a `diffs` array (gas, success, …), and merged **provenance**. See [schemas/compare.result.json](../../schemas/compare.result.json).

## Examples

| ID | What it demonstrates |
| --- | --- |
| `compare/01-two-bytecodes` | Two different bytecodes on the same fork — diff machinery |

```bash
npm run lab -- run compare/01-two-bytecodes
```
