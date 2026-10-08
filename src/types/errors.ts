import type { EngineErrorFacts } from './errorFacts.js'

export type EngineErrorOptions = {
  field?: string
  facts?: EngineErrorFacts
}

export class EngineError extends Error {
  readonly code: string
  readonly field?: string
  readonly facts?: EngineErrorFacts

  constructor(message: string, code: string, options?: EngineErrorOptions) {
    super(message)
    this.name = 'EngineError'
    this.code = code
    this.field = options?.field
    this.facts = options?.facts
  }
}
