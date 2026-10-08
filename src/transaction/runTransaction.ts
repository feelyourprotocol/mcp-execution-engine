import { createBlock } from '@ethereumjs/block'
import { createAddressFromString } from '@ethereumjs/util'
import { createVM, runTx } from '@ethereumjs/vm'

import { authorizationListJsonToBytes } from '../authorization/parseAuthorizationList.js'
import { ENGINE_CEILINGS, ENGINE_VERSION } from '../forks/registry.js'
import {
  parseAddress,
  parseGasLimit,
  parseOptionalHexData,
  parseWeiValue,
  resolveFork,
} from '../forks/resolve.js'
import { buildProvenance } from '../provenance/build.js'
import type { RunTransactionInput, RunTransactionResult } from '../types/index.js'
import { EngineError } from '../types/index.js'
import {
  applyPrefundAccounts,
  applyPrefundStorage,
  createImpersonated2930Tx,
  createImpersonated7702Tx,
  createImpersonatedTx,
  emptyTransactionResult,
  installCodeAt,
  LAB_BASE_FEE,
  LAB_COINBASE,
  putFundedAccount,
  senderUpfrontCost,
  transactionResultFromRunTx,
} from './lab.js'
import { accessListJsonToBytes } from './parseAccessList.js'
import { classifyRecipientPrestate } from './regularGas.js'

export async function runTransaction(input: RunTransactionInput): Promise<RunTransactionResult> {
  if (input.from === undefined || input.from.trim() === '') {
    throw new EngineError('Provide from', 'invalid_input', { field: 'from' })
  }
  if (input.to !== undefined && input.to.trim() === '') {
    throw new EngineError(
      'to must be a recipient address or omitted for contract creation',
      'invalid_input',
      { field: 'to' },
    )
  }

  const gasLimit = parseGasLimit(input.gasLimit, ENGINE_CEILINGS.maxTransactionGasLimit, 'gasLimit')
  const { config, common, absorbedEips } = resolveFork(input.fork)
  const provenance = buildProvenance(ENGINE_VERSION, config, absorbedEips)

  if (input.authorizationList !== undefined && input.accessList !== undefined) {
    throw new EngineError(
      'authorizationList and accessList are mutually exclusive',
      'invalid_input',
      { field: 'authorizationList' },
    )
  }
  if (input.authorizationList !== undefined && input.to === undefined) {
    throw new EngineError('authorizationList requires to', 'invalid_input', {
      field: 'authorizationList',
    })
  }
  if (input.authorizationList !== undefined && !common.isActivatedEIP(7702)) {
    throw new EngineError(
      'authorizationList requires a fork with EIP-7702 active (e.g. prague)',
      'unsupported_eip',
      { field: 'authorizationList', facts: { eip: 7702 } },
    )
  }

  const from = parseAddress(input.from, 'from')
  const to = input.to === undefined ? undefined : parseAddress(input.to, 'to')
  const value = parseWeiValue(input.value, 'value')
  const data = parseOptionalHexData(input.data, 'data')

  const vm = await createVM({ common })
  await applyPrefundAccounts(vm, input.accounts)

  if (input.code !== undefined && input.code.trim() !== '' && to === undefined) {
    throw new EngineError(
      'code requires to; contract creation executes data as initcode',
      'invalid_input',
      { field: 'code' },
    )
  }
  if (input.code !== undefined && input.code.trim() !== '' && to !== undefined) {
    await installCodeAt(vm, to, input.code, 'code')
  }
  await applyPrefundStorage(vm, input.accounts)

  await putFundedAccount(vm, from, senderUpfrontCost(value, gasLimit))

  const authBytes =
    input.authorizationList !== undefined
      ? authorizationListJsonToBytes(input.authorizationList)
      : undefined
  const accessListBytes =
    input.accessList !== undefined ? accessListJsonToBytes(input.accessList) : undefined

  if (authBytes !== undefined && to === undefined) {
    throw new EngineError('authorizationList requires to', 'invalid_input', {
      field: 'authorizationList',
    })
  }
  try {
    const recipientPrestate = await classifyRecipientPrestate(
      (address) => vm.stateManager.getAccount(address),
      (address) => vm.stateManager.getCode(address),
      from,
      to,
    )
    const tx =
      authBytes !== undefined && to !== undefined
        ? createImpersonated7702Tx({
            common,
            from,
            to,
            value,
            data,
            gasLimit,
            authorizationList: authBytes,
          })
        : accessListBytes !== undefined
          ? createImpersonated2930Tx({
              common,
              from,
              to,
              value,
              data,
              gasLimit,
              accessList: accessListBytes,
            })
          : createImpersonatedTx({ common, from, to, value, data, gasLimit })
    const block = createBlock(
      {
        header: {
          number: 1n,
          gasLimit: ENGINE_CEILINGS.maxTransactionGasLimit,
          baseFeePerGas: LAB_BASE_FEE,
          coinbase: createAddressFromString(LAB_COINBASE),
        },
      },
      { common, skipConsensusFormatValidation: true },
    )

    const result = await runTx(vm, { tx, block, skipHardForkValidation: true })
    const deployedCodeSize =
      result.execResult.exceptionError === undefined && result.createdAddress !== undefined
        ? (await vm.stateManager.getCode(result.createdAddress)).length
        : undefined
    return transactionResultFromRunTx(result, provenance, deployedCodeSize, {
      tx,
      from,
      recipientPrestate,
    })
  } catch (error) {
    if (error instanceof EngineError) {
      throw error
    }
    const message = error instanceof Error ? error.message : String(error)
    return emptyTransactionResult(message, provenance, 'unexpected')
  }
}
