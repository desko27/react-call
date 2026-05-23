import { describe, expectTypeOf, test } from 'vitest'
import type * as ReactCall from '../types.public'

// Regression guard for the CallContext leak that shipped in 1.8.x:
// `CallContext` was defined as `Omit<PrivateCallContext, 'props'>`, a
// blacklist approach that quietly let `promise`, `resolve`, and the
// internal `isUpsert?` flag through to the consumer-visible `call`
// prop. Dev rebuilt `CallContext` on top of a `CallItemPublicProperties`
// allowlist (key, end, ended) plus root/index/stackSize — these tests
// pin that contract so a future refactor cannot accidentally re-leak
// the internals through type widening.

type Ctx = ReactCall.Context<{ message: string }, boolean, { userName: string }>

// vitest 4 / expect-type requires a runtime value argument; the cast is
// a placeholder — expectTypeOf only inspects the static type. An empty
// object literal is enough at runtime since the property accesses below
// (ctx.key, ctx.end, …) are typeof-only inside expectTypeOf's overloads.
const ctx = {} as Ctx

describe('CallContext public contract', () => {
  test('exposes the six documented public fields with the right types', () => {
    expectTypeOf(ctx.key).toEqualTypeOf<string>()
    expectTypeOf(ctx.end).toEqualTypeOf<(response: boolean) => void>()
    expectTypeOf(ctx.ended).toEqualTypeOf<boolean>()
    expectTypeOf(ctx.root).toEqualTypeOf<{ userName: string }>()
    expectTypeOf(ctx.index).toEqualTypeOf<number>()
    expectTypeOf(ctx.stackSize).toEqualTypeOf<number>()
  })

  test('does not leak the Promise lifecycle internals', () => {
    expectTypeOf(ctx).not.toHaveProperty('promise')
    expectTypeOf(ctx).not.toHaveProperty('resolve')
  })

  test('does not leak the upsert internal flag', () => {
    expectTypeOf(ctx).not.toHaveProperty('isUpsert')
  })

  test('does not leak the original call props', () => {
    // `props` is the user's input that the lib uses to drive the render;
    // the consumer's component receives them as actual JSX props, not
    // re-bundled inside `call`.
    expectTypeOf(ctx).not.toHaveProperty('props')
  })
})
