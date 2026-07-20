# What to notice — PUSH1 STOP

After running `npm run lab -- run simulate/01-push1-stop`:

- **`success: true`** — minimal valid bytecode executed cleanly.
- **`gasUsed`** — small number (3) for PUSH1 + STOP.
- **`finalStack: ["0x1"]`** — PUSH1 pushed `0x01` before STOP.
- **`steps`** — two entries: `PUSH1` then `STOP` when `trace: true`.
- **`provenance`** — always present. Note `engineVersion`, `forkConfig.baseHardfork`, and the human **`caveat`** about fork stability.

This is the smallest useful simulate example — good sanity check after clone or CI.
