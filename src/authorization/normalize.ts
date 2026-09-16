import type { EOACode7702AuthorizationListItem } from '@ethereumjs/util'

export function isAuthItem(value: unknown): value is EOACode7702AuthorizationListItem {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const record = value as Record<string, unknown>
  return (
    typeof record.chainId === 'string' &&
    typeof record.address === 'string' &&
    typeof record.nonce === 'string' &&
    typeof record.yParity === 'string' &&
    typeof record.r === 'string' &&
    typeof record.s === 'string'
  )
}

export function normalizeAuthItems(
  artifact: unknown,
): EOACode7702AuthorizationListItem[] | undefined {
  if (isAuthItem(artifact)) {
    return [artifact]
  }
  if (!Array.isArray(artifact)) {
    return undefined
  }
  if (artifact.length === 0) {
    return []
  }
  if (artifact.every(isAuthItem)) {
    return artifact
  }
  return undefined
}
