# Block

> **Status:** Shipped (v0). MCP tool `run_block`. Lab mode: `generate: true`, skip header checks.

## When to use

- Several impersonated transactions in **one** lab block
- Header fields the EVM can read (`slotNumber`, `number`, `timestamp`)
- Per-tx receipts plus a header snapshot

A **single** paid transfer still belongs on [transaction](../transaction/about.md) (`run_transaction`). Opcode / stack programs stay on [simulate](../simulate/about.md). Block-level access lists stay on planned **generate**.

## What you send

`transactions[]` (1–8), optional `header` (`slotNumber` / `number` / `timestamp`), optional `accounts` / `fork`. Senders are impersonated (no private key). See [io.md](./io.md).

## What you get back

`gasUsed` is the **header** field after execution (`gasUsedScope: block`). Paid tx gas, 8037 dimensions, and 7708 logs live on `transactions[]`. `header.slotNumber` is present when you set a slot on Amsterdam.

## Examples

| ID | What it demonstrates |
| --- | --- |
| `block/01-first-touch` | One 1 wei transfer on Amsterdam (same as the transaction example, as a block) |
| `block/02-slot-header` | Amsterdam header slot `42`; a contract returns `SLOTNUM` |

```bash
npm run lab -- run block/01-first-touch
npm run lab -- run block/02-slot-header
```
