# What to notice — DUPN on Glamsterdam

After running `npm run lab -- run simulate/02-dupn-amsterdam`:

- **`success: true`** — EIP-8024 DUPN opcode accepted on Glamsterdam.
- **`finalStack`** — last three items should be `0x10`, `0x11`, `0x1` (DUPN copied depth 17 onto the top).
- **`steps`** — look for opcode `DUPN` in the trace.
- **Fork note:** In `@ethereumjs/common` v10.1.2, **Glamsterdam already bundles EIP-8024**. You do not need `eips: [8024]` for DUPN to work. For a before/after 8024 differential, re-run the same bytecode on **`fusaka`** baseline (invalid opcode) vs **`glamsterdam`** preview (this example).

Compare with the website [EIP-8024 exploration](https://feelyourprotocol.org) for the interactive browser twin.
