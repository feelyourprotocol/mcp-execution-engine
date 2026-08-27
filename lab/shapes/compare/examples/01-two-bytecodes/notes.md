# What to notice — two-bytecode compare

After running `npm run lab -- run compare/01-two-bytecodes`:

- **`variants`** — two full simulate results under the same fork but different bytecode.
- **`diffs`** — look for `gasUsed` and `success` dimensions; values differ because bytecode complexity differs.
- **`diffs` → `bytecodeLengthBytes`** — shows per-variant bytecode size (note on semantic compare).
- **`provenance.caveat`** — merged caveat for the compare operation.

This example is about the **diff machinery**, not claiming the two bytecodes are semantically equivalent. For repricing compares, use the same bytecode with different fork configs.

This example is a lab fixture for the compare engine (two caller-supplied programs on Amsterdam). The EIP-8024 **module** does not ship demo programs — Amsterdam already bundles the opcodes.
