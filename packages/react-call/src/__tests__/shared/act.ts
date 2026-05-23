import { act } from '@testing-library/react'

/**
 * Wrap any library call (Confirm.call, Confirm.upsert, Confirm.end, Confirm.update)
 * that mutates the external store from outside React's flow, so the resulting
 * re-render flushes inside React's act() tracking and no "not wrapped in act"
 * warning appears on stderr.
 *
 * Returns whatever the wrapped fn returns (e.g. the promise from Confirm.call).
 */
export function withAct<T>(fn: () => T): T {
  let result!: T
  act(() => {
    result = fn()
  })
  return result
}
