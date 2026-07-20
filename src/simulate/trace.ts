import type { InterpreterStep } from '@ethereumjs/evm'

import type { StepTrace } from '../types.js'

export function stepToTrace(step: InterpreterStep): StepTrace {
  const gasCost = step.opcode.dynamicFee ?? BigInt(step.opcode.fee)

  return {
    pc: step.pc,
    op: step.opcode.name,
    gasCost: gasCost.toString(),
    gasLeft: step.gasLeft.toString(),
    stack: [...step.stack].reverse().map((word) => `0x${word.toString(16)}`),
  }
}
