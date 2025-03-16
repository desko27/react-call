import { useSyncExternalStore } from 'react'
import type {
  UserComponent as UserComponentType,
  // PrivateResolve,
  // PrivateStackStateSetter,
  Callable,
} from './types'

import { createCallStackStore } from './store'

export function createCallable<Props = void, Response = void, RootProps = {}>(
  UserComponent: UserComponentType<Props, Response, RootProps>,
  unmountingDelay = 0,
): Callable<Props, Response, RootProps> {
  const $store = createCallStackStore<Props, Response>()

  const createEnd =
    (promise: Promise<Response> | null) => (response: Response) => {
      $store.set(promise, (call) => {
        call.resolve(response)
        return { ...call, ended: true }
      })
      globalThis.setTimeout(() => $store.remove(promise), unmountingDelay)
    }

  return {
    call: (props) => {
      if (!$store.hasListeners()) throw new Error('No <Root> found!')

      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      let resolve: any // PrivateResolve<Response>
      const promise = new Promise<Response>((res) => {
        resolve = res
      })

      $store.add({
        props,
        promise,
        resolve,
        end: createEnd(promise),
        ended: false,
      })
      return promise
    },
    end: (...args: [Promise<Response>, Response] | [Response]) => {
      const targeted = args.length === 2
      return createEnd(targeted ? args[0] : null)(targeted ? args[1] : args[0])
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
      useSyncExternalStore($store.subscribe, $store.getSnapshot).map(
        ({ props, ...call }, index, stack) => (
          <UserComponent
            {...props}
            key={call.key}
            call={{
              ...call,
              root: rootProps,
              index,
              stackSize: stack.length,
            }}
          />
        ),
      ),
  }
}
