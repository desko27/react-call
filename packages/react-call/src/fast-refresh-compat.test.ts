import { describe, expect, it } from 'vitest'

// Load the BUILT dist on purpose: this property only holds for the
// published, minified artifact, never the source. The repo's playgrounds
// alias react-call to src (ADR-0005), where the component function keeps
// its uppercase `Root` name, so a source-level test cannot catch the
// regression this guards (ADR-0022, issue #110).
//
// The dist only exists under `test:dist` (after `pnpm build`), not during
// `tsc` type-check, so we import it through a runtime specifier TS won't
// statically resolve (a non-literal `string`), typed against the source
// barrel. This file stays type-checked without depending on the build.
const DIST_ENTRY: string = '../dist/main.js'
const { createCallable }: typeof import('./main') = await import(DIST_ENTRY)

// React Fast Refresh decides whether a module export is a component via
// react-refresh's `isLikelyComponentType`. For functions it gates on
// `/^[A-Z]/.test(type.name || type.displayName)`. Verbatim copy of the
// `function` branch from @vitejs/plugin-react's refresh-runtime.js
// (byte-identical across plugin-react 4.x/Vite 6 and 6.x/Vite 8).
//
// The bug (issue #110): the bundler minifies createCallable's `Root`
// function name to a lowercase identifier (e.g. `p`) in the published
// dist, so `type.name` is lowercase and the regex fails — and because
// `type.name` is truthy it shadows `displayName` before it is ever read,
// which is why setting displayName (manually or via react-call/vite) does
// not help. The fix forces an uppercase `.name` on the returned Callable.
function isLikelyComponentTypeFunctionBranch(type: unknown): boolean {
  if (typeof type !== 'function') return false
  const fn = type as { prototype?: object; name?: string; displayName?: string }
  if (fn.prototype != null) {
    const proto = fn.prototype as { isReactComponent?: unknown }
    if (proto.isReactComponent) return true
    const ownNames = Object.getOwnPropertyNames(fn.prototype)
    if (ownNames.length > 1 || ownNames[0] !== 'constructor') return false
    if (Object.getPrototypeOf(fn.prototype) !== Object.prototype) return false
  }
  const name = fn.name || fn.displayName
  return typeof name === 'string' && /^[A-Z]/.test(name)
}

describe('Fast Refresh compatibility of the built dist — issue #110', () => {
  it('a Callable with no displayName is accepted as a component type', () => {
    const Confirm = createCallable<{ message: string }, boolean>(() => null)
    expect(Confirm.name).toMatch(/^[A-Z]/)
    expect(isLikelyComponentTypeFunctionBranch(Confirm)).toBe(true)
  })

  it('a Callable stays accepted after a displayName is assigned', () => {
    const Confirm = createCallable<{ message: string }, boolean>(() => null)
    Confirm.displayName = 'Confirm'
    expect(isLikelyComponentTypeFunctionBranch(Confirm)).toBe(true)
  })
})
