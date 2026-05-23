import { describe, expect, test } from 'vitest'
import { transformInjectDisplayNames } from '../vite/transform'

// ADR-0012: the Vite plugin walks each module Vite serves in dev mode
// and appends `<Callable>.displayName = '<Callable>';` for every
// top-level `(export)? const <Callable> = createCallable(...)`.
// These tests exercise the pure transform function in isolation —
// the Vite plugin wrapper just gates it on dev mode and file
// extension.

const TSX = '/proj/src/Foo.tsx'

describe('react-call/vite — transformInjectDisplayNames', () => {
  test('injects for export const X = createCallable(...)', () => {
    const code = [
      `import { createCallable } from 'react-call'`,
      `export const Confirm = createCallable((props) => null)`,
    ].join('\n')
    const out = transformInjectDisplayNames(code, TSX)
    expect(out).not.toBeNull()
    expect(out).toContain(`Confirm.displayName = "Confirm";`)
  })

  test('injects for plain const (no export)', () => {
    const code = [
      `import { createCallable } from 'react-call'`,
      `const Confirm = createCallable((props) => null)`,
    ].join('\n')
    const out = transformInjectDisplayNames(code, TSX)
    expect(out).toContain(`Confirm.displayName = "Confirm";`)
  })

  test('handles TS generic call', () => {
    const code = [
      `import { createCallable } from 'react-call'`,
      `export const Confirm = createCallable<{message: string}, boolean>((p) => null)`,
    ].join('\n')
    const out = transformInjectDisplayNames(code, TSX)
    expect(out).toContain(`Confirm.displayName = "Confirm";`)
  })

  test('handles renamed import', () => {
    const code = [
      `import { createCallable as cc } from 'react-call'`,
      `export const Confirm = cc((p) => null)`,
    ].join('\n')
    const out = transformInjectDisplayNames(code, TSX)
    expect(out).toContain(`Confirm.displayName = "Confirm";`)
  })

  test('handles multiple callables in one file', () => {
    const code = [
      `import { createCallable } from 'react-call'`,
      `export const A = createCallable(() => null)`,
      `export const B = createCallable(() => null)`,
    ].join('\n')
    const out = transformInjectDisplayNames(code, TSX)
    expect(out).toContain(`A.displayName = "A";`)
    expect(out).toContain(`B.displayName = "B";`)
  })

  test('skips when manual displayName exists on the same callable', () => {
    const code = [
      `import { createCallable } from 'react-call'`,
      `export const Confirm = createCallable((p) => null)`,
      `Confirm.displayName = 'CustomName'`,
    ].join('\n')
    const out = transformInjectDisplayNames(code, TSX)
    if (out !== null) {
      expect(out).not.toMatch(/Confirm\.displayName = "Confirm"/)
    }
  })

  test('skips only the one with manual displayName, injects the rest', () => {
    const code = [
      `import { createCallable } from 'react-call'`,
      `export const A = createCallable(() => null)`,
      `export const B = createCallable(() => null)`,
      `B.displayName = 'CustomB'`,
    ].join('\n')
    const out = transformInjectDisplayNames(code, TSX)
    expect(out).toContain(`A.displayName = "A";`)
    expect(out).not.toMatch(/B\.displayName = "B"/)
  })

  test('skips default export (no name to inject)', () => {
    const code = [
      `import { createCallable } from 'react-call'`,
      `export default createCallable((p) => null)`,
    ].join('\n')
    const out = transformInjectDisplayNames(code, TSX)
    expect(out).toBeNull()
  })

  test('skips namespace import', () => {
    const code = [
      `import * as RC from 'react-call'`,
      `export const Confirm = RC.createCallable((p) => null)`,
    ].join('\n')
    const out = transformInjectDisplayNames(code, TSX)
    expect(out).toBeNull()
  })

  test('skips import from a different package', () => {
    const code = [
      `import { createCallable } from './my-utils'`,
      `export const Confirm = createCallable((p) => null)`,
    ].join('\n')
    const out = transformInjectDisplayNames(code, TSX)
    expect(out).toBeNull()
  })

  test('skips when createCallable is called inside a function body, not at module scope', () => {
    const code = [
      `import { createCallable } from 'react-call'`,
      `export function makeDialog() { return createCallable((p) => null) }`,
    ].join('\n')
    const out = transformInjectDisplayNames(code, TSX)
    expect(out).toBeNull()
  })

  test('returns null when no createCallable token appears at all', () => {
    const code = [
      `import { useState } from 'react'`,
      `export function Foo() { return null }`,
    ].join('\n')
    const out = transformInjectDisplayNames(code, TSX)
    expect(out).toBeNull()
  })

  test('does not double-inject on repeated transform calls', () => {
    const code = [
      `import { createCallable } from 'react-call'`,
      `export const Confirm = createCallable((p) => null)`,
    ].join('\n')
    const once = transformInjectDisplayNames(code, TSX)
    expect(once).not.toBeNull()
    const twice = transformInjectDisplayNames(once as string, TSX)
    // After first inject, the appended line counts as a manual
    // displayName for the second pass — so the second pass skips.
    expect(twice).toBeNull()
  })
})
