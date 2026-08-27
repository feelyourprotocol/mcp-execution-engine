# Lab — start here

Self-contained guide to **what this repo does today**, how it fits the broader MCP server, and how to run examples to build intuition.

## The full picture (30 seconds)

Feel Your Protocol is building an **MCP server** so AI agents can run **deterministic simulations of the future Ethereum protocol** — upcoming forks, EIPs, rich traces — and get JSON they can reason over.

This repo is **`mcp-execution-engine`**: the **pure simulation core**. It wraps EthereumJS v10. It has **no HTTP, no MCP transport, no payments**. The **`mcp-gateway`** repo (Step 3+) will expose engine calls as MCP tools; agents will reach those via stdio or `https://mcp.feelyourprotocol.org/mcp` (Step 5).

```
Agent  →  MCP gateway (tools + transport)  →  execution engine (this repo)  →  EthereumJS
```

Public docs: [mcp-docs.feelyourprotocol.org](https://mcp-docs.feelyourprotocol.org) — `use/` for end users, `internals/` for ops.

## Query shapes (how work is framed)

The MCP surface is organized as **intent-driven shapes**, not raw library exports:

| Shape | Engine (v0.1) | Future MCP tool | Status |
| --- | --- | --- | --- |
| **simulate** | `simulateBytecode()` | `simulate_evm_bytecode` | Shipped |
| **compare** | `compareVariants()` | `compare_evm_variants` | Shipped |
| **probe** | `describeCapabilities()` | `describe_capabilities` | Shipped |
| **generate** | `generateBal()` | `generate_eip7928_bal` | Planned (Step 6) |

See [shapes/README.md](./shapes/README.md) for when to use each shape.

## What an "endpoint" is

An **endpoint** is **not** a function in this repo. It is the **agent-facing MCP tool** exposed by the gateway over a **transport** (stdio locally, HTTP remotely).

| Layer | Example | Where |
| --- | --- | --- |
| Query shape | simulate | Concept |
| Engine function | `simulateBytecode()` | This repo |
| MCP tool | `simulate_evm_bytecode` | `mcp-gateway` (Step 3+) |
| Transport endpoint | stdio / `https://mcp.feelyourprotocol.org/mcp` | Gateway host |

Running examples here executes the **engine layer** with the same JSON payloads the gateway will eventually accept.

Details: [endpoints/README.md](./endpoints/README.md)

## Try it (from repo root)

```bash
npm install
npm run lab                  # overview + next steps
npm run lab -- list          # all runnable examples
npm run lab -- run simulate/01-push1-stop
npm run lab -- io simulate   # input/output fields for a shape
npm run lab -- endpoints     # the endpoint ladder
```

Regression tests (CI): `npm run test:ci`

## Go further

- Edit example `input.json` files under `lab/shapes/*/examples/` and re-run.
- Read `lab/schemas/` for JSON field contracts.
- Deep API reference: [MCP docs — Execution Engine](https://mcp-docs.feelyourprotocol.org/internals/execution-engine.html)
- Vision & roadmap: [roadmap.feelyourprotocol.org](https://roadmap.feelyourprotocol.org)

## Repo layout

```
lab/
  START.md           ← you are here
  catalog.json       machine-readable index (shapes + examples)
  shapes/            one folder per query shape + examples
  endpoints/         engine vs gateway vs URL
  schemas/           JSON field contracts
scripts/
  lab.mts            npm run lab runner
src/                 library source
```
