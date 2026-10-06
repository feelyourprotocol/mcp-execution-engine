import {
  type AccessList2930Tx,
  type EOACode7702Tx,
  getCalldataFloorGas,
  getEip7702IntrinsicAuthGas,
  type LegacyTx,
} from '@ethereumjs/tx'
import { type Address, BIGINT_0, equalsBytes } from '@ethereumjs/util'
import type { RunTxResult } from '@ethereumjs/vm'

import type {
  RecipientPrestate,
  RegularGasBreakdown,
  RegularGasPartDelta,
  RegularGasPartName,
  RunBlockTxResult,
} from '../types/index.js'

export type ImpersonatedTx = LegacyTx | AccessList2930Tx | EOACode7702Tx

function isSelfTransfer(tx: ImpersonatedTx, from: Address): boolean {
  return tx.to !== undefined && equalsBytes(tx.to.bytes, from.bytes)
}

function isCreateTx(tx: ImpersonatedTx): boolean {
  try {
    return tx.toCreationAddress()
  } catch {
    return false
  }
}

export async function classifyRecipientPrestate(
  getAccount: (address: Address) => Promise<{ balance: bigint; nonce: bigint } | undefined>,
  getCode: (address: Address) => Promise<Uint8Array>,
  from: Address,
  to: Address | undefined,
): Promise<RecipientPrestate | undefined> {
  if (to === undefined) {
    return undefined
  }
  if (equalsBytes(from.bytes, to.bytes)) {
    return 'self'
  }
  const account = await getAccount(to)
  const code = await getCode(to)
  const empty =
    (account === undefined || (account.balance === 0n && account.nonce === 0n)) && code.length === 0
  return empty ? 'created' : 'existing'
}

/**
 * Sender-aware regular-gas parts that sum to `total` (txRegularGas or paid gasUsed).
 */
export function computeRegularGasBreakdown(
  tx: ImpersonatedTx,
  from: Address,
  result: RunTxResult,
): RegularGasBreakdown | undefined {
  if (result.execResult.exceptionError !== undefined && result.totalGasSpent === 0n) {
    return undefined
  }

  const total = result.txRegularGas !== undefined ? result.txRegularGas : result.totalGasSpent
  if (total === undefined || total < 0n) {
    return undefined
  }

  const common = tx.common
  const base = common.param('txGas') ?? 21000n
  let creation = BIGINT_0
  if (common.gteHardfork('homestead') && isCreateTx(tx)) {
    creation = common.param('txCreationGas') ?? BIGINT_0
  }

  let recipient = BIGINT_0
  let valuePart = BIGINT_0
  if (common.isActivatedEIP(2780) && !isCreateTx(tx) && !isSelfTransfer(tx, from)) {
    recipient = common.param('txRecipientAccessGas') ?? BIGINT_0
    if (tx.value > BIGINT_0) {
      valuePart = common.param('txValueCost') ?? BIGINT_0
    }
  }

  const dataGas = tx.getDataGas()
  const auth = getEip7702IntrinsicAuthGas(tx)
  const intrinsic = tx.getIntrinsicGas()
  const floor = getCalldataFloorGas(tx, from)
  const floorWins = common.isActivatedEIP(7623) && floor > intrinsic
  const calldata = floorWins ? BIGINT_0 : dataGas
  const floorUplift = floorWins
    ? floor - (base + creation + recipient + valuePart + auth)
    : BIGINT_0

  const fixed = base + creation + recipient + valuePart + calldata + auth + floorUplift
  const execution = total >= fixed ? total - fixed : BIGINT_0

  return {
    total: total.toString(),
    base: base.toString(),
    creation: creation.toString(),
    recipient: recipient.toString(),
    value: valuePart.toString(),
    calldata: calldata.toString(),
    auth: auth.toString(),
    floorUplift: floorUplift.toString(),
    execution: execution.toString(),
  }
}

const DELTA_PARTS: RegularGasPartName[] = [
  'base',
  'creation',
  'recipient',
  'value',
  'calldata',
  'auth',
  'floorUplift',
  'execution',
]

export function computeRegularGasDelta(
  transactions: RunBlockTxResult[],
): RegularGasPartDelta[] | undefined {
  const successful = transactions.filter((tx) => tx.success && tx.regularGas !== undefined)
  if (successful.length < 2) {
    return undefined
  }
  const totals = transactions.map((tx) => tx.regularGas?.total)
  if (new Set(totals).size <= 1) {
    return undefined
  }

  const deltas: RegularGasPartDelta[] = []
  for (const part of DELTA_PARTS) {
    const byTxIndex = transactions.map((tx) => tx.regularGas?.[part] ?? '0')
    if (new Set(byTxIndex).size > 1) {
      deltas.push({ part, byTxIndex })
    }
  }
  return deltas.length > 0 ? deltas : undefined
}

export function sumRegularGasParts(parts: RegularGasBreakdown): bigint {
  return (
    BigInt(parts.base) +
    BigInt(parts.creation) +
    BigInt(parts.recipient) +
    BigInt(parts.value) +
    BigInt(parts.calldata) +
    BigInt(parts.auth) +
    BigInt(parts.floorUplift) +
    BigInt(parts.execution)
  )
}
