import { type FunctionComponent, useSyncExternalStore } from 'react'
import { createStackStore } from './store'
import type { Resolve } from './types.private'
import type {
  UserComponent as UserComponentType,
  Callable,
  CallContext,
} from './types.public'

// HMR persistence registry (see ADR-0009, ADR-0010, ADR-0011). Keyed
// by the `displayName` the consumer assigns on the returned Callable.
// When Vite's HMR re-evaluates the consumer's module, the new
// createCallable runs first (with a fresh local store), then the
// consumer's `Confirm.displayName = 'Confirm'` setter fires
// synchronously and adopts the previously-registered store from this
// map. Callables without a displayName assignment never register —
// Fast Refresh still works, but the open dialog resets on save.
//
// Both this Map and the `displayName` setter below are gated on
// `process.env.NODE_ENV !== 'production'`. With `sideEffects: false`
// in package.json and the /* @__PURE__ */ annotation, the consumer's
// production build substitutes NODE_ENV, dead-code-eliminates the
// setter block, and then drops this unreferenced Map declaration.
const storeRegistry = /* @__PURE__ */ new Map<
  string,
  // biome-ignore lint/suspicious/noExplicitAny: registry values are heterogeneous by design
  ReturnType<typeof createStackStore<any, any>>
>()

export function createCallable<Props = void, Response = void, RootProps = {}>(
  UserComponent: UserComponentType<Props, Response, RootProps>,
  unmountingDelay = 0,
): Callable<Props, Response, RootProps> {
  const storeRef: {
    current: ReturnType<typeof createStackStore<Props, Response>>
  } = { current: createStackStore<Props, Response>() }

  const createEnd =
    (promise: Promise<Response> | null) => (response: Response) => {
      storeRef.current.set(promise, (call) => {
        call.resolve(response)
        return { ...call, ended: true }
      })
      globalThis.setTimeout(
        () => storeRef.current.remove(promise),
        unmountingDelay,
      )
    }

  const assertSingleRoot = () => {
    const listenersSize = storeRef.current.getListenersSize()
    if (!listenersSize) throw new Error('No <Root> found!')
    if (listenersSize > 1)
      throw new Error('Multiple instances of <Root> found!')
  }

  const call: Callable<Props, Response, RootProps>['call'] = (props) => {
    assertSingleRoot()

    let resolve!: Resolve<Response>
    const promise = new Promise<Response>((res) => {
      resolve = res
    })

    storeRef.current.add({
      props,
      end: createEnd(promise),
      ended: false,
      promise,
      resolve,
    })

    return promise
  }

  const upsert: Callable<Props, Response, RootProps>['upsert'] = (props) => {
    assertSingleRoot()

    const existing = storeRef.current.getUpsertPromise()
    if (existing) {
      storeRef.current.set(existing, (c) => ({ ...c, props }))
      return existing
    }

    let resolve!: Resolve<Response>
    const promise = new Promise<Response>((res) => {
      resolve = res
    })
    storeRef.current.setUpsertPromise(promise)

    storeRef.current.add({
      props,
      end: (response: Response) => {
        storeRef.current.setUpsertPromise(null)
        createEnd(promise)(response)
      },
      ended: false,
      promise,
      resolve,
    })

    return promise
  }

  const end: Callable<Props, Response, RootProps>['end'] = (
    ...args: [Promise<Response>, Response] | [Response]
  ) => {
    const targeted = args.length === 2
    const promise = targeted ? args[0] : null
    const response = targeted ? args[1] : args[0]

    if (!targeted || promise === storeRef.current.getUpsertPromise())
      storeRef.current.setUpsertPromise(null)

    return createEnd(promise)(response)
  }

  const update: Callable<Props, Response, RootProps>['update'] = (
    ...args: [Promise<Response>, Partial<Props>] | [Partial<Props>]
  ) => {
    const targeted = args.length === 2
    storeRef.current.set(targeted ? args[0] : null, (c) => ({
      ...c,
      props: { ...c.props, ...(targeted ? args[1] : args[0]) },
    }))
  }

  const Root: FunctionComponent<RootProps> = function Root(rootProps) {
    return useSyncExternalStore(
      storeRef.current.subscribe,
      storeRef.current.getSnapshot,
      storeRef.current.getServerSnapshot,
    ).map(({ props, key, end: callEnd, ended }, index, stack) => (
      <UserComponent
        {...props}
        key={key}
        call={
          {
            key,
            end: callEnd,
            ended,
            root: rootProps,
            index,
            stackSize: stack.length,
          } satisfies CallContext<Props, Response, RootProps>
        }
      />
    ))
  }

  const callable = Object.assign(Root, {
    Root,
    call,
    upsert,
    end,
    update,
  })

  // ADR-0010: the consumer's `Confirm.displayName = 'Confirm'` triggers
  // registry adoption synchronously during module evaluation, before
  // any render of <Confirm.Root />. First assignment wins; later writes
  // are ignored (renaming displayName mid-lifecycle is not supported).
  // ADR-0011: the registry is meaningful only in dev (HMR re-evaluates
  // the consumer's module); this whole block is dead code in the
  // consumer's production bundle.
  if (process.env.NODE_ENV !== 'production') {
    let displayName: string | undefined
    let registered = false
    Object.defineProperty(callable, 'displayName', {
      configurable: true,
      enumerable: true,
      get: () => displayName,
      set: (value: string | undefined) => {
        if (registered) return
        displayName = value
        if (!value) return
        registered = true
        const existing = storeRegistry.get(value)
        if (existing) {
          storeRef.current = existing as ReturnType<
            typeof createStackStore<Props, Response>
          >
        } else {
          storeRegistry.set(value, storeRef.current)
        }
      },
    })
  }

  return callable
}
