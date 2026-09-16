import {
  createAddressFromPrivateKey,
  eoaCode7702AuthorizationListBytesItemToJSON,
  eoaCode7702SignAuthorization,
  hexToBytes,
} from '@ethereumjs/util'

/** Returns one byte `0x42` from delegate runtime. */
export const DELEGATE_RETURN_BYTECODE = '60426000526001601ff3'

export const DELEGATE_ADDRESS = '0x00000000000000000000000000000000000000b1'

export const AUTHORITY_PRIVATE_KEY = hexToBytes(`0x${'aa'.repeat(32)}`)

export const AUTHORITY_ADDRESS = createAddressFromPrivateKey(AUTHORITY_PRIVATE_KEY).toString()

export const SPONSOR_ADDRESS = '0x00000000000000000000000000000000000000ee'

export function signedDelegationAuthorization() {
  return eoaCode7702AuthorizationListBytesItemToJSON(
    eoaCode7702SignAuthorization(
      {
        chainId: '0x00',
        address: DELEGATE_ADDRESS,
        nonce: '0x00',
      },
      AUTHORITY_PRIVATE_KEY,
    ),
  )
}
