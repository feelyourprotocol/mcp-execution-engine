import { describe, expect, it } from 'vitest'

import { EIP_7883_MODULE } from '../modules/eip-7883/index.js'
import { modexpSimpleInputHex } from '../modules/eip-7883/input.js'
import { simulateBytecode } from '../simulate/simulateBytecode.js'
import { callPrecompileHex } from './fixtures/precompileCall.js'

describe('EIP-7883 module', () => {
  it('describes ModExp repricing without demo programs', () => {
    expect(EIP_7883_MODULE.eip).toBe(7883)
    expect(EIP_7883_MODULE.runnable).toBe(true)
    expect(EIP_7883_MODULE.changeNature).toBe('repricing')
    expect(EIP_7883_MODULE.comparison).toBeUndefined()
    expect(EIP_7883_MODULE.opcodes?.[0]?.opcodeHex).toBe('0x05')
  })

  it('executes ModExp CALL on osaka and prague with different gas', async () => {
    const bytecode = callPrecompileHex(0x05, modexpSimpleInputHex())
    const prague = await simulateBytecode({
      bytecode,
      fork: { baseHardfork: 'pectra' },
    })
    const osaka = await simulateBytecode({
      bytecode,
      fork: { baseHardfork: 'fusaka' },
    })
    expect(prague.success).toBe(true)
    expect(osaka.success).toBe(true)
    expect(BigInt(prague.gasUsed)).not.toBe(BigInt(osaka.gasUsed))
  })
})
