import {
  type EOACode7702AuthorizationListBytes,
  type EOACode7702AuthorizationListItem,
  eoaCode7702AuthorizationListJSONItemToBytes,
} from '@ethereumjs/util'

import { EngineError } from '../types.js'

export function authorizationListJsonToBytes(
  items: EOACode7702AuthorizationListItem[],
): EOACode7702AuthorizationListBytes {
  if (items.length === 0) {
    throw new EngineError('authorizationList must not be empty', 'invalid_input')
  }
  return items.map((item) => eoaCode7702AuthorizationListJSONItemToBytes(item))
}
