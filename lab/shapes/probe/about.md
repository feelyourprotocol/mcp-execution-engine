# Probe

> **Status:** Shipped (engine v0.1). MCP tool `describe_capabilities` — gateway Step 3.

## When to use

- Discover **what the engine supports** before calling simulate.
- Inspect named **fork capabilities**, registered **runnable** EIP modules, query shapes, opcodes, encoding, ceilings.
- Agents use this to decide whether a **hardfork** (Glamsterdam, Fusaka, Pectra) or an EIP is available and what limits apply. A fork run does not require naming an EIP.

## What you send

Nothing — `describeCapabilities()` takes no input.

## What you get back

A registry snapshot: engine version, ceilings, named fork capabilities (summary, related EIPs, shapes), runnable EIP modules (opcodes + encoding), allowed base hardforks.

## Examples

| ID | What it demonstrates |
| --- | --- |
| `probe/01-capabilities` | Full registry snapshot |

```bash
npm run lab -- run probe/01-capabilities
```
