import { useSyncExternalStore } from 'react'
import { createStackStore } from './store'
import type { Resolve } from './types.private'
import type {
  UserComponent as UserComponentType,
  Callable,
  CallContext,
  CreateCallableOptions,
} from './types.public'

export function createCallable<Props = void, Response = void, RootProps = {}>(
  UserComponent: UserComponentType<Props, Response, RootProps>,
  unmountingDelayOrOptions?: number | CreateCallableOptions,
): Callable<Props, Response, RootProps> {
  const options: CreateCallableOptions =
    typeof unmountingDelayOrOptions === 'number'
      ? { unmountingDelay: unmountingDelayOrOptions }
      : { ...unmountingDelayOrOptions }
  const $store = createStackStore<Props, Response>(
    options.allowMultipleRootsWarning,
  )

  const createEnd =
    (promise: Promise<Response> | null) => (response: Response) => {
      $store.set(promise, (call) => {
        call.resolve(response)
        return { ...call, ended: true }
      })
      globalThis.setTimeout(
        () => $store.remove(promise),
        options.unmountingDelay || 0,
      )
    }

  return {
    call: (props) => {
      if (!$store.hasListeners()) throw new Error('No <Root> found!')

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
