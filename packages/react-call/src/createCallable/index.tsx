import { useSyncExternalStore } from 'react'
import { createStackStore } from './store'
import type { Resolve } from './types.private'
import type {
  UserComponent as UserComponentType,
  Callable,
  CallContext,
} from './types.public'

export function createCallable<Props = void, Response = void, RootProps = {}>(
  UserComponent: UserComponentType<Props, Response, RootProps>,
  unmountingDelay = 0,
): Callable<Props, Response, RootProps> {
  let $upsertPromise: Promise<Response> | null = null
  const $store = createStackStore<Props, Response>(() => {
    $upsertPromise = null
  })

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

  return {
    call: (props) => {
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
    },
    upsert: (props) => {
      assertSingleRoot()

      if ($upsertPromise) {
        const upsertPromise = $upsertPromise
        $store.set(upsertPromise, (call) =>
          call.ended ? call : { ...call, props },
        )
        return upsertPromise
      }

      let resolve!: Resolve<Response>
      const promise = new Promise<Response>((res) => {
        resolve = res
      })
      $upsertPromise = promise

      $store.add({
        props,
        end: (response: Response) => {
          $upsertPromise = null
          createEnd(promise)(response)
        },
        ended: false,
        promise,
        resolve,
      })

      return promise
    },
    end: (...args: [Promise<Response>, Response] | [Response]) => {
      const targeted = args.length === 2
      const promise = targeted ? args[0] : null
      const response = targeted ? args[1] : args[0]

      if (!targeted || promise === $upsertPromise) $upsertPromise = null

      return createEnd(promise)(response)
    },
    update: (
      ...args: [Promise<Response>, Partial<Props>] | [Partial<Props>]
    ) => {
      const targeted = args.length === 2
      $store.set(targeted ? args[0] : null, (call) => ({
        ...call,
        props: { ...call.props, ...(targeted ? args[1] : args[0]) },
      }))
    },
    Root: (rootProps: RootProps) =>
      useSyncExternalStore(
        $store.subscribe,
        $store.getSnapshot,
        $store.getServerSnapshot,
      ).map(({ props, key, end, ended }, index, stack) => (
        <UserComponent
          {...props}
          key={key}
          call={
            {
              key,
              end,
              ended,
              root: rootProps,
              index,
              stackSize: stack.length,
            } satisfies CallContext<Props, Response, RootProps>
          }
        />
      )),
  }
}
