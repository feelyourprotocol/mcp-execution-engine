# Agent notes

Tool-agnostic entrypoint for coding agents working in **`mcp-execution-engine`**.

**Read this file first.** Then load [`.cursor/rules/`](.cursor/rules/) — `structure.mdc`, `website-relation.mdc`.

Human MCP user docs live in the website repo: [mcp-docs/use/](https://github.com/feelyourprotocol/website/tree/main/mcp-docs/use) → [mcp-docs.feelyourprotocol.org](https://mcp-docs.feelyourprotocol.org/use/introduction.html). Do not duplicate human inspiration pages here.

## What this repo is

Pure TypeScript simulation library — EthereumJS v10, stateless, no HTTP, no MCP transport. The [`mcp-gateway`](../mcp-gateway/) exposes engine calls as MCP tools.

```
Agent → mcp-gateway (tools) → mcp-execution-engine (this repo) → EthereumJS
```

## Repo layout

| Path | Role |
| --- | --- |
| `src/simulate/`, `src/transaction/`, `src/provenance/`, `src/forks/` | Generic library — query shapes |
| `src/modules/eip-NNNN/` | EIP capability descriptors (catalog only) |
| `src/modules/index.ts` | Live module list → `describeCapabilities()` |
| `src/__tests__/fixtures/` | Test-only bytecode; never the catalog |
| `lab/` | Local shape runner; not a substitute for MCP when connected |

## Query shapes (generic verbs)

| Shape | Export | MCP tool (gateway) |
| --- | --- | --- |
| probe | `describeCapabilities()` | `describe_capabilities` |
| simulate | `simulateBytecode()` | `run_bytecode` |
| transaction | `runTransaction()` | `run_transaction` |
| generate | (planned) | (planned) |

Do **not** add per-EIP engine exports that mirror MCP tools. EIP work belongs in `src/modules/`.

## Adding a runnable EIP module

Full EIP → exploration → MCP path is orchestrated from the website [round-trip skill](https://github.com/feelyourprotocol/website/blob/main/.cursor/skills/round-trip-protocol-change/SKILL.md) (this repo is phase 3).

**Read website `canonical.ts` first** — [add-mcp-module skill](.cursor/skills/add-mcp-module/SKILL.md).

1. Create `src/modules/eip-NNNN/` — `index.ts` (descriptor) + optional helpers for encoding facts
2. Register in `src/modules/index.ts`
3. Add tests in `src/__tests__/` (fixtures OK)
4. Human catalogue page: `website/mcp-docs/use/eips/eip-NNNN.md` — **required for every live exploration** (Runnable or Planned)
5. Run `npm run typecheck`, `npm run test:ci`, `npm run lf:ci`

Template: [`src/modules/eip-8024/`](src/modules/eip-8024/).

## Docs map

| Audience | Where |
| --- | --- |
| Human MCP users | [mcp-docs/use/](https://mcp-docs.feelyourprotocol.org/use/introduction.html) |
| Runtime agents (connected MCP) | Tool schemas + live `describe_capabilities` |
| Builders (this repo) | AGENTS.md + `.cursor/rules/` + [mcp-docs/internals/execution-engine](https://mcp-docs.feelyourprotocol.org/internals/execution-engine.html) |

## Habits

- Finish with `npm run typecheck`, `npm run test:ci`, `npm run lf:ci` in this package
- Do not commit unless asked
- Do not list unimplemented EIPs in the live catalog (`runnable: false` modules stay out of `EIP_MODULES`)
