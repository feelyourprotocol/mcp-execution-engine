# mcp-execution-engine

Pure TypeScript library — stateless, deterministic future-Ethereum-protocol simulations wrapping EthereumJS v10.

No HTTP, no MCP transport, no payments. Consumed by `mcp-gateway` (Step 3+).

## Status

**v0.1.0** — `simulateBytecode` + capability registry + provenance + variant-based diff composer.

## Development

```bash
npm install
npm run test
npm run typecheck
npm run lf
npm run build
```

## Boundaries

- Raw bytecode only (no Solidity compilation)
- No archive node / no mainnet sync
- No sequential multi-block historical backtesting
- Base protocol layer only

## License

MIT
