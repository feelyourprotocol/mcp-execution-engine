import { describe, expect, it } from 'vitest'

import { derivedComparisonForEip } from '../forks/introductions.js'
import { EIP_7702_MODULE } from '../modules/eip-7702/index.js'
import { runTransaction } from '../transaction/runTransaction.js'
import {
  AUTHORITY_ADDRESS,
  DELEGATE_ADDRESS,
  DELEGATE_RETURN_BYTECODE,
  signedDelegationAuthorization,
  SPONSOR_ADDRESS,
} from './fixtures/eip7702.js'

describe('EIP-7702 module', () => {
  it('describes set-code delegation without demo programs', () => {
    expect(EIP_7702_MODULE.eip).toBe(7702)
    expect(EIP_7702_MODULE.runnable).toBe(true)
    expect(EIP_7702_MODULE.changeNature).toBe('new-exec-model')
    expect(EIP_7702_MODULE.shapes).toEqual(['transaction', 'inspect'])
    expect(derivedComparisonForEip(7702)).toEqual({
      baselineForkId: 'dencun',
      previewForkId: 'pectra',
    })
  })

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

  it('rejects authorizationList when EIP-7702 is inactive (Dencun)', async () => {
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
