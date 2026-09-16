import type { InspectInput, InspectResult } from '../types.js'
import { EngineError } from '../types.js'
import { inspectAuthorizationList } from './kinds/authorizationList.js'
import { inspectBlockAccessList } from './kinds/blockAccessList.js'
import { inspectExecutionRequests } from './kinds/executionRequests.js'
import { inspectTypedTransaction } from './kinds/typedTransaction.js'
import { inspectWithdrawalsList } from './kinds/withdrawalsList.js'

export async function inspectArtifact(input: InspectInput): Promise<InspectResult> {
  const kind = input.kind ?? 'block-access-list'

  switch (kind) {
    case 'block-access-list':
      return inspectBlockAccessList(input)
    case 'authorization-list':
      return inspectAuthorizationList(input)
    case 'typed-transaction':
      return inspectTypedTransaction(input)
    case 'withdrawals':
      return await inspectWithdrawalsList(input)
    case 'execution-requests':
      return inspectExecutionRequests(input)
    default:
      throw new EngineError(`Unsupported inspect kind: ${kind}`, 'invalid_input')
  }
}
