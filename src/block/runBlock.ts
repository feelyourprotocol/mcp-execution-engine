import { createBlock } from '@ethereumjs/block'
import { type Address, createAddressFromString } from '@ethereumjs/util'
import { createVM, runBlock as executeVmBlock } from '@ethereumjs/vm'

import { ENGINE_CEILINGS, ENGINE_VERSION } from '../forks/registry.js'
import {
  parseAddress,
  parseGasLimit,
  parseOptionalHexData,
  parseUint64Field,
  parseWeiValue,
  resolveFork,
} from '../forks/resolve.js'
import { buildProvenance } from '../provenance/build.js'
import {
  applyPrefundAccounts,
  applyPrefundStorage,
  createImpersonatedTx,
  installCodeAt,
  LAB_BASE_FEE,
  LAB_BLOCK_GAS_LIMIT,
  LAB_COINBASE,
  LAB_DEFAULT_BLOCK_NUMBER,
  LAB_DEFAULT_TIMESTAMP,
  LAB_GAS_PRICE,
  putFundedAccount,
  txFieldsFromRunTx,
} from '../transaction/lab.js'
import type { RunBlockInput, RunBlockResult, RunBlockTxResult } from '../types.js'
import { EngineError } from '../types.js'

function emptyBlockResult(
  error: string,
  provenance: RunBlockResult['provenance'],
  header: RunBlockResult['header'],
): RunBlockResult {
  return {
    success: false,
    gasUsed: '0',
    gasUsedScope: 'block',
    header: { ...header, gasUsed: '0' },
    transactions: [],
    error,
    provenance,
  }
}

export async function runBlock(input: RunBlockInput): Promise<RunBlockResult> {
  if (!Array.isArray(input.transactions) || input.transactions.length === 0) {
    throw new EngineError('Provide at least one transaction', 'invalid_input')
  }
  if (input.transactions.length > ENGINE_CEILINGS.maxTxsPerBlock) {
    throw new EngineError(
      `Too many transactions (max ${ENGINE_CEILINGS.maxTxsPerBlock})`,
      'too_many_transactions',
    )
  }

  const { config, common } = resolveFork(input.fork)
  const provenance = buildProvenance(ENGINE_VERSION, config)

  const number = parseUint64Field(input.header?.number, 'number') ?? LAB_DEFAULT_BLOCK_NUMBER
  const timestamp = parseUint64Field(input.header?.timestamp, 'timestamp') ?? LAB_DEFAULT_TIMESTAMP
  const slotNumber = parseUint64Field(input.header?.slotNumber, 'slotNumber')

  if (slotNumber !== undefined && !common.isActivatedEIP(7843)) {
    throw new EngineError(
      'slotNumber requires a fork that activates EIP-7843 (Amsterdam)',
      'slot_not_available',
    )
  }

  const headerSnapshotBase = {
    number: number.toString(),
    timestamp: timestamp.toString(),
    ...(slotNumber !== undefined ? { slotNumber: slotNumber.toString() } : {}),
  }

  const vm = await createVM({ common })
  await applyPrefundAccounts(vm, input.accounts)

  const parsedTxs: {
    from: Address
    to: Address
    value: bigint
    data: Uint8Array
    gasLimit: bigint
  }[] = []

  for (const [index, raw] of input.transactions.entries()) {
    if (raw.from === undefined || raw.from.trim() === '') {
      throw new EngineError(`transactions[${index}]: Provide from`, 'invalid_input')
    }
    if (raw.to === undefined || raw.to.trim() === '') {
      throw new EngineError(`transactions[${index}]: Provide to`, 'invalid_input')
    }
    const from = parseAddress(raw.from)
    const to = parseAddress(raw.to)
    if (raw.code !== undefined && raw.code.trim() !== '') {
      await installCodeAt(vm, to, raw.code)
    }
    parsedTxs.push({
      from,
      to,
      value: parseWeiValue(raw.value),
      data: parseOptionalHexData(raw.data),
      gasLimit: parseGasLimit(raw.gasLimit),
    })
  }
  await applyPrefundStorage(vm, input.accounts)

  const neededBySender = new Map<string, { address: Address; wei: bigint }>()
  for (const tx of parsedTxs) {
    const key = tx.from.toString()
    const extra = tx.value + tx.gasLimit * LAB_GAS_PRICE
    const current = neededBySender.get(key)
    if (current === undefined) {
      neededBySender.set(key, { address: tx.from, wei: extra })
    } else {
      current.wei += extra
    }
  }
  for (const funded of neededBySender.values()) {
    await putFundedAccount(vm, funded.address, funded.wei + BigInt(1e18))
  }

  const nonceBySender = new Map<string, bigint>()
  const txs = parsedTxs.map((tx) => {
    const key = tx.from.toString()
    const nonce = nonceBySender.get(key) ?? 0n
    nonceBySender.set(key, nonce + 1n)
    return createImpersonatedTx({ ...tx, common, nonce })
  })

  const header: {
    number: bigint
    timestamp: bigint
    gasLimit: bigint
    baseFeePerGas: bigint
    coinbase: ReturnType<typeof createAddressFromString>
    slotNumber?: bigint
  } = {
    number,
    timestamp,
    gasLimit: LAB_BLOCK_GAS_LIMIT,
    baseFeePerGas: LAB_BASE_FEE,
    coinbase: createAddressFromString(LAB_COINBASE),
  }
  if (slotNumber !== undefined) {
    header.slotNumber = slotNumber
  }

  const block = createBlock(
    { header, transactions: txs },
    { common, skipConsensusFormatValidation: true, freeze: false },
  )

  for (const [index, tx] of block.transactions.entries()) {
    const from = parsedTxs[index]!.from
    tx.getSenderAddress = () => from
  }

  try {
    const result = await executeVmBlock(vm, {
      block,
      generate: true,
      skipBlockValidation: true,
      skipHeaderValidation: true,
      skipHardForkValidation: true,
    })

    const txResults: RunBlockTxResult[] = result.results.map((txResult) =>
      txFieldsFromRunTx(txResult),
    )
    const allOk = txResults.every((tx) => tx.success)
    const firstError = txResults.find((tx) => tx.error !== null)?.error ?? null

    return {
      success: allOk,
      gasUsed: result.gasUsed.toString(),
      gasUsedScope: 'block',
      header: {
        ...headerSnapshotBase,
        gasUsed: result.gasUsed.toString(),
      },
      transactions: txResults,
      error: firstError,
      provenance,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return emptyBlockResult(message, provenance, {
      ...headerSnapshotBase,
      gasUsed: '0',
    })
  }
}
