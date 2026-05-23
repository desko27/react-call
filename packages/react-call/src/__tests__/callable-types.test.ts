import type { FunctionComponent } from 'react'
import { describe, expectTypeOf, test } from 'vitest'
import { createCallable } from '../createCallable'
import type * as ReactCall from '../types.public'

// Type-level pins for the shape of what `createCallable()` returns
// (`Callable<>`) and for the generic-default behaviour of `createCallable`
// itself. Companion file to types.test.ts (which pins CallContext).
//
// v2 generic order (ADR-0014):
//   createCallable<Props, Response, MutationPayload = void, RootProps = {}>
// Why these matter for a v2: the published .d.ts is part of the contract.
// A future refactor that accidentally adds a method to Callable, or
// widens / breaks one of the generic defaults, would silently change the
// consumer's static surface. These tests block that at compile time.

describe('Callable<> shape', () => {
  // Explicit 4 generics: <Props, Response, MutationPayload, RootProps>.
  const Callable = createCallable<
    { x: number },
    boolean,
    { id: string },
    { y: string }
  >(() => null)

  test('exactly matches ReactCall.Callable<P, R, MP, RP>', () => {
    expectTypeOf(Callable).toEqualTypeOf<
      ReactCall.Callable<{ x: number }, boolean, { id: string }, { y: string }>
    >()
  })

  test('call accepts (props) or (props, options)', () => {
    // expectTypeOf-only — no runtime invocation, no Root needed.
    expectTypeOf(Callable.call).toBeCallableWith({ x: 1 })
    expectTypeOf(Callable.call).toBeCallableWith(
      { x: 1 },
      {
        mutationFn: async (call, payload) => {
          expectTypeOf(payload).toEqualTypeOf<{ id: string }>()
          call.end(true)
        },
      },
    )
  })

  test('upsert accepts (props) or (props, options)', () => {
    expectTypeOf(Callable.upsert).toBeCallableWith({ x: 1 })
    expectTypeOf(Callable.upsert).toBeCallableWith(
      { x: 2 },
      { mutationFn: (call, _p) => call.end(false) },
    )
  })

  test('end accepts both targeted and untargeted forms', () => {
    expectTypeOf(Callable.end).toBeCallableWith(true)
    expectTypeOf(Callable.end).toBeCallableWith(Promise.resolve(true), false)
  })

  test('update accepts both targeted and untargeted forms', () => {
    expectTypeOf(Callable.update).toBeCallableWith({ x: 1 })
    expectTypeOf(Callable.update).toBeCallableWith(Promise.resolve(true), {
      x: 2,
    })
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
    // call() with no args must compile.
    expectTypeOf(Voidish.call).toBeCallableWith()
  })

  test('Response defaults to void', () => {
    const VoidResponse = createCallable<{ x: number }>(() => null)
    expectTypeOf(VoidResponse.call).toBeCallableWith({ x: 1 })
    // .end with no value works because Response is void.
    expectTypeOf(VoidResponse.end).toBeCallableWith()
  })

  test('MutationPayload defaults to void: call.mutate() needs no args', () => {
    // Type-only assertion via a fake component reference. Inside the
    // component, `call.mutate` has shape `(payload: void) => void`.
    const NoPayload = createCallable<{ x: number }, boolean>(() => null)
    expectTypeOf(NoPayload.call).toBeCallableWith({ x: 1 })
  })

  test('RootProps defaults to {} (Root accepts empty/no props)', () => {
    const NoRootProps = createCallable<{ x: number }, boolean>(() => null)
    expectTypeOf(NoRootProps.Root).toEqualTypeOf<FunctionComponent<{}>>()
  })

  test('all four generics explicit produce the corresponding Callable<>', () => {
    const Explicit = createCallable<
      { msg: string },
      number,
      { id: string },
      { name: string }
    >(() => null)
    expectTypeOf(Explicit).toEqualTypeOf<
      ReactCall.Callable<
        { msg: string },
        number,
        { id: string },
        { name: string }
      >
    >()
  })
})

describe('CallOptions ergonomic forms', () => {
  test('Props = void allows call(options) — options promotes to 1st arg', () => {
    const NoProps = createCallable<void, boolean, { id: string }>(() => null)
    expectTypeOf(NoProps.call).toBeCallableWith()
    expectTypeOf(NoProps.call).toBeCallableWith({
      mutationFn: async (call, payload) => {
        expectTypeOf(payload).toEqualTypeOf<{ id: string }>()
        call.end(true)
      },
    })
  })

  test('Props != void requires (props, options?) — options cannot replace props', () => {
    const WithProps = createCallable<{ x: number }, boolean, { id: string }>(
      () => null,
    )
    expectTypeOf(WithProps.call).toBeCallableWith({ x: 1 })
    expectTypeOf(WithProps.call).toBeCallableWith(
      { x: 1 },
      { mutationFn: async (call, _p) => call.end(true) },
    )
  })
})
