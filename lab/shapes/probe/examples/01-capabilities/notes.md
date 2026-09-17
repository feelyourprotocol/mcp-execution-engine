# What to notice — capability registry

After running `npm run lab -- run probe/01-capabilities`:

- **`engineVersion`** — semver of this engine build.
- **ceilings** — hard limits (max gas, bytecode size, trace steps, txs per lab block).
- **`namedForks`** — catalog capabilities (`fusaka` baseline, `glamsterdam` preview): `summary`, `keywords`, `shapes`, advertised `relatedEips`, optional `plannedEips`.
- **`baselineForkId`** — current mainnet EL (`fusaka`): first-class run target and optional before/after compare.
- **`eips`** — runnable EIP modules only (`runnable: true`), with `summary`, `opcodes` (encoding rules), and `keywords`.
- A generic Glamsterdam run does **not** need an EIP number — omit `eips[]` (the default). Provenance then lists advertised modules.
- **No demo programs** — callers supply bytecode to simulate. Lab examples below are test fixtures, not the catalog.

This is what the gateway's `describe_capabilities` MCP tool exposes to agents. Provenance fields on simulate results should stay consistent with this registry.
