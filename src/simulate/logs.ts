import type { Log } from '@ethereumjs/evm'
import {
  decodeEIP7708BurnLog,
  decodeEIP7708TransferLog,
  EIP7708_SYSTEM_ADDRESS,
} from '@ethereumjs/evm'
import { bytesToHex, hexToBytes, type PrefixedHexString } from '@ethereumjs/util'

import type { SimulateDecodedLog, SimulateLogDecoration, SimulateRawLog } from '../types/index.js'

export function logToRaw(log: Log): SimulateRawLog {
  const [address, topics, data] = log
  return {
    address: bytesToHex(address),
    topics: topics.map((topic) => bytesToHex(topic)),
    data: bytesToHex(data),
  }
}

function rawToLog(raw: SimulateRawLog): Log {
  return [
    hexToBytes(raw.address as PrefixedHexString),
    raw.topics.map((topic) => hexToBytes(topic as PrefixedHexString)),
    hexToBytes(raw.data as PrefixedHexString),
  ]
}

export function decorateRawLog(raw: SimulateRawLog): SimulateLogDecoration | undefined {
  const transfer = decodeEIP7708TransferLog(rawToLog(raw))
  if (transfer) {
    return {
      kind: 'eth-transfer',
      from: transfer.from,
      to: transfer.to,
      valueWei: transfer.value.toString(),
    }
  }

  const burn = decodeEIP7708BurnLog(rawToLog(raw))
  if (burn) {
    return {
      kind: 'eth-burn',
      account: burn.account,
      valueWei: burn.value.toString(),
    }
  }

  return undefined
}

export function mapExecLogs(logs: Log[] | undefined): {
  logs: SimulateRawLog[]
  decodedLogs: SimulateDecodedLog[]
} {
  if (!logs || logs.length === 0) {
    return { logs: [], decodedLogs: [] }
  }

  const rawLogs = logs.map(logToRaw)
  const decodedLogs = rawLogs.map((raw, index) => ({
    index,
    raw,
    decoration: decorateRawLog(raw),
  }))

  return { logs: rawLogs, decodedLogs }
}

export function systemAddressHex(): string {
  return bytesToHex(EIP7708_SYSTEM_ADDRESS)
}

export function countEthTransferLogs(decodedLogs: SimulateDecodedLog[]): number {
  return decodedLogs.filter((entry) => entry.decoration?.kind === 'eth-transfer').length
}
