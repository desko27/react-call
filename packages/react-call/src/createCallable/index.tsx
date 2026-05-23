import { type FunctionComponent, useSyncExternalStore } from 'react'
import { createStackStore } from './store'
import type { Resolve } from './types.private'
import type {
  UserComponent as UserComponentType,
  Callable,
  CallContext,
} from './types.public'

// HMR persistence registry (see ADR-0009). Keyed by UserComponent name —
// when the consumer's module is re-evaluated by Vite's HMR, the second
// invocation of createCallable() with the same named component reuses
// the existing store, so active calls (open dialogs, in-flight upserts)
// survive across saves. Components with no name (inline anonymous
// arrows) get a fresh store every HMR cycle — Fast Refresh still works
// (sibling state preserved), but the open dialog resets.
//
const storeRegistry = new Map<
  string,
  // biome-ignore lint/suspicious/noExplicitAny: registry values are heterogeneous by design
  ReturnType<typeof createStackStore<any, any>>
>()

export function createCallable<Props = void, Response = void, RootProps = {}>(
  UserComponent: UserComponentType<Props, Response, RootProps>,
  unmountingDelay = 0,
): Callable<Props, Response, RootProps> {
  const hmrKey = UserComponent.displayName ?? UserComponent.name
  const $store = (() => {
    if (hmrKey) {
      const existing = storeRegistry.get(hmrKey)
      if (existing)
        return existing as ReturnType<typeof createStackStore<Props, Response>>
      const fresh = createStackStore<Props, Response>()
      storeRegistry.set(hmrKey, fresh)
      return fresh
    }
    return createStackStore<Props, Response>()
  })()

  const createEnd =
    (promise: Promise<Response> | null) => (response: Response) => {
      $store.set(promise, (call) => {
        call.resolve(response)
        return { ...call, ended: true }
      })
      globalThis.setTimeout(() => $store.remove(promise), unmountingDelay)
    }

  const assertSingleRoot = () => {
    const listenersSize = $store.getListenersSize()
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

    $store.add({
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

    const existing = $store.getUpsertPromise()
    if (existing) {
      $store.set(existing, (c) => ({ ...c, props }))
      return existing
    }

    let resolve!: Resolve<Response>
    const promise = new Promise<Response>((res) => {
      resolve = res
    })
    $store.setUpsertPromise(promise)

    $store.add({
      props,
      end: (response: Response) => {
        $store.setUpsertPromise(null)
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

    if (!targeted || promise === $store.getUpsertPromise())
      $store.setUpsertPromise(null)

    return createEnd(promise)(response)
  }

  const update: Callable<Props, Response, RootProps>['update'] = (
    ...args: [Promise<Response>, Partial<Props>] | [Partial<Props>]
  ) => {
    const targeted = args.length === 2
    $store.set(targeted ? args[0] : null, (c) => ({
      ...c,
      props: { ...c.props, ...(targeted ? args[1] : args[0]) },
    }))
  }

  const Root: FunctionComponent<RootProps> = function Root(rootProps) {
    return useSyncExternalStore(
      $store.subscribe,
      $store.getSnapshot,
      $store.getServerSnapshot,
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

  return Object.assign(Root, {
    Root,
    call,
    upsert,
    end,
    update,
  })
}
