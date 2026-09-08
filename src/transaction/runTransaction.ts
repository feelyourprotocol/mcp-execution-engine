import { createBlock } from '@ethereumjs/block'
import { createLegacyTx, type LegacyTx } from '@ethereumjs/tx'
import { type Address, bytesToHex, createAccount, createAddressFromString } from '@ethereumjs/util'
import { createVM, runTx, type RunTxResult } from '@ethereumjs/vm'

import { ENGINE_VERSION } from '../forks/registry.js'
import {
  parseAddress,
  parseBytecodeHex,
  parseGasLimit,
  parseOptionalHexData,
  parseWeiValue,
  resolveFork,
} from '../forks/resolve.js'
import { buildProvenance } from '../provenance/build.js'
import { mapExecLogs } from '../simulate/logs.js'
import type { RunTransactionInput, RunTransactionResult } from '../types.js'
import { EngineError } from '../types.js'

/** Lab gas price — above a 1 wei base fee so legacy txs are valid on 1559 forks. */
const LAB_GAS_PRICE = 10n
const LAB_BASE_FEE = 1n
const LAB_BLOCK_GAS_LIMIT = 30_000_000n
const LAB_COINBASE = '0x00000000000000000000000000000000000000c1'

function createImpersonatedTx(opts: {
  common: ReturnType<typeof resolveFork>['common']
  from: Address
  to: Address
  value: bigint
  data: Uint8Array
  gasLimit: bigint
}): LegacyTx {
  const tx = createLegacyTx(
    {
      nonce: 0n,
      gasLimit: opts.gasLimit,
      gasPrice: LAB_GAS_PRICE,
      to: opts.to,
      value: opts.value,
      data: opts.data,
    },
    { common: opts.common, freeze: false },
  )
  tx.getSenderAddress = () => opts.from
  return tx
}

async function applyPrefundAccounts(
  vm: Awaited<ReturnType<typeof createVM>>,
  accounts: RunTransactionInput['accounts'],
): Promise<void> {
  if (!accounts?.length) return

  for (const entry of accounts) {
    const address = parseAddress(entry.address)
    const balance = parseWeiValue(entry.balance ?? '1000000000000000000')
    await vm.stateManager.putAccount(address, createAccount({ nonce: 0n, balance }))
    if (entry.code !== undefined && entry.code.trim() !== '') {
      await vm.stateManager.putCode(address, parseBytecodeHex(entry.code))
    }
  }
}

function emptyResult(
  error: string,
  provenance: ReturnType<typeof buildProvenance>,
): RunTransactionResult {
  return {
    success: false,
    gasUsed: '0',
    gasUsedScope: 'transaction',
    returnValue: '0x',
    error,
    provenance,
  }
}

function fromRunTx(
  result: RunTxResult,
  provenance: ReturnType<typeof buildProvenance>,
): RunTransactionResult {
  const receiptLogs = 'logs' in result.receipt ? result.receipt.logs : result.execResult.logs
  const { logs, decodedLogs } = mapExecLogs(receiptLogs)
  const execError = result.execResult.exceptionError
  const response: RunTransactionResult = {
    success: execError === undefined,
    gasUsed: result.totalGasSpent.toString(),
    gasUsedScope: 'transaction',
    returnValue: bytesToHex(result.execResult.returnValue),
    error: execError?.error ?? null,
    provenance,
  }

  if (result.txRegularGas !== undefined) {
    response.txRegularGas = result.txRegularGas.toString()
  }
  if (result.txStateGas !== undefined) {
    response.txStateGas = result.txStateGas.toString()
  }
  if (logs.length > 0) {
    response.logs = logs
    response.decodedLogs = decodedLogs
  }

  return response
}

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

  const from = parseAddress(input.from)
  const to = parseAddress(input.to)
  const value = parseWeiValue(input.value)
  const data = parseOptionalHexData(input.data)

  const vm = await createVM({ common })
  await applyPrefundAccounts(vm, input.accounts)

  if (input.code !== undefined && input.code.trim() !== '') {
    const code = parseBytecodeHex(input.code)
    const existing = await vm.stateManager.getAccount(to)
    const balance = existing?.balance ?? BigInt(1e18)
    await vm.stateManager.putAccount(to, createAccount({ nonce: 0n, balance }))
    await vm.stateManager.putCode(to, code)
  }

  const gasCost = gasLimit * LAB_GAS_PRICE
  await vm.stateManager.putAccount(
    from,
    createAccount({ nonce: 0n, balance: value + gasCost + BigInt(1e18) }),
  )

  const tx = createImpersonatedTx({ common, from, to, value, data, gasLimit })
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
    return fromRunTx(result, provenance)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return emptyResult(message, provenance)
  }
}
