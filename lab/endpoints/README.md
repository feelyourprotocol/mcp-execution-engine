# Endpoints — engine vs gateway vs URL

An **endpoint** is the **agent-facing surface**: an MCP tool reachable over a **transport**. This repo implements the **engine layer only** — no endpoint exists here yet.

## The ladder

| Query shape | Engine function | MCP tool | Transport |
| --- | --- | --- | --- |
| simulate | `simulateBytecode()` | `simulate_evm_bytecode` | stdio / HTTP |
| compare | `compareVariants()` | `compare_evm_variants` | stdio / HTTP |
| probe | `describeCapabilities()` | `describe_capabilities` | stdio / HTTP |
| generate | `generateBal()` | `generate_eip7928_bal` | (Step 6+) |

## Where each layer lives

| Layer | Repo / host | Status |
| --- | --- | --- |
| Engine | `feelyourprotocol/mcp-execution-engine` | **v0.1 shipped** |
| Gateway + MCP tools | `feelyourprotocol/mcp-gateway` | Step 3+ |
| Local transport | stdio (Cursor, Claude Desktop) | Step 3 |
| Remote transport | `https://mcp.feelyourprotocol.org/mcp` | Step 5 (AWS EC2) |
| Docs | `mcp-docs.feelyourprotocol.org` | **Live** |
| Ops / secrets | `server-config` (private) | Static sites done |

## What `npm run lab` runs today

Lab examples call **engine functions directly** with JSON payloads shaped like future MCP tool inputs. When the gateway ships, the same JSON should produce the same simulation results (plus transport/MCP wrapping).

## Rollout (from build plan)

1. ~~**Step 3**~~ — Gateway stdio — `describe_capabilities`, `simulate_evm_bytecode`, `compare_evm_variants`
2. **Step 4** — AWS EC2 bootstrap + health endpoint at `mcp.feelyourprotocol.org`
3. **Step 5** — HTTP MCP transport at `/mcp`
4. **Step 6+** — Generate shape, observability, x402, …

Connection docs (when live): [MCP docs — Connect](https://mcp-docs.feelyourprotocol.org/use/connect.html)

## Future additions to this folder

- `stdio.md` — local agent config (Step 3)
- `http.md` — remote MCP client (Step 5)
- `payments.md` — x402 flow (Step 8)
