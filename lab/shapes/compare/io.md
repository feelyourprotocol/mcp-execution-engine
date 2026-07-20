# Compare — inputs & outputs

## Input

| Field | Required | Description |
| --- | --- | --- |
| `variants` | Yes | Array of at least two variant objects |
| `variants[].label` | Yes | Unique label for diff columns |
| `variants[].bytecode` | Yes | Hex bytecode for this variant |
| `variants[].fork` | Yes | Fork config for this variant |
| `variants[].gasLimit` | No | Per-variant gas limit |
| `variants[].trace` | No | Per-variant trace flag |

Example:

```json
{
  "variants": [
    {
      "label": "push1-stop",
      "bytecode": "0x600100",
      "fork": { "baseHardfork": "amsterdam", "eips": [] }
    },
    {
      "label": "dupn-demo",
      "bytecode": "0x600160026003600460056006600760086009600a600b600c600d600e600f60106011e68000",
      "fork": { "baseHardfork": "amsterdam", "eips": [] }
    }
  ]
}
```

## Output

| Field | Description |
| --- | --- |
| `variants` | Full simulate result per label |
| `diffs` | Dimensions compared across labels (`success`, `gasUsed`, `error`, `bytecodeLengthBytes`, …) |
| `provenance` | Merged provenance for the compare operation |

Machine-readable contracts: [schemas/compare.input.json](../../schemas/compare.input.json), [schemas/compare.result.json](../../schemas/compare.result.json).
