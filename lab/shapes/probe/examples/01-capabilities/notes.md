# What to notice — capability registry

After running `npm run lab -- run probe/01-capabilities`:

- **`engineVersion`** — semver of this engine build.
- **`ceilings`** — hard limits (max gas, bytecode size, trace steps).
- **`namedForks`** — curated shortcuts (e.g. `amsterdam`).
- **`eips`** — seed registry with `changeNature` and which **shapes** apply (`simulate`, `compare`, `generate`, …).
- **`presets`** — light seed curation for future compare scenarios.

This is what the gateway's `describe_capabilities` MCP tool will expose to agents. Provenance fields on simulate/compare results should stay consistent with this registry.
