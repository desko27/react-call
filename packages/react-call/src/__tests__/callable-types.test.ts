import type { FunctionComponent } from 'react'
import { describe, expectTypeOf, test } from 'vitest'
import { createCallable } from '../createCallable'
import type { Callable as CallableType } from '../createCallable/types.public'

// Type-level pins for the shape of what `createCallable()` returns
// (`Callable<>`) and for the generic-default behaviour of `createCallable`
// itself. Companion file to types.test.ts (which pins CallContext).
//
// Why these matter for a v2: the published .d.ts is part of the contract.
// A future refactor that accidentally adds a method to Callable, or
// widens / breaks one of the generic defaults, would silently change the
// consumer's static surface. These tests block that at compile time.

describe('Callable<> shape', () => {
  const Callable = createCallable<{ x: number }, boolean, { y: string }>(
    () => null,
  )

  test('exactly matches Callable<P, R, RP>', () => {
    expectTypeOf(Callable).toEqualTypeOf<
      CallableType<{ x: number }, boolean, { y: string }>
    >()
  })

  test('call: (props: Props) => Promise<Response>', () => {
    expectTypeOf(Callable.call).toEqualTypeOf<
      (props: { x: number }) => Promise<boolean>
    >()
  })

  test('upsert: (props: Props) => Promise<Response>', () => {
    expectTypeOf(Callable.upsert).toEqualTypeOf<
      (props: { x: number }) => Promise<boolean>
    >()
  })

  test('end accepts both targeted and untargeted forms', () => {
    // Targeted form: end(promise, response)
    expectTypeOf(Callable.end)
      .parameter(0)
      .toEqualTypeOf<Promise<boolean> | boolean>()
    // The two overloads collapse to either:
    //   [Promise<boolean>, boolean]  (targeted)
    //   [boolean]                    (untargeted)
    // Each individual call must satisfy ONE of them — type below ensures
    // the function accepts both shapes.
    Callable.end(true)
    Callable.end(Promise.resolve(true), false)
  })

  test('update accepts both targeted and untargeted forms', () => {
    Callable.update({ x: 1 })
    Callable.update(Promise.resolve(true), { x: 2 })
    expectTypeOf(Callable.update)
      .parameter(0)
      .toEqualTypeOf<Promise<boolean> | Partial<{ x: number }>>()
  })

  test('Root is a FunctionComponent of RootProps', () => {
    // ADR-0013: `Callable.Root` is a deprecated alias kept for
    // backwards compatibility. This assertion documents that the
    // deprecated property is still a typed-correctly part of the
    // public API — do not delete thinking it covers dead code.
    expectTypeOf(Callable.Root).toEqualTypeOf<
      FunctionComponent<{ y: string }>
    >()
  })
})

describe('createCallable generic defaults', () => {
  test('Props defaults to void (no props required at call site)', () => {
    const Voidish = createCallable(() => null)
    // biome-ignore lint/suspicious/noConfusingVoidType: matching the lib's actual default (`Props = void`)
    expectTypeOf(Voidish.call).toEqualTypeOf<(props: void) => Promise<void>>()
    // Compile-only check that `.call()` with no arg is valid:
    expectTypeOf(Voidish.call).toBeCallableWith()
  })

  test('Response defaults to void', () => {
    const VoidResponse = createCallable<{ x: number }>(() => null)
    expectTypeOf(VoidResponse.call).toEqualTypeOf<
      (props: { x: number }) => Promise<void>
    >()
  })

  test('RootProps defaults to {} (Root accepts empty/no props)', () => {
    const NoRootProps = createCallable<{ x: number }, boolean>(() => null)
    // Deprecated alias kept for backwards compat (ADR-0013).
    expectTypeOf(NoRootProps.Root).toEqualTypeOf<FunctionComponent<{}>>()
  })

  test('all three generics explicit produce the corresponding Callable<>', () => {
    const Explicit = createCallable<{ msg: string }, number, { name: string }>(
      () => null,
    )
    expectTypeOf(Explicit).toEqualTypeOf<
      CallableType<{ msg: string }, number, { name: string }>
    >()
  })
})
