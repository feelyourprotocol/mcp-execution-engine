import { describe, expect, it } from 'vitest'
import { bytesToHex } from '@ethereumjs/util'
import { createVM } from '@ethereumjs/vm'

import { parseAddress, parseBytes32, resolveFork } from '../forks/resolve.js'
import { applyPrefundAccounts } from '../transaction/lab.js'

describe('applyPrefundAccounts', () => {
  it('applies zero balance, nonce, code, and storage', async () => {
    const { common } = resolveFork({ baseHardfork: 'glamsterdam' })
    const vm = await createVM({ common })
    const address = '0x00000000000000000000000000000000000000cc'

    await applyPrefundAccounts(vm, [
      {
        address,
        balance: '0',
        nonce: '7',
        code: '0x600100',
        storage: [{ slot: '0x01', value: '0x02' }],
      },
    ])

    const account = await vm.stateManager.getAccount(parseAddress(address))
    expect(account).toBeDefined()
    expect(account!.balance).toBe(0n)
    expect(account!.nonce).toBe(7n)

    const slotKey = parseBytes32('0x01', 'storage.slot')
    const slot = await vm.stateManager.getStorage(parseAddress(address), slotKey)
    expect(bytesToHex(slot)).toBe('0x02')
  })

  it('defaults balance to 1 ETH when balance field is omitted', async () => {
    const { common } = resolveFork({ baseHardfork: 'fusaka' })
    const vm = await createVM({ common })
    const address = '0x00000000000000000000000000000000000000dd'

    await applyPrefundAccounts(vm, [{ address }])

    const account = await vm.stateManager.getAccount(parseAddress(address))
    expect(account!.balance).toBe(10n ** 18n)
    expect(account!.nonce).toBe(0n)
  })
})
