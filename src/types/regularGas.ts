/** Recipient shape before the transaction runs (labels state gas, not part of regularGas sum). */
export type RecipientPrestate = 'self' | 'existing' | 'created'

export interface RegularGasBreakdown {
  /** Matches txRegularGas on Glamsterdam; otherwise paid gasUsed when no state split. */
  total: string
  base: string
  creation: string
  recipient: string
  value: string
  calldata: string
  auth: string
  floorUplift: string
  execution: string
}

export type RegularGasPartName = keyof Omit<RegularGasBreakdown, 'total'>

/** Per-tx values for parts that differ across a lab block. */
export interface RegularGasPartDelta {
  part: RegularGasPartName
  byTxIndex: string[]
}
