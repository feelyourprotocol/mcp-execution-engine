import { createEVM, type InterpreterStep } from '@ethereumjs/evm'
import { bytesToHex } from '@ethereumjs/util'

import { ENGINE_CEILINGS, ENGINE_VERSION } from '../forks/registry.js'
import { parseBytecodeHex, parseGasLimit, resolveFork } from '../forks/resolve.js'
import { buildProvenance } from '../provenance/build.js'
import type { SimulateBytecodeInput, SimulateBytecodeResult, StepTrace } from '../types.js'
import { EngineError } from '../types.js'
import { stepToTrace } from './trace.js'

export async function simulateBytecode(
  input: SimulateBytecodeInput,
): Promise<SimulateBytecodeResult> {
  const code = parseBytecodeHex(input.bytecode)
  const gasLimit = parseGasLimit(input.gasLimit)
  const { config, common } = resolveFork(input.fork)
  const provenance = buildProvenance(ENGINE_VERSION, config)

  const evm = await createEVM({ common })
  const steps: StepTrace[] = []
  let traceLimitHit = false

  if (input.trace) {
    evm.events.on('step', (step: InterpreterStep, resolve?: () => void) => {
      if (steps.length >= ENGINE_CEILINGS.maxTraceSteps) {
        traceLimitHit = true
        resolve?.()
        return
      }
      steps.push(stepToTrace(step))
      resolve?.()
    })
  }

  const result = await evm.runCode({ code, gasLimit })

  const finalStack =
    steps.length > 0
      ? steps[steps.length - 1].stack
      : (result.runState?.stack
          ?.peek(Math.min(32, result.runState.stack.length))
          .map((word) => `0x${word.toString(16)}`)
          .reverse() ?? [])

  const response: SimulateBytecodeResult = {
    success: !result.exceptionError,
    gasUsed: result.executionGasUsed.toString(),
    returnValue: bytesToHex(result.returnValue),
    finalStack,
    error: result.exceptionError?.error ?? null,
    provenance,
  }

  if (input.trace) {
    response.steps = steps
    if (traceLimitHit) {
      throw new EngineError(
        `Trace exceeded max steps (${ENGINE_CEILINGS.maxTraceSteps})`,
        'trace_too_long',
      )
    }
  }

  return response
}
