import { createAddressFromPrivateKey, hexToBytes } from '@ethereumjs/util'

/** Matches website EIP-7928 curriculum addresses. */
export const BAL_SENDER_PRIVATE_KEY = hexToBytes(`0x${'20'.repeat(32)}`)
export const BAL_SENDER = createAddressFromPrivateKey(BAL_SENDER_PRIVATE_KEY).toString()

export const BAL_RECIPIENT_PRIVATE_KEY = hexToBytes(`0x${'71'.repeat(32)}`)
export const BAL_RECIPIENT = createAddressFromPrivateKey(BAL_RECIPIENT_PRIVATE_KEY).toString()

export const BAL_CONTRACT_PRIVATE_KEY = hexToBytes(`0x${'42'.repeat(32)}`)
export const BAL_CONTRACT = createAddressFromPrivateKey(BAL_CONTRACT_PRIVATE_KEY).toString()

export const SSTORE_42_BYTECODE = '0x602a60005500'
export const SSTORE_REVERT_BYTECODE = '0x602a60005560006000fd'

export const BAL_SENDER_PREFUND = {
  address: BAL_SENDER,
  balance: '1000000000000000000',
}
