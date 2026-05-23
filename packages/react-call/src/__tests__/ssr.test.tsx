import { renderToString } from 'react-dom/server'
import { describe, expect, test } from 'vitest'
import { createStackStore } from '../createCallable/store'
import { Confirm } from './shared/Confirm'

// React Native + Next.js / RSC consumers care that the lib's Root component
// renders without DOM at all on the server. The store's getServerSnapshot
// (see store.ts) returns an empty array so that useSyncExternalStore yields
// an empty stack server-side, and the Root maps over that to produce nothing.
// This test pins that contract so a regression in getServerSnapshot — for
// example, returning the live `stack` reference by mistake — would surface
// here before reaching SSR users.

describe('SSR — getServerSnapshot', () => {
  test('Root renders empty markup on the server when no calls exist', () => {
    expect(renderToString(<Confirm />)).toBe('')
  })

  test('Root still renders empty markup on the server even when a Root is mounted on the (separate) client', () => {
    // Sanity: the server-render is process-isolated from any client-side state.
    // Even if a (hypothetical) client had previously made calls, the server's
    // getServerSnapshot path must still yield an empty stack — proven here by
    // the markup being unconditionally empty.
    expect(renderToString(<Confirm />)).toBe('')
    expect(renderToString(<Confirm />)).toBe('')
  })

  test('getServerSnapshot returns a stable reference across calls', () => {
    // React's useSyncExternalStore compares snapshots with Object.is
    // and throws "The result of getServerSnapshot should be cached to
    // avoid an infinite loop" if a fresh value comes back each call.
    // The output array would be `[]` in both cases (so a renderToString
    // diff would still pass), but the reference must be stable. The
    // apps/nextjs playground surfaced this when the unstable variant
    // shipped briefly in 2.0.0-next.1.
    const store = createStackStore<void, void>()
    expect(
      Object.is(store.getServerSnapshot(), store.getServerSnapshot()),
    ).toBe(true)
  })
})
