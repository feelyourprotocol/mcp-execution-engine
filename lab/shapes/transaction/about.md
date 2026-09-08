# Transaction

> **Status:** Shipped. MCP tool `run_transaction`.

## When to use

- Wallet gasLimit questions (“is 21,000 enough?”)
- Paid transaction gas (intrinsic + execution)
- EIP-8037 two-dimensional gas (`txRegularGas` / `txStateGas` on Amsterdam)
- EIP-7708 Transfer logs on **tx value** (receipt logs)

Opcode / stack / precompile programs stay on [simulate](../simulate/about.md) (`run_bytecode`). Block access lists stay on planned **generate**.

## What you send

`from`, `to`, optional `value` / `data` / `code` / `accounts` / `gasLimit` / `fork`. Sender is impersonated (no private key). See [io.md](./io.md).

## What you get back

`gasUsed` is **paid transaction gas** (`gasUsedScope: transaction`). On Amsterdam, `txRegularGas` and `txStateGas` when the VM fills them. Receipt `logs` / `decodedLogs` when any are emitted.

## Examples

| ID | What it demonstrates |
| --- | --- |
| `transaction/01-first-touch` | 1 wei to an empty account on Amsterdam vs Osaka |

```bash
npm run lab -- run transaction/01-first-touch
```
