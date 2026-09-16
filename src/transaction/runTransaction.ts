import { createBlock } from '@ethereumjs/block'
import { createAddressFromString } from '@ethereumjs/util'
import { createVM, runTx } from '@ethereumjs/vm'

import { authorizationListJsonToBytes } from '../authorization/parseAuthorizationList.js'
import { ENGINE_VERSION } from '../forks/registry.js'
import {
  parseAddress,
  parseGasLimit,
  parseOptionalHexData,
  parseWeiValue,
  resolveFork,
} from '../forks/resolve.js'
import { buildProvenance } from '../provenance/build.js'
import type { RunTransactionInput, RunTransactionResult } from '../types.js'
import { EngineError } from '../types.js'
import {
  applyPrefundAccounts,
  applyPrefundStorage,
  createImpersonated7702Tx,
  createImpersonatedTx,
  emptyTransactionResult,
  installCodeAt,
  LAB_BASE_FEE,
  LAB_BLOCK_GAS_LIMIT,
  LAB_COINBASE,
  putFundedAccount,
  senderUpfrontCost,
  transactionResultFromRunTx,
} from './lab.js'

export async function runTransaction(input: RunTransactionInput): Promise<RunTransactionResult> {
  if (input.from === undefined || input.from.trim() === '') {
    throw new EngineError('Provide from', 'invalid_input')
  }
  if (input.to === undefined || input.to.trim() === '') {
    throw new EngineError('Provide to', 'invalid_input')
  }

  const gasLimit = parseGasLimit(input.gasLimit)
  const { config, common } = resolveFork(input.fork)
  const provenance = buildProvenance(ENGINE_VERSION, config)

  if (input.authorizationList !== undefined && !common.isActivatedEIP(7702)) {
    throw new EngineError(
      'authorizationList requires a fork with EIP-7702 active (e.g. prague)',
      'unsupported_eip',
    )
  }

  const from = parseAddress(input.from)
  const to = parseAddress(input.to)
  const value = parseWeiValue(input.value)
  const data = parseOptionalHexData(input.data)

  const vm = await createVM({ common })
  await applyPrefundAccounts(vm, input.accounts)

  if (input.code !== undefined && input.code.trim() !== '') {
    await installCodeAt(vm, to, input.code)
  }
  await applyPrefundStorage(vm, input.accounts)

  await putFundedAccount(vm, from, senderUpfrontCost(value, gasLimit))

  const authBytes =
    input.authorizationList !== undefined
      ? authorizationListJsonToBytes(input.authorizationList)
      : undefined

  const tx =
    authBytes !== undefined
      ? createImpersonated7702Tx({
          common,
          from,
          to,
          value,
          data,
          gasLimit,
          authorizationList: authBytes,
        })
      : createImpersonatedTx({ common, from, to, value, data, gasLimit })
  const block = createBlock(
    {
      header: {
        number: 1n,
        gasLimit: LAB_BLOCK_GAS_LIMIT,
        baseFeePerGas: LAB_BASE_FEE,
        coinbase: createAddressFromString(LAB_COINBASE),
      },
    },
    { common, skipConsensusFormatValidation: true },
  )

  try {
    const result = await runTx(vm, { tx, block, skipHardForkValidation: true })
    return transactionResultFromRunTx(result, provenance)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return emptyTransactionResult(message, provenance)
  }
}
