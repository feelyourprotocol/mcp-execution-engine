import { describe, expect, it } from 'vitest'

import { runTransaction } from '../transaction/runTransaction.js'
import {
  AUTHORITY_ADDRESS,
  DELEGATE_ADDRESS,
  DELEGATE_RETURN_BYTECODE,
  signedDelegationAuthorization,
  SPONSOR_ADDRESS,
} from './fixtures/eip7702.js'

describe('run_transaction authorizationList (Pectra+ fork feature)', () => {
  it('runs delegate bytecode through an authority EOA on Pectra', async () => {
    const auth = signedDelegationAuthorization()
    const result = await runTransaction({
      from: SPONSOR_ADDRESS,
      to: AUTHORITY_ADDRESS,
      fork: { baseHardfork: 'pectra' },
      authorizationList: [auth],
      accounts: [
        { address: DELEGATE_ADDRESS, code: DELEGATE_RETURN_BYTECODE },
        { address: AUTHORITY_ADDRESS, balance: '0' },
      ],
    })

    expect(result.success).toBe(true)
    expect(result.returnValue.toLowerCase()).toContain('42')
  })

  it('rejects authorizationList when set-code is inactive (Dencun)', async () => {
    const auth = signedDelegationAuthorization()
    await expect(
      runTransaction({
        from: SPONSOR_ADDRESS,
        to: AUTHORITY_ADDRESS,
        fork: { baseHardfork: 'dencun' },
        authorizationList: [auth],
        accounts: [{ address: DELEGATE_ADDRESS, code: DELEGATE_RETURN_BYTECODE }],
      }),
    ).rejects.toMatchObject({ code: 'unsupported_eip' })
  })
})
