/** secp256r1 verify (0x100) input layout. */
export const P256_VERIFY_ADDRESS = 0x100

export const P256_INPUT_LAYOUT =
  'Five 32-byte words concatenated: message hash, r, s, public key x, public key y. Valid signature returns 32-byte 0x01.'

/** Valid "Hello Fusaka!" vector from website exploration examples. */
export function p256ValidInputHex(): string {
  return (
    '4dfb1eae8ed41e188b8a44a1109d982d01fc24bb85a933e6283e8838e46942fd' +
    'eb3dc5ce2902f162745057efb7a3308eba992c0d843623603516845ffccd3f10' +
    '3b91fedfb22f40063245c621036a040c159f02ae02e6d450ff9b53235e9232c4' +
    'bfa6d0a419b5bc625939cccb8db65a16f7c30c697928660e9da53eda031e80fa' +
    'db5998a893f9b8971a3892aecd132c0eca1bc9622e542f428d8129222f26bdc5'
  )
}
