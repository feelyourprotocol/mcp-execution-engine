/**
 * EIP-2780 module — resource-based intrinsic transaction gas on Glamsterdam.
 *
 * canonicalSource: website/src/explorations/eip-2780/canonical.ts
 *
 * Callers supply a transaction. Catalog describes the split; it does not ship demo programs.
 */
import type { EipCapability } from '../../types/index.js'
import {
  GLAMSTERDAM_DEVNET_TEST_RELEASE_NAME,
  GLAMSTERDAM_DEVNET_TEST_RELEASE_URL,
} from '../../types/index.js'

export const EIP_2780_MODULE: EipCapability = {
  eip: 2780,
  name: 'Resource-based intrinsic transaction gas',
  summary:
    'Glamsterdam splits the flat 21,000 intrinsic charge. A value transfer to an existing account stays 21,000. A self-transfer is 12,000. A zero-value call is 15,000. Compare fusaka vs glamsterdam with run_transaction and read gasUsed. txStateGas stays 0 on these shapes.',
  changeNature: 'repricing',
  runnable: true,
  shapes: ['transaction'],
  keywords: ['intrinsic gas', '2780', 'tx base cost', 'self-transfer', '21000'],
  relatedForks: ['glamsterdam'],
  status: 'Review',
  specUrl:
    'https://github.com/ethereum/EIPs/blob/8331fb3eed0a5366b28b25a016f1ad04fac0fa8e/EIPS/eip-2780.md',
  specDate: '2026-08-04',
  testReleaseUrl: GLAMSTERDAM_DEVNET_TEST_RELEASE_URL,
  testReleaseName: GLAMSTERDAM_DEVNET_TEST_RELEASE_NAME,
  notes:
    'gasUsed is the observation. Pieces are not separate result fields: sender 12,000, recipient touch 3,000, value and transfer log 6,000. New-account state gas is EIP-8037, not this split.',
}
