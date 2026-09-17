import {
  createEOACode7702Tx,
  createLegacyTx,
  type EOACode7702Tx,
  type LegacyTx,
} from '@ethereumjs/tx'
import type { EOACode7702AuthorizationListBytes } from '@ethereumjs/util'
import { type Address, bytesToHex, createAccount } from '@ethereumjs/util'
import { createVM, type RunTxResult } from '@ethereumjs/vm'

import {
  parseAddress,
  parseBytecodeHex,
  parseBytes32,
  parseWeiValue,
  resolveFork,
} from '../forks/resolve.js'
import { mapExecLogs } from '../simulate/logs.js'
import type {
  RunBlockTxResult,
  RunTransactionResult,
  SimulatePrefundAccount,
} from '../types/index.js'

export { LAB_BYTECODE_ADDRESS, LAB_BYTECODE_CALLER, LAB_COINBASE } from './addresses.js'

/** Lab gas price — above a 1 wei base fee so legacy txs are valid on 1559 forks. */
export const LAB_GAS_PRICE = 10n
export const LAB_BASE_FEE = 1n
export const LAB_BLOCK_GAS_LIMIT = 30_000_000n
export const LAB_DEFAULT_BLOCK_NUMBER = 1n
export const LAB_DEFAULT_TIMESTAMP = 1n

export function createImpersonatedTx(opts: {
  common: ReturnType<typeof resolveFork>['common']
  from: Address
  to: Address
  value: bigint
  data: Uint8Array
  gasLimit: bigint
  nonce?: bigint
}): LegacyTx {
  const tx = createLegacyTx(
    {
      nonce: opts.nonce ?? 0n,
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

export function createImpersonated7702Tx(opts: {
  common: ReturnType<typeof resolveFork>['common']
  from: Address
  to: Address
  value: bigint
  data: Uint8Array
  gasLimit: bigint
  authorizationList: EOACode7702AuthorizationListBytes
  nonce?: bigint
}): EOACode7702Tx {
  const tx = createEOACode7702Tx(
    {
      nonce: opts.nonce ?? 0n,
      gasLimit: opts.gasLimit,
      maxFeePerGas: LAB_GAS_PRICE,
      maxPriorityFeePerGas: LAB_GAS_PRICE,
      to: opts.to,
      value: opts.value,
      data: opts.data,
      authorizationList: opts.authorizationList,
    },
    { common: opts.common, freeze: false },
  )
  tx.getSenderAddress = () => opts.from
  return tx
}

export async function applyPrefundAccounts(
  vm: Awaited<ReturnType<typeof createVM>>,
  accounts: SimulatePrefundAccount[] | undefined,
): Promise<void> {
  if (!accounts?.length) return

  for (const entry of accounts) {
    const address = parseAddress(entry.address)
    const balance = parseWeiValue(entry.balance ?? '1000000000000000000')
    await vm.stateManager.putAccount(address, createAccount({ nonce: 0n, balance }))
    if (entry.code !== undefined && entry.code.trim() !== '') {
      await vm.stateManager.putCode(address, parseBytecodeHex(entry.code))
    }
    await applyAccountStorageSlots(vm, address, entry.storage)
  }
}

/** Re-apply storage after `installCodeAt` (putAccount can run after the first seed). */
export async function applyPrefundStorage(
  vm: Awaited<ReturnType<typeof createVM>>,
  accounts: SimulatePrefundAccount[] | undefined,
): Promise<void> {
  if (!accounts?.length) return
  for (const entry of accounts) {
    await applyAccountStorageSlots(vm, parseAddress(entry.address), entry.storage)
  }
}

async function applyAccountStorageSlots(
  vm: Awaited<ReturnType<typeof createVM>>,
  address: Address,
  storage: SimulatePrefundAccount['storage'],
): Promise<void> {
  if (!storage?.length) return
  for (const item of storage) {
    const slot = parseBytes32(item.slot, 'storage.slot')
    const value = parseBytes32(item.value, 'storage.value')
    await vm.stateManager.putStorage(address, slot, value)
  }
}

export function txFieldsFromRunTx(result: RunTxResult): RunBlockTxResult {
  const receiptLogs = 'logs' in result.receipt ? result.receipt.logs : result.execResult.logs
  const { logs, decodedLogs } = mapExecLogs(receiptLogs)
  const execError = result.execResult.exceptionError
  const response: RunBlockTxResult = {
    success: execError === undefined,
    gasUsed: result.totalGasSpent.toString(),
    gasUsedScope: 'transaction',
    returnValue: bytesToHex(result.execResult.returnValue),
    error: execError?.error ?? null,
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

export function transactionResultFromRunTx(
  result: RunTxResult,
  provenance: RunTransactionResult['provenance'],
): RunTransactionResult {
  return { ...txFieldsFromRunTx(result), provenance }
}

export function emptyTransactionResult(
  error: string,
  provenance: RunTransactionResult['provenance'],
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

export async function putFundedAccount(
  vm: Awaited<ReturnType<typeof createVM>>,
  from: Address,
  balance: bigint,
  nonce = 0n,
): Promise<void> {
  await vm.stateManager.putAccount(from, createAccount({ nonce, balance }))
}

export function senderUpfrontCost(value: bigint, gasLimit: bigint): bigint {
  return value + gasLimit * LAB_GAS_PRICE + BigInt(1e18)
}

export async function installCodeAt(
  vm: Awaited<ReturnType<typeof createVM>>,
  to: Address,
  codeHex: string,
): Promise<void> {
  const code = parseBytecodeHex(codeHex)
  const existing = await vm.stateManager.getAccount(to)
  const balance = existing?.balance ?? BigInt(1e18)
  const nonce = existing?.nonce ?? 0n
  await vm.stateManager.putAccount(to, createAccount({ nonce, balance }))
  await vm.stateManager.putCode(to, code)
}
