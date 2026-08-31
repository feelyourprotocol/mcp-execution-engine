---
name: add-mcp-module
description: >-
  Add a runnable EIP capability module to the MCP execution engine and its
  human MCP-docs catalogue page. Use after the website exploration canonical.ts
  exists.
---

# Add an MCP module

Executable playbook for **`mcp-execution-engine`** + human page in **`website/mcp-docs/use/eips/`**.

**Read first:** website `src/explorations/eip-NNNN/canonical.ts` — **source of truth**. On conflict, website `CANONICAL` wins; fix the engine replica.

Concepts: [website-relation.mdc](../rules/website-relation.mdc), [structure.mdc](../rules/structure.mdc).

## Before coding

1. Read `website/src/explorations/eip-NNNN/canonical.ts` (`CANONICAL`).
2. Confirm query shape from `canonical.mcp.shapes` — only add a module when `simulate` or `generate` is shipped.
3. Human MCP page must exist or ship in the same PR (`use/eips/eip-NNNN.md`).

## Module steps

1. Create `src/modules/eip-NNNN/index.ts` — descriptor only; no demo programs in catalog.
2. Optional helpers (`opcodes.ts`, encoding facts) for agent-constructible bytecode.
3. Set `canonicalSource: 'website/src/explorations/eip-NNNN/canonical.ts'` in a file comment.
4. Copy shared fields from `CANONICAL`: `coreQuestion` → `summary` (capability voice), `changeNature`, maturity, keywords, comparison.
5. Add **runtime-only** fields: `runnable: true`, `shapes`, `opcodes` / precompile input encoding as needed.
6. Register in `src/modules/index.ts`.
7. Tests in `src/__tests__/` — CALL bytecode fixtures, not website widget examples.
8. Update `website/mcp-docs/use/eips/eip-NNNN.md`, `use/coverage.md`, sidebar, tool descriptions if coverage changed.

Template: [`src/modules/eip-8024/`](../src/modules/eip-8024/).

## Invariants

- Do **not** add per-EIP MCP tools — generic verbs only.
- Do **not** import from `website/src/explorations/`.
- Do **not** list `runnable: false` modules in `EIP_MODULES`.
- Demo bytecode belongs in `src/__tests__/fixtures/`, not module descriptors.

## Finish gates

```bash
cd mcp-execution-engine && npm run typecheck && npm run test:ci && npm run lf:ci
```

Rebuild gateway if tool descriptions changed; restart MCP in Cursor.
