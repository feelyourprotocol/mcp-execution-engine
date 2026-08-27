# mcp-execution-engine

Deterministic future-Ethereum-protocol simulation core for the [Feel Your Protocol MCP server](https://mcp-docs.feelyourprotocol.org).

Pure TypeScript library wrapping EthereumJS v10 — **no HTTP, no MCP transport, no payments**. The [`mcp-gateway`](https://mcp-docs.feelyourprotocol.org/internals/gateway.html) (Step 3+) exposes engine calls as MCP tools for agents.

## Where this sits

```
Agent  →  MCP gateway (tools + transport)  →  execution engine (this repo)  →  EthereumJS
```

| Piece | Role |
| --- | --- |
| **This repo** | Stateless simulation core — bytecode, traces, registry, provenance |
| **`mcp-gateway`** | MCP tools + stdio/HTTP transport (planned) |
| **`mcp-docs`** | Public docs — [use](https://mcp-docs.feelyourprotocol.org/use/introduction.html) + [internals](https://mcp-docs.feelyourprotocol.org/internals/architecture.html) |

Website explorations are the **browser twin**; this engine is the **headless lab equipment**.

## Query shapes (v0.1)

| Shape | Engine | Future MCP tool | Status |
| --- | --- | --- | --- |
| **simulate** | `simulateBytecode()` | `run_evm_bytecode` | Shipped |
| **probe** | `describeCapabilities()` | `describe_capabilities` | Shipped |
| **generate** | `generateBal()` | `generate_eip7928_bal` | Planned (Step 6) |

An **endpoint** is the agent-facing MCP tool on a transport (stdio / `https://mcp.feelyourprotocol.org/mcp`) — not a function in this repo. See [`lab/endpoints/README.md`](./lab/endpoints/README.md).

## Try it — the lab

Hands-on exploration lives in **`lab/`** — shapes, I/O contracts, runnable examples, and notes on what to notice.

```bash
npm install
npm run lab                              # overview
npm run lab -- run simulate/01-push1-stop
npm run lab -- run probe/01-capabilities
npm run lab -- io simulate               # input/output fields
npm run lab -- endpoints                 # engine → tool → URL ladder
```

Start here: [`lab/START.md`](./lab/START.md)

## Development

```bash
npm run test:ci      # vitest regression suite
npm run typecheck
npm run lf:ci        # eslint + prettier
npm run build        # emit dist/
```

CI: `.github/workflows/ci.yml`

## Boundaries

- Raw bytecode only (no Solidity compilation)
- No archive node / no mainnet sync
- No sequential multi-block historical backtesting
- Base protocol layer only

## License

MIT
