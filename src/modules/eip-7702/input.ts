/**
 * EIP-7702 catalog facts — lab transaction layout, not demo programs.
 *
 * canonicalSource: website/src/explorations/eip-7702/canonical.ts
 */

export const DELEGATION_DESIGNATOR_PREFIX =
  '0xef01 — ephemeral EOA code prefix for set-code delegation'

export const TRANSACTION_LAYOUT =
  'run_transaction on prague+: sponsor from (impersonated), to = authority EOA, optional data; accounts[] prefunds delegate contract code at authorization address; authorizationList = signed JSON items (same shape as inspect authorization-list). Use inspect to validate signatures first.'

export const COMPARE_NOTE =
  'Same payload on cancun (baseline) vs prague (preview): type-4 set-code txs require EIP-7702 active. Delegation lasts for one transaction only.'
