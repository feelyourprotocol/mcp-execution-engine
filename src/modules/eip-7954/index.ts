/**
 * EIP-7954 module — larger contract runtime code and initcode limits.
 *
 * canonicalSource: website/src/explorations/eip-7954/canonical.ts
 *
 * Callers supply initcode through run_transaction with `to` omitted.
 * The catalog exposes boundary facts; it does not ship demo programs.
 */
import type { EipCapability } from '../../types/index.js'

export const EIP_7954_MODULE: EipCapability = {
  eip: 7954,
  name: 'Increase Maximum Contract Size',
  summary:
    'Deploy caller-supplied initcode with run_transaction and omit to. Compare Fusaka with Glamsterdam to see runtime code above 24 KiB and initcode above 48 KiB become valid, up to the new 64 KiB runtime and 128 KiB initcode limits.',
  changeNature: 'limit',
  runnable: true,
  shapes: ['transaction'],
  keywords: [
    'contract size',
    'runtime code',
    'initcode',
    'deployment limit',
    'EIP-170',
    'EIP-3860',
  ],
  relatedForks: ['glamsterdam'],
  status: 'Review',
  implMaturity: 'Implemented in EthereumJS (Glamsterdam, experimental)',
  testMaturity: 'execution-specs Glamsterdam development fixtures',
  specAnchor: 'EIP-7954',
  notes:
    'run_transaction treats omitted to as contract creation and returns createdAddress plus deployedCodeSize on success. Runtime code limits are 24,576 bytes on Fusaka and 65,536 on Glamsterdam; initcode limits are 49,152 and 131,072 bytes. Glamsterdam EIP-8037 state gas needs about 37.8M tx gas to deploy 24,577 runtime bytes and about 100.5M for 65,536 bytes; the lab transaction ceiling is 110M. Fusaka still applies the EIP-7825 16,777,216 tx gas cap.',
}
