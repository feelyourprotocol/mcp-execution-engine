/** ModExp (0x05) input layout for agent-constructed CALL bytecode. */
export const MODEXP_ADDRESS = 0x05

export const MODEXP_INPUT_LAYOUT =
  'Three 32-byte big-endian length words (base, exponent, modulus) followed by base, exponent, and modulus bodies.'

/** Minimal 3^3 mod 2 input (website simple example). */
export function modexpSimpleInputHex(): string {
  const word = '0000000000000000000000000000000000000000000000000000000000000001'
  return `${word}${word}${word}030302`
}
