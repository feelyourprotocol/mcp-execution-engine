# What to notice — capability registry

After running `npm run lab -- run probe/01-capabilities`:

- **`engineVersion`** — semver of this engine build.
- **ceilings** — hard limits (max gas, bytecode size, trace steps, txs per lab block).
- **`namedForks`** — curated shortcuts (`osaka` baseline, `amsterdam` preview).
- **`baselineForkId`** — optional mainnet EL baseline (`osaka`) when you want before/after comparisons.
- **`eips`** — runnable EIP modules only (`runnable: true`), with `summary`, `opcodes` (encoding rules), and `keywords`.
- **No demo programs** — callers supply bytecode to simulate. Lab examples below are test fixtures, not the catalog.

This is what the gateway's `describe_capabilities` MCP tool exposes to agents. Provenance fields on simulate results should stay consistent with this registry.
