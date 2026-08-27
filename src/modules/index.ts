import type { EipCapability } from '../types.js'
import { EIP_8024_MODULE } from './eip-8024/index.js'

/** Live EIP modules. Only runnable modules are registered. */
export const EIP_MODULES: EipCapability[] = [EIP_8024_MODULE]

export function listEipModules(): EipCapability[] {
  return [...EIP_MODULES]
}

export function getEipModule(eip: number): EipCapability | undefined {
  return EIP_MODULES.find((entry) => entry.eip === eip)
}
