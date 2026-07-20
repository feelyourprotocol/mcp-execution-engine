# What to notice — DUPN on Amsterdam

After running `npm run lab -- run simulate/02-dupn-amsterdam`:

- **`success: true`** — EIP-8024 DUPN opcode accepted on Amsterdam.
- **`finalStack`** — last three items should be `0x10`, `0x11`, `0x1` (DUPN copied depth 17 onto the top).
- **`steps`** — look for opcode `DUPN` in the trace.
- **Fork note:** In `@ethereumjs/common` v10.1.2, **Amsterdam already bundles EIP-8024**. You do not need `eips: [8024]` for DUPN to work. For a true before/after 8024 differential, you need a pre-8024 base hardfork (future engine work).

Compare with the website [EIP-8024 exploration](https://feelyourprotocol.org) for the interactive browser twin.
