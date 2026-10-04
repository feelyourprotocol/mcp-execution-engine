import {
  type AccessList as TxAccessList,
  type AccessList2930TxData,
  accessListJSONToBytes,
} from '@ethereumjs/tx'

import type { RunTransactionAccessListItem } from '../types/index.js'
import { EngineError } from '../types/index.js'

export function accessListJsonToBytes(
  items: RunTransactionAccessListItem[],
): AccessList2930TxData['accessList'] {
  if (items.length === 0) {
    throw new EngineError('accessList must not be empty', 'invalid_input')
  }
  const json = items.map((entry) => ({
    address: entry.address,
    storageKeys: entry.storageKeys ?? [],
  }))
  return accessListJSONToBytes(json as TxAccessList)
}
