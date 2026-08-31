import { describe, expect, it } from 'vitest'

import { EIP_7951_MODULE } from '../modules/eip-7951/index.js'
import { p256ValidInputHex } from '../modules/eip-7951/input.js'
import { simulateBytecode } from '../simulate/simulateBytecode.js'
import { callPrecompileHex } from './fixtures/precompileCall.js'

describe('EIP-7951 module', () => {
  it('describes P-256 precompile without demo programs', () => {
    expect(EIP_7951_MODULE.eip).toBe(7951)
    expect(EIP_7951_MODULE.runnable).toBe(true)
    expect(EIP_7951_MODULE.changeNature).toBe('new-capability')
    expect(EIP_7951_MODULE.opcodes?.[0]?.opcodeHex).toBe('0x100')
    expect(EIP_7951_MODULE.relatedForks).toContain('osaka')
  })

  it('executes valid P-256 CALL on osaka', async () => {
    const bytecode = callPrecompileHex(0x100, p256ValidInputHex())
    const result = await simulateBytecode({
      bytecode,
      fork: { baseHardfork: 'osaka' },
    })
    expect(result.success).toBe(true)
    expect(result.returnValue.toLowerCase()).toContain(
      '0000000000000000000000000000000000000000000000000000000000000001',
    )
  })
})
