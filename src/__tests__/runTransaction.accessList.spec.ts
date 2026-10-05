import { describe, expect, it } from 'vitest'

import { runTransaction } from '../transaction/runTransaction.js'
import { FUNDED_RECIPIENT, STATE_GAS_CALLER } from './fixtures/eip8037.js'

const FUNDED = [{ address: FUNDED_RECIPIENT, balance: '1000000000000000000' }]
const ZERO_SLOT = `0x${'00'.repeat(32)}`

describe('runTransaction accessList (EIP-7981)', () => {
  it('rejects accessList together with authorizationList', async () => {
    await expect(
      runTransaction({
        from: STATE_GAS_CALLER,
        to: FUNDED_RECIPIENT,
        accessList: [{ address: FUNDED_RECIPIENT, storageKeys: [ZERO_SLOT] }],
        authorizationList: [
          {
            chainId: '0x01',
            address: FUNDED_RECIPIENT,
            nonce: '0x00',
            yParity: '0x00',
            r: '0x01',
            s: '0x02',
          },
        ],
        accounts: FUNDED,
        fork: { baseHardfork: 'glamsterdam' },
      }),
    ).rejects.toThrow(/mutually exclusive/)
  })

  it('charges access-list bytes at the floor on Glamsterdam only', async () => {
    const amsterdam = await runTransaction({
      from: STATE_GAS_CALLER,
      to: FUNDED_RECIPIENT,
      value: '0',
      accessList: [{ address: FUNDED_RECIPIENT, storageKeys: [ZERO_SLOT] }],
      accounts: FUNDED,
      fork: { baseHardfork: 'glamsterdam' },
    })
    const fusaka = await runTransaction({
      from: STATE_GAS_CALLER,
      to: FUNDED_RECIPIENT,
      value: '0',
      accessList: [{ address: FUNDED_RECIPIENT, storageKeys: [ZERO_SLOT] }],
      accounts: FUNDED,
      fork: { baseHardfork: 'fusaka' },
    })

    expect(amsterdam.success).toBe(true)
    expect(fusaka.success).toBe(true)
    expect(amsterdam.gasUsed).toBe('23228')
    expect(fusaka.gasUsed).toBe('25300')
  })
})
