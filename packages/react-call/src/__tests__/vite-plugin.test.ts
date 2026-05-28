import type { Plugin } from 'vite'
import { describe, expect, test } from 'vitest'
import reactCall from '../vite'
import { transformInjectDisplayNames } from '../vite/transform'

// ADR-0012: the Vite plugin walks each module Vite serves in dev mode
// and appends `<Callable>.displayName = '<Callable>';` for every
// top-level `(export)? const <Callable> = createCallable(...)`.
// The first block exercises the pure transform function in isolation;
// the second drives the plugin wrapper's hooks directly to cover the
// dev-mode activation gate and the file/id filtering.

const TSX = '/proj/src/Foo.tsx'

const CALLABLE_SRC = [
  `import { createCallable } from 'react-call'`,
  `export const Confirm = createCallable((p) => null)`,
].join('\n')

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

  // The walker only treats a very specific shape as "a Callable to name".
  // These assert it leaves every neighbouring shape untouched, which is
  // also what exercises the guard branches in the AST walk.

  test('ignores a named import from react-call that is not createCallable', () => {
    const code = [
      `import { useId } from 'react-call'`,
      `export const Confirm = useId((p) => null)`,
    ].join('\n')
    expect(transformInjectDisplayNames(code, TSX)).toBeNull()
  })

  test('skips non-const declarations (let / var)', () => {
    const code = [
      `import { createCallable } from 'react-call'`,
      `let Confirm = createCallable((p) => null)`,
    ].join('\n')
    expect(transformInjectDisplayNames(code, TSX)).toBeNull()
  })

  test('skips a const whose initializer is not a call', () => {
    const code = [
      `import { createCallable } from 'react-call'`,
      `export const NotACallable = 42`,
    ].join('\n')
    expect(transformInjectDisplayNames(code, TSX)).toBeNull()
  })

  test('skips a const calling some other function', () => {
    const code = [
      `import { createCallable } from 'react-call'`,
      `export const X = useMemo(() => null)`,
    ].join('\n')
    expect(transformInjectDisplayNames(code, TSX)).toBeNull()
  })

  test('skips a const whose callee is a member expression', () => {
    const code = [
      `import { createCallable } from 'react-call'`,
      `export const X = obj.createCallable((p) => null)`,
    ].join('\n')
    expect(transformInjectDisplayNames(code, TSX)).toBeNull()
  })

  test('skips a destructured declaration (no single name to inject)', () => {
    const code = [
      `import { createCallable } from 'react-call'`,
      `const { Confirm } = createCallable((p) => null)`,
    ].join('\n')
    expect(transformInjectDisplayNames(code, TSX)).toBeNull()
  })

  test('injects despite assignments that are not a displayName marker', () => {
    // Each trailing statement trips a different guard in the manual-
    // displayName scan, yet none of them is `Confirm.displayName = ...`,
    // so Confirm still gets named.
    const code = [
      `import { createCallable } from 'react-call'`,
      `export const Confirm = createCallable((p) => null)`,
      `let counter = 0`,
      `counter += 1`, // operator is not '='
      `counter = 5`, // left side is not a member expression
      `Confirm.foo = 1`, // member, but property is not 'displayName'
      `Confirm['displayName'] = 1`, // computed member access
      `window.location.displayName = 1`, // object is not a plain identifier
      `doSideEffect()`, // expression statement that is not an assignment
    ].join('\n')
    const out = transformInjectDisplayNames(code, TSX)
    expect(out).toContain(`Confirm.displayName = "Confirm";`)
  })
})

type TransformFn = (
  code: string,
  id: string,
) => { code: string; map: null } | null
type ConfigResolvedFn = (config: { command: string; mode: string }) => void

// Vite hooks are ObjectHook<T> = T | { handler: T }; pull out the callable.
const unwrap = (hook: unknown): unknown => {
  const fn =
    typeof hook === 'function' ? hook : (hook as { handler?: unknown })?.handler
  if (typeof fn !== 'function') throw new Error('plugin hook is not a function')
  return fn
}
const getTransform = (p: Plugin) => unwrap(p.transform) as TransformFn
const getConfigResolved = (p: Plugin) =>
  unwrap(p.configResolved) as ConfigResolvedFn

describe('react-call/vite — reactCall() plugin', () => {
  test('declares the pre-enforced plugin identity', () => {
    const plugin = reactCall()
    expect(plugin.name).toBe('react-call')
    expect(plugin.enforce).toBe('pre')
  })

  test('is inert before configResolved runs', () => {
    const plugin = reactCall()
    expect(getTransform(plugin)(CALLABLE_SRC, TSX)).toBeNull()
  })

  test('injects in serve mode and returns a null sourcemap', () => {
    const plugin = reactCall()
    getConfigResolved(plugin)({ command: 'serve', mode: 'production' })
    const out = getTransform(plugin)(CALLABLE_SRC, TSX)
    expect(out).not.toBeNull()
    expect(out?.code).toContain(`Confirm.displayName = "Confirm";`)
    expect(out?.map).toBeNull()
  })

  test('activates on development mode even when command is build', () => {
    const plugin = reactCall()
    getConfigResolved(plugin)({ command: 'build', mode: 'development' })
    expect(getTransform(plugin)(CALLABLE_SRC, TSX)).not.toBeNull()
  })

  test('stays inert for a production build', () => {
    const plugin = reactCall()
    getConfigResolved(plugin)({ command: 'build', mode: 'production' })
    expect(getTransform(plugin)(CALLABLE_SRC, TSX)).toBeNull()
  })

  test('skips modules under node_modules', () => {
    const plugin = reactCall()
    getConfigResolved(plugin)({ command: 'serve', mode: 'production' })
    const id = '/proj/node_modules/react-call/dist/main.js'
    expect(getTransform(plugin)(CALLABLE_SRC, id)).toBeNull()
  })

  test('skips unsupported file extensions', () => {
    const plugin = reactCall()
    getConfigResolved(plugin)({ command: 'serve', mode: 'production' })
    expect(
      getTransform(plugin)(CALLABLE_SRC, '/proj/src/styles.css'),
    ).toBeNull()
  })

  test('passes through null when nothing to inject', () => {
    const plugin = reactCall()
    getConfigResolved(plugin)({ command: 'serve', mode: 'production' })
    const code = `export function Foo() { return null }`
    expect(getTransform(plugin)(code, TSX)).toBeNull()
  })
})
