/** Test-only CALL bytecode builders — not part of the MCP catalog. */

function pushValue(bytes: number[], value: number): void {
  if (value <= 0xff) {
    bytes.push(0x60, value)
    return
  }
  if (value <= 0xffff) {
    bytes.push(0x61, (value >> 8) & 0xff, value & 0xff)
    return
  }
  throw new Error(`pushValue: ${value} too large for test fixture`)
}

function buildCallSection(precompileAddress: number, inSize: number): number[] {
  const section: number[] = []
  pushValue(section, 32)
  section.push(0x60, 0x00)
  pushValue(section, inSize)
  section.push(0x60, 0x00)
  section.push(0x60, 0x00)
  if (precompileAddress <= 0xff) {
    section.push(0x60, precompileAddress)
  } else {
    section.push(0x61, (precompileAddress >> 8) & 0xff, precompileAddress & 0xff)
  }
  section.push(0x5a, 0xf1)
  pushValue(section, 32)
  section.push(0x60, 0x00, 0xf3)
  return section
}

function buildCodeCopySection(inSize: number, codeOffset: number): number[] {
  const section: number[] = []
  pushValue(section, inSize)
  pushValue(section, codeOffset)
  section.push(0x60, 0x00, 0x39)
  return section
}

/** Build bytecode that CALLs a precompile with trailing input data. */
export function callPrecompileHex(precompileAddress: number, inputHex: string): string {
  const input = Buffer.from(inputHex.replace(/^0x/, ''), 'hex')
  const inSize = input.length
  const callSection = buildCallSection(precompileAddress, inSize)

  let codeOffset = buildCodeCopySection(inSize, 0).length + callSection.length
  let codeCopySection = buildCodeCopySection(inSize, codeOffset)
  let totalPrefix = codeCopySection.length + callSection.length
  if (totalPrefix !== codeOffset) {
    codeOffset = totalPrefix
    codeCopySection = buildCodeCopySection(inSize, codeOffset)
    totalPrefix = codeCopySection.length + callSection.length
  }

  const code = Buffer.concat([Buffer.from([...codeCopySection, ...callSection]), input])
  return `0x${code.toString('hex')}`
}
