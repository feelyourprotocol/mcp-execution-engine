# Simulate — inputs & outputs

## Input

| Field | Required | Description |
| --- | --- | --- |
| `bytecode` | Yes | Hex-encoded EVM bytecode (`0x` prefix optional) |
| `fork` | No | `{ baseHardfork, eips[] }` — defaults to Amsterdam if omitted |
| `gasLimit` | No | Execution gas limit as decimal string (default `1000000`) |
| `trace` | No | When `true`, include stack-only execution steps |
| `accounts` | No | Extra accounts to prefund (code/balance) before `runCode` |

Example:

```json
{
  "bytecode": "0x600100",
  "fork": { "baseHardfork": "amsterdam", "eips": [] },
  "trace": true
}
```

## Output

| Field | Description |
| --- | --- |
| `success` | Execution completed without revert |
| `gasUsed` | Call-frame gas consumed (decimal string). Does **not** include the 21,000 tx intrinsic. |
| `gasUsedScope` | Always `call-frame` (`runCode`). |
| `returnValue` | Hex return data |
| `finalStack` | Stack items after execution (hex strings, bottom → top) |
| `error` | Error message if execution failed, else `null` |
| `steps` | Optional trace when `trace: true` — `pc`, `op`, `gasCost`, `gasLeft`, `stack` |
| `provenance` | **Always present** — `engineVersion`, `forkConfig`, `stabilityRollup`, `caveat`, `asOf` |

Wallet gasLimit and receipt questions belong on the **transaction** shape (`run_transaction`), not here.

Example (abbreviated):

```json
{
  "success": true,
  "gasUsed": "3",
  "gasUsedScope": "call-frame",
  "returnValue": "0x",
  "finalStack": ["0x1"],
  "error": null,
  "provenance": {
    "engineVersion": "0.1.0",
    "forkConfig": { "baseHardfork": "amsterdam", "eips": [] }
  }
}
```

Machine-readable contracts: [schemas/simulate.input.json](../../schemas/simulate.input.json), [schemas/simulate.result.json](../../schemas/simulate.result.json).
