import { type FunctionComponent, useSyncExternalStore } from 'react'
import { createStackStore } from './store'
import type { Resolve } from './types.private'
import type {
  CallContext,
  Callable,
  CallOptions,
  MutationContext,
  MutationFunction,
  UserComponent as UserComponentType,
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
  ReturnType<typeof createStackStore<any, any, any>>
>()

// Runtime discriminator for the optional `CallOptions` slot in `call()`
// / `upsert()`. The conditional tuple in the public types makes
// `Confirm.call({ mutationFn })` valid when `Props = void`, but at
// runtime we can't see whether Props is void — so we peel the LAST
// arg as options if it carries the reserved `mutationFn` key.
// Consumers are documented not to use `mutationFn` as a key in their
// own Props (it's reserved for the options bag).
const isOptionsLike = (x: unknown): boolean =>
  x !== null && typeof x === 'object' && 'mutationFn' in (x as object)

export function createCallable<
  Props = void,
  Response = void,
  MutationPayload = void,
  RootProps = {},
>(
  UserComponent: UserComponentType<Props, Response, MutationPayload, RootProps>,
  unmountingDelay = 0,
): Callable<Props, Response, MutationPayload, RootProps> {
  const storeRef: {
    current: ReturnType<
      typeof createStackStore<Props, Response, MutationPayload>
    >
  } = { current: createStackStore<Props, Response, MutationPayload>() }

  const splitArgs = (
    args: unknown[],
  ): {
    props: Props | undefined
    options: CallOptions<MutationPayload, Response> | undefined
  } => {
    const lastArg = args[args.length - 1]
    if (args.length > 0 && isOptionsLike(lastArg)) {
      const options = lastArg as CallOptions<MutationPayload, Response>
      return args.length === 1
        ? { props: undefined, options }
        : { props: args[0] as Props, options }
    }
    return { props: args[0] as Props, options: undefined }
  }

  const createEnd =
    (promise: Promise<Response> | null) => (response: Response) => {
      storeRef.current.set(promise, (call) => {
        call.resolve(response)
        return { ...call, ended: true, pending: false }
      })
      globalThis.setTimeout(
        () => storeRef.current.remove(promise),
        unmountingDelay,
      )
    }

  const createMutate =
    (promise: Promise<Response>) =>
    (payload: MutationPayload): void => {
      let alreadyPending = false
      let alreadyEnded = false
      let storedMutationFn:
        | MutationFunction<MutationPayload, Response>
        | undefined

      // Atomic read-and-conditionally-set: peek pending/ended/mutationFn
      // and flip pending to true in one pass through the stack mapper.
      storeRef.current.set(promise, (c) => {
        alreadyPending = c.pending
        alreadyEnded = c.ended
        storedMutationFn = c.mutationFn
        if (c.pending || c.ended || !c.mutationFn) return c
        return { ...c, pending: true }
      })

      if (alreadyEnded) return // silent bail — call already closed

      if (!storedMutationFn) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            'react-call:call.mutate() invoked but no mutationFn was provided in CallOptions. No-op.',
          )
        }
        return
      }

      if (alreadyPending) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            'react-call:call.mutate() invoked while a mutation is already pending for this call. No-op.',
          )
        }
        return
      }

      // Capture the narrowed value into a const so the closure can
      // call it without a non-null assertion — the early-return guard
      // above proved storedMutationFn is defined.
      const fn = storedMutationFn
      const mutationContext: MutationContext<Response> = {
        end: createEnd(promise),
      }

      Promise.resolve()
        .then(() => fn(mutationContext, payload))
        .catch(() => {
          // Swallow — the caller's own try/catch inside mutationFn handles
          // UI side-effects (toasts, alerts, etc.). The dialog stays open
          // unless `call.end()` was invoked inside the mutationFn.
        })
        .finally(() => {
          // Reset pending only if the call hasn't ended in the meantime.
          // (If `call.end()` was called inside mutationFn, ended=true and
          // pending was already reset by createEnd.)
          storeRef.current.set(promise, (c) =>
            c.ended ? c : { ...c, pending: false },
          )
        })
    }

  const assertSingleRoot = () => {
    const listenersSize = storeRef.current.getListenersSize()
    if (!listenersSize) throw new Error('No <Root> found!')
    if (listenersSize > 1)
      throw new Error('Multiple instances of <Root> found!')
  }

  const call = ((...args: unknown[]) => {
    assertSingleRoot()
    const { props, options } = splitArgs(args)

    let resolve!: Resolve<Response>
    const promise = new Promise<Response>((res) => {
      resolve = res
    })

    storeRef.current.add({
      props: props as Props,
      end: createEnd(promise),
      ended: false,
      pending: false,
      mutate: createMutate(promise),
      mutationFn: options?.mutationFn,
      promise,
      resolve,
    })

    return promise
  }) as Callable<Props, Response, MutationPayload, RootProps>['call']

  const upsert = ((...args: unknown[]) => {
    assertSingleRoot()
    const { props, options } = splitArgs(args)

    const existing = storeRef.current.getUpsertPromise()
    if (existing) {
      storeRef.current.set(existing, (c) => ({
        ...c,
        props: props as Props,
        // Preserve previous mutationFn when this upsert call didn't
        // supply options; explicitly override (even with undefined)
        // when it did.
        mutationFn: options ? options.mutationFn : c.mutationFn,
      }))
      return existing
    }

    let resolve!: Resolve<Response>
    const promise = new Promise<Response>((res) => {
      resolve = res
    })
    storeRef.current.setUpsertPromise(promise)

    storeRef.current.add({
      props: props as Props,
      end: (response: Response) => {
        storeRef.current.setUpsertPromise(null)
        createEnd(promise)(response)
      },
      ended: false,
      pending: false,
      mutate: createMutate(promise),
      mutationFn: options?.mutationFn,
      promise,
      resolve,
    })

    return promise
  }) as Callable<Props, Response, MutationPayload, RootProps>['upsert']

  const end: Callable<Props, Response, MutationPayload, RootProps>['end'] = (
    ...args: [Promise<Response>, Response] | [Response]
  ) => {
    const targeted = args.length === 2
    const promise = targeted ? args[0] : null
    const response = targeted ? args[1] : args[0]

    if (!targeted || promise === storeRef.current.getUpsertPromise())
      storeRef.current.setUpsertPromise(null)

    return createEnd(promise)(response)
  }

  const update: Callable<
    Props,
    Response,
    MutationPayload,
    RootProps
  >['update'] = (
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
    ).map(
      ({ props, key, end: callEnd, ended, pending, mutate }, index, stack) => (
        <UserComponent
          {...props}
          key={key}
          call={
            {
              key,
              end: callEnd,
              ended,
              pending,
              mutate,
              root: rootProps,
              index,
              stackSize: stack.length,
            } satisfies CallContext<Props, Response, MutationPayload, RootProps>
          }
        />
      ),
    )
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
  // any render of <Confirm />. First assignment wins; later writes
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
            typeof createStackStore<Props, Response, MutationPayload>
          >
        } else {
          storeRegistry.set(value, storeRef.current)
        }
      },
    })
  }

  return callable
}
