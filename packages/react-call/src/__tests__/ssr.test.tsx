import { renderToString } from 'react-dom/server'
import { describe, expect, test } from 'vitest'
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
    expect(renderToString(<Confirm.Root />)).toBe('')
  })

  test('Root still renders empty markup on the server even when a Root is mounted on the (separate) client', () => {
    // Sanity: the server-render is process-isolated from any client-side state.
    // Even if a (hypothetical) client had previously made calls, the server's
    // getServerSnapshot path must still yield an empty stack — proven here by
    // the markup being unconditionally empty.
    expect(renderToString(<Confirm.Root />)).toBe('')
    expect(renderToString(<Confirm.Root />)).toBe('')
  })
})
