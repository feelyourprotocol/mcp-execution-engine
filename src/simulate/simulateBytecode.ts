import { createEVM, type ExecResult, type InterpreterStep } from '@ethereumjs/evm'
import { bytesToHex, createAccount } from '@ethereumjs/util'

import { ENGINE_CEILINGS, ENGINE_VERSION } from '../forks/registry.js'
import {
  parseAddress,
  parseBytecodeHex,
  parseGasLimit,
  parseOptionalHexData,
  parseWeiValue,
  prefundCallerAccount,
  resolveFork,
} from '../forks/resolve.js'
import { buildProvenance } from '../provenance/build.js'
import type { SimulateBytecodeInput, SimulateBytecodeResult, StepTrace } from '../types.js'
import { EngineError } from '../types.js'
import { mapExecLogs } from './logs.js'
import { stepToTrace } from './trace.js'

function hasBytecode(input: SimulateBytecodeInput): boolean {
  return input.bytecode !== undefined && input.bytecode.trim() !== ''
}

function hasMessageCall(input: SimulateBytecodeInput): boolean {
  return input.messageCall !== undefined
}

function validateInputMode(input: SimulateBytecodeInput): void {
  const bytecode = hasBytecode(input)
  const messageCall = hasMessageCall(input)
  if (!bytecode && !messageCall) {
    throw new EngineError('Provide bytecode or messageCall', 'invalid_input')
  }
  if (bytecode && messageCall) {
    throw new EngineError('Provide bytecode or messageCall, not both', 'invalid_input')
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
    returnValue: bytesToHex(result.returnValue),
    finalStack: buildFinalStack(steps, result),
    error: result.exceptionError?.error ?? null,
    provenance,
  }

  if (logs.length > 0) {
    response.logs = logs
    response.decodedLogs = decodedLogs
  }

  return response
}

async function applyPreflightAccounts(
  evm: Awaited<ReturnType<typeof createEVM>>,
  accounts: SimulateBytecodeInput['accounts'],
): Promise<void> {
  if (!accounts?.length) return

  for (const entry of accounts) {
    const address = parseAddress(entry.address)
    const balance = parseWeiValue(entry.balance ?? '1000000000000000000')
    await evm.stateManager.putAccount(address, createAccount({ nonce: 0n, balance }))
    if (entry.code !== undefined && entry.code.trim() !== '') {
      await evm.stateManager.putCode(address, parseBytecodeHex(entry.code))
    }
  }
}

export async function simulateBytecode(
  input: SimulateBytecodeInput,
): Promise<SimulateBytecodeResult> {
  validateInputMode(input)

  const gasLimit = parseGasLimit(input.gasLimit)
  const { config, common } = resolveFork(input.fork)
  const provenance = buildProvenance(ENGINE_VERSION, config)

  const evm = await createEVM({ common })
  await applyPreflightAccounts(evm, input.accounts)
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

  let result: ExecResult

  if (input.messageCall) {
    const caller = parseAddress(input.messageCall.caller)
    const to = parseAddress(input.messageCall.to)
    const value = parseWeiValue(input.messageCall.value)
    const data = parseOptionalHexData(input.messageCall.data)

    await prefundCallerAccount(evm.stateManager, caller, value)

    if (input.messageCall.code !== undefined && input.messageCall.code.trim() !== '') {
      const code = parseBytecodeHex(input.messageCall.code)
      await evm.stateManager.putAccount(to, createAccount({ nonce: 0n, balance: BigInt(1e18) }))
      await evm.stateManager.putCode(to, code)
    }

    const callResult = await evm.runCall({
      caller,
      to,
      value,
      data,
      gasLimit,
    })
    result = callResult.execResult
  } else {
    const code = parseBytecodeHex(input.bytecode!)
    result = await evm.runCode({ code, gasLimit })
  }

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
