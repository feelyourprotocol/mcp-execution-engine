# Simulate

> **Status:** Shipped (engine v0.1). MCP tool `run_bytecode` — gateway.

## When to use

- Test how **raw EVM bytecode** behaves under an upcoming fork or à la carte EIP set.
- Inspect stack-level execution with an optional opcode trace.
- Opcode / precompile questions (EIP-8024, 7883, 7951).
- Program-gas SSTORE / SLOAD (EIP-8038). Constructed prestate in the same call (`accounts`).

Wallet gas limits, receipts, first-touch ETH transfers, and paid `txStateGas` belong on [transaction](../transaction/about.md).

## What you send

Bytecode + fork configuration (+ optional gas limit and trace flag). See [io.md](./io.md) and [schemas/simulate.input.json](../../schemas/simulate.input.json).

## What you get back

Success/failure, **call-frame** `gasUsed` (always tagged `gasUsedScope: call-frame`), return data, final stack, optional trace steps, and **provenance** on every result. See [schemas/simulate.result.json](../../schemas/simulate.result.json).

## Examples

| ID | What it demonstrates |
| --- | --- |
| `simulate/01-push1-stop` | Minimal bytecode, trace, provenance |
| `simulate/02-dupn-amsterdam` | EIP-8024 DUPN on Glamsterdam (8024 bundled in fork) |

```bash
npm run lab -- run simulate/01-push1-stop
npm run lab -- run simulate/02-dupn-amsterdam
```
