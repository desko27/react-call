import { describe, expectTypeOf, test } from 'vitest'
import type * as ReactCall from '../types.public'

// Regression guard for the CallContext leak that shipped in 1.8.x:
// `CallContext` was defined as `Omit<PrivateCallContext, 'props'>`, a
// blacklist approach that quietly let `promise`, `resolve`, and the
// internal `isUpsert?` flag through to the consumer-visible `call`
// prop. Dev rebuilt `CallContext` on top of a `CallItemPublicProperties`
// allowlist plus root/index/stackSize — these tests pin that contract
// so a future refactor cannot accidentally re-leak the internals
// through type widening.
//
// v2 also adds `pending` and `mutate` (ADR-0014) — those are
// asserted as required public properties below.

// Generic order is <Props, Response, MutationPayload, RootProps>
// (ADR-0014 reorder: RootProps moved from 3rd to 4th).
type Ctx = ReactCall.Context<
  { message: string },
  boolean,
  { id: string },
  { userName: string }
>

// vitest 4 / expect-type requires a runtime value argument; the cast is
// a placeholder — expectTypeOf only inspects the static type.
const ctx = {} as Ctx

describe('CallContext public contract', () => {
  test('exposes the documented public fields with the right types', () => {
    expectTypeOf(ctx.key).toEqualTypeOf<string>()
    expectTypeOf(ctx.end).toEqualTypeOf<(response: boolean) => void>()
    expectTypeOf(ctx.ended).toEqualTypeOf<boolean>()
    expectTypeOf(ctx.root).toEqualTypeOf<{ userName: string }>()
    expectTypeOf(ctx.index).toEqualTypeOf<number>()
    expectTypeOf(ctx.stackSize).toEqualTypeOf<number>()
  })

  test('exposes the v2 mutation primitive fields', () => {
    expectTypeOf(ctx.pending).toEqualTypeOf<boolean>()
    expectTypeOf(ctx.mutate).toEqualTypeOf<(payload: { id: string }) => void>()
  })

  test('does not leak the Promise lifecycle internals', () => {
    expectTypeOf(ctx).not.toHaveProperty('promise')
    expectTypeOf(ctx).not.toHaveProperty('resolve')
  })

  test('does not leak the upsert internal flag', () => {
    expectTypeOf(ctx).not.toHaveProperty('isUpsert')
  })

  test('does not leak the stored mutationFn', () => {
    // mutationFn is part of the call item but must not surface in the
    // public CallContext — consumer components are the modal, not the
    // caller, and the modal does not need to invoke or even see the fn.
    expectTypeOf(ctx).not.toHaveProperty('mutationFn')
  })

  test('does not leak the original call props', () => {
    expectTypeOf(ctx).not.toHaveProperty('props')
  })
})

describe('MutationContext public contract', () => {
  type Mctx = ReactCall.MutationContext<boolean>
  const mctx = {} as Mctx

  test('exposes only `end` — pending/ended deliberately excluded', () => {
    expectTypeOf(mctx.end).toEqualTypeOf<(response: boolean) => void>()
    expectTypeOf(mctx).not.toHaveProperty('pending')
    expectTypeOf(mctx).not.toHaveProperty('ended')
  })
})

describe('CallOptions public contract', () => {
  type Opts = ReactCall.CallOptions<{ id: string }, boolean>
  const opts = {} as Opts

  test('mutationFn is optional and typed with the (call, payload) signature', () => {
    expectTypeOf(opts.mutationFn).toEqualTypeOf<
      | ((
          call: ReactCall.MutationContext<boolean>,
          payload: { id: string },
        ) => Promise<void> | void)
      | undefined
    >()
  })
})
