# What to notice — two-bytecode compare

After running `npm run lab -- run compare/01-two-bytecodes`:

- **`variants`** — two full simulate results under the same fork but different bytecode.
- **`diffs`** — look for `gasUsed` and `success` dimensions; values differ because bytecode complexity differs.
- **`diffs` → `bytecodeLengthBytes`** — shows per-variant bytecode size (note on semantic compare).
- **`provenance.caveat`** — merged caveat for the compare operation.

This example is about the **diff machinery**, not claiming the two bytecodes are semantically equivalent. For repricing compares, use the same bytecode with different fork configs.

Seed presets in the engine (`eip7883-modexp-repricing`, `eip8024-opcode-equivalence`) describe future curated compare scenarios.
