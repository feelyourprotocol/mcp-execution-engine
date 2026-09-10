# Generate (planned)

> **Status:** Not implemented in the engine yet. **Step 6** — EIP-7928 block-level access lists.

## What it will do

Produce structured protocol outputs such as **block-level access lists (BAL)** from a lab `runBlock` result — same patterns as the website [EIP-7928 exploration](https://feelyourprotocol.org).

`run_block` (v0) already executes 1–8 txs and returns receipts + a header snapshot. It does **not** return BAL JSON. That stays here until generate ships.

## Future MCP tool

A generic generate verb on the gateway (not a per-EIP tool).

## Until then

- Interactive reference: website EIP-7928 exploration
- MCP docs: [Coverage](https://mcp-docs.feelyourprotocol.org/use/coverage.html) (7928 listed as Planned)

Examples and schemas will be added here when Step 6 lands.
