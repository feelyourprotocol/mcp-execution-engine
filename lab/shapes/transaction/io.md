# Transaction — inputs & outputs

## Input

| Field | Required | Description |
| --- | --- | --- |
| `from` | Yes | Hex sender (impersonated) |
| `to` | Yes | Hex recipient |
| `value` | No | Wei as decimal string (default `0`) |
| `data` | No | Calldata hex |
| `code` | No | Runtime bytecode installed at `to` before the tx |
| `accounts` | No | Extra prefund accounts |
| `fork` | No | `{ baseHardfork, eips[] }` — default Amsterdam |
| `gasLimit` | No | Tx gas limit (default `1000000`). Pass `21000` for the wallet-era limit. |

Example:

```json
{
  "from": "0x00000000000000000000000000000000000000ee",
  "to": "0x00000000000000000000000000000000000000aa",
  "value": "1",
  "fork": { "baseHardfork": "amsterdam" }
}
```

## Output

| Field | Description |
| --- | --- |
| `success` | Tx completed without revert / intrinsic failure |
| `gasUsed` | Paid tx gas (intrinsic + execution − refund) |
| `gasUsedScope` | Always `transaction` |
| `txRegularGas` | Amsterdam only — regular-gas total |
| `txStateGas` | Amsterdam only — state-gas total |
| `returnValue` | Hex return data |
| `error` | Failure message, else `null` |
| `logs` / `decodedLogs` | Receipt logs (EIP-7708 decorations when present) |
| `provenance` | Always present |

Machine-readable contracts: [schemas/transaction.input.json](../../schemas/transaction.input.json), [schemas/transaction.result.json](../../schemas/transaction.result.json).
