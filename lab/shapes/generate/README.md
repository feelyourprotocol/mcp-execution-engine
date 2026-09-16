# Generate shape

> **Status:** Shipped — generic **`generate`** MCP tool (EIP-7928 block access list first).

Derive structured protocol artifacts from a lab block run — same transaction/header/account inputs as **`run_block`**, but returns the artifact (BAL JSON + hash) instead of only receipts and header gas.

## MCP

- Tool: **`generate`**
- Engine: **`generateArtifact()`**
- Default kind: **`block-access-list`** (Amsterdam / EIP-7928)

## Honesty

- BYOS lab only (1–8 impersonated txs, prefunded accounts).
- Does **not** verify the BAL of a mainnet block without archive parent state.
- Pair with **`inspect`** for caller-supplied BAL structure and hash checks.

## References

- Website [EIP-7928 exploration](https://feelyourprotocol.org/eip-7928-block-level-access-lists)
- MCP docs: [EIP-7928](/use/eips/eip-7928)
