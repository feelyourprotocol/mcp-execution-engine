# Probe

> **Status:** Shipped (engine v0.1). MCP tool `describe_capabilities` — gateway Step 3.

## When to use

- Discover **what the engine supports** before calling simulate.
- Inspect registered **runnable** EIP modules, query shapes, opcodes, encoding, ceilings, and named forks.
- Agents use this to decide whether a fork/EIP is available and what limits apply.

## What you send

Nothing — `describeCapabilities()` takes no input.

## What you get back

A registry snapshot: engine version, ceilings, named forks, runnable EIP modules (opcodes + encoding), allowed base hardforks.

## Examples

| ID | What it demonstrates |
| --- | --- |
| `probe/01-capabilities` | Full registry snapshot |

```bash
npm run lab -- run probe/01-capabilities
```
