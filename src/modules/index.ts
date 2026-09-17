import type { EipCapability } from '../types/index.js'
import { EIP_7708_MODULE } from './eip-7708/index.js'
import { EIP_7843_MODULE } from './eip-7843/index.js'
import { EIP_7883_MODULE } from './eip-7883/index.js'
import { EIP_7928_MODULE } from './eip-7928/index.js'
import { EIP_7951_MODULE } from './eip-7951/index.js'
import { EIP_7954_MODULE } from './eip-7954/index.js'
import { EIP_8024_MODULE } from './eip-8024/index.js'
import { EIP_8037_MODULE } from './eip-8037/index.js'
import { EIP_8038_MODULE } from './eip-8038/index.js'

/** Live EIP modules. Only runnable modules are registered. */
export const EIP_MODULES: EipCapability[] = [
  EIP_8024_MODULE,
  EIP_7843_MODULE,
  EIP_7928_MODULE,
  EIP_7708_MODULE,
  EIP_7883_MODULE,
  EIP_7951_MODULE,
  EIP_7954_MODULE,
  EIP_8037_MODULE,
  EIP_8038_MODULE,
]

export function listEipModules(): EipCapability[] {
  return [...EIP_MODULES]
}

export function getEipModule(eip: number): EipCapability | undefined {
  return EIP_MODULES.find((entry) => entry?.eip === eip)
}
