/**
 * EIP-7951 module — secp256r1 precompile on Fusaka.
 *
 * canonicalSource: website/src/explorations/eip-7951/canonical.ts
 *
 * Callers supply bytecode (typically CALL to 0x100). Catalog describes input layout;
 * it does not ship demo programs.
 */
import type { EipCapability } from '../../types.js'
import { P256_INPUT_LAYOUT, P256_VERIFY_ADDRESS } from './input.js'

export const EIP_7951_MODULE: EipCapability = {
  eip: 7951,
  name: 'secp256r1 precompile support',
  summary:
    'Fusaka EVM verifies P-256 signatures at precompile 0x100. Supply CALL bytecode with hash, r, s, pubX, pubY — valid returns 0x01.',
  changeNature: 'new-capability',
  runnable: true,
  shapes: ['simulate'],
  keywords: ['secp256r1', 'P-256', 'passkey', 'precompile 0x100', 'WebAuthn'],
  relatedForks: ['fusaka'],
  opcodes: [
    {
      name: 'P256VERIFY',
      opcode: P256_VERIFY_ADDRESS,
      opcodeHex: '0x100',
      effect: 'Verify secp256r1 ECDSA signature; returns 32-byte 0x01 when valid.',
      immediate: {
        encoding: P256_INPUT_LAYOUT,
        notes: 'Invoke via CALL to address 0x100 with 160-byte input.',
      },
    },
  ],
  status: 'Final',
  implMaturity: 'Implemented in EthereumJS (engine module)',
  testMaturity: 'Precompile verification vectors',
  specAnchor: 'EIP-7951',
  notes: 'Focus on valid vs invalid return data — not a fork before/after compare.',
}
