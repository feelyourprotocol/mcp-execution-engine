import { type ExecResult, type InterpreterStep } from '@ethereumjs/evm'
import { bytesToHex } from '@ethereumjs/util'
import { createVM } from '@ethereumjs/vm'

import { ENGINE_CEILINGS, ENGINE_VERSION } from '../forks/registry.js'
import { parseAddress, parseGasLimit, resolveFork } from '../forks/resolve.js'
import { buildProvenance } from '../provenance/build.js'
import {
  applyPrefundAccounts,
  applyPrefundStorage,
  installCodeAt,
  LAB_BYTECODE_ADDRESS,
  LAB_BYTECODE_CALLER,
  putFundedAccount,
} from '../transaction/lab.js'
import type { SimulateBytecodeInput, SimulateBytecodeResult, StepTrace } from '../types.js'
import { EngineError } from '../types.js'
import { mapExecLogs } from './logs.js'
import { stepToTrace } from './trace.js'

function validateInput(input: SimulateBytecodeInput): void {
  if (input.bytecode === undefined || input.bytecode.trim() === '') {
    throw new EngineError('Provide bytecode', 'invalid_input')
  }
}

function buildFinalStack(steps: StepTrace[], result: ExecResult): string[] {
  if (steps.length > 0) {
    return steps[steps.length - 1].stack
  }
  return (
    result.runState?.stack
      ?.peek(Math.min(32, result.runState.stack.length))
      .map((word) => `0x${word.toString(16)}`)
      .reverse() ?? []
  )
}

function buildResponse(
  result: ExecResult,
  steps: StepTrace[],
  provenance: ReturnType<typeof buildProvenance>,
): SimulateBytecodeResult {
  const { logs, decodedLogs } = mapExecLogs(result.logs)
  const response: SimulateBytecodeResult = {
    success: !result.exceptionError,
    gasUsed: result.executionGasUsed.toString(),
    gasUsedScope: 'call-frame',
    returnValue: bytesToHex(result.returnValue),
    finalStack: buildFinalStack(steps, result),
    error: result.exceptionError?.error ?? null,
    provenance,
  }

  if (result.stateGasSpilled !== undefined && result.stateGasSpilled > 0n) {
    response.stateGasSpilled = result.stateGasSpilled.toString()
  }

  if (logs.length > 0) {
    response.logs = logs
    response.decodedLogs = decodedLogs
  }

  return response
}

export async function simulateBytecode(
  input: SimulateBytecodeInput,
): Promise<SimulateBytecodeResult> {
  validateInput(input)

  const gasLimit = parseGasLimit(input.gasLimit)
  const { config, common } = resolveFork(input.fork)
  const provenance = buildProvenance(ENGINE_VERSION, config)

  const vm = await createVM({ common })
  await applyPrefundAccounts(vm, input.accounts)

  const to = parseAddress(LAB_BYTECODE_ADDRESS)
  const caller = parseAddress(LAB_BYTECODE_CALLER)
  await installCodeAt(vm, to, input.bytecode)
  await applyPrefundStorage(vm, input.accounts)
  await putFundedAccount(vm, caller, BigInt(1e18))

  const steps: StepTrace[] = []
  let traceLimitHit = false
  const evmEvents = vm.evm.events

  if (input.trace) {
    if (evmEvents === undefined) {
      throw new EngineError('EVM events unavailable for trace', 'internal')
    }
    evmEvents.on('step', (step: InterpreterStep, resolve?: () => void) => {
      if (steps.length >= ENGINE_CEILINGS.maxTraceSteps) {
        traceLimitHit = true
        resolve?.()
        return
      }
      steps.push(stepToTrace(step))
      resolve?.()
    })
  }

  const evmResult = await vm.evm.runCall({
    to,
    caller,
    origin: caller,
    gasLimit,
    skipBalance: true,
    skipNonceIncrement: true,
  })
  const result = evmResult.execResult

  if (input.trace && traceLimitHit) {
    throw new EngineError(
      `Trace exceeded max steps (${ENGINE_CEILINGS.maxTraceSteps})`,
      'trace_too_long',
    )
  }

  const response = buildResponse(result, steps, provenance)
  if (input.trace) {
    response.steps = steps
  }

  return response
}
