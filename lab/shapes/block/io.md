# Block — inputs & outputs

## Input

| Field | Required | Description |
| --- | --- | --- |
| `transactions` | Yes | 1–8 impersonated txs (`from`, `to`, optional `value` / `data` / `code` / `gasLimit`) |
| `header.slotNumber` | No | Beacon slot (decimal). Amsterdam / EIP-7843 only |
| `header.number` | No | Block number (decimal). Default `1` |
| `header.timestamp` | No | Unix timestamp (decimal). Default `1` |
| `accounts` | No | Extra prefund accounts |
| `fork` | No | `{ baseHardfork, eips[] }` — default Amsterdam |

Example:

```json
{
  "transactions": [
    {
      "from": "0x00000000000000000000000000000000000000ee",
      "to": "0x00000000000000000000000000000000000000aa",
      "value": "1"
    }
  ],
  "fork": { "baseHardfork": "amsterdam" }
}
```

## Output

| Field | Description |
| --- | --- |
| `success` | Every tx completed without revert / intrinsic failure |
| `gasUsed` | Header `gasUsed` after lab `generate` (`gasUsedScope: block`) |
| `header` | `number`, `timestamp`, `gasUsed`, optional `slotNumber` |
| `transactions[]` | Per-tx paid gas, optional 8037 dimensions, logs |
| `error` | First tx failure, or a block-level catch, else `null` |
| `provenance` | Always present |

Not in v0: BAL JSON, builder requests, historical replay.

Machine-readable contracts: [schemas/block.input.json](../../schemas/block.input.json), [schemas/block.result.json](../../schemas/block.result.json).
