import { useState, useEffect } from 'react'
import type {
  UserComponent as UserComponentType,
  PrivateResolve,
  PrivateStackState,
  PrivateStackStateSetter,
  Callable,
} from './types'

export function createCallable<Props = void, Response = void, RootProps = {}>(
  UserComponent: UserComponentType<Props, Response, RootProps>,
  unmountingDelay = 0,
): Callable<Props, Response, RootProps> {
  let $setStack: PrivateStackStateSetter<Props, Response> | null = null
  let $nextKey = 0
  let $upsertPromise: Promise<Response> | null = null

  const createEnd =
    (promise: Promise<Response> | null) => (response: Response) => {
      if (!$setStack) return
      const scopedSetStack = $setStack

      scopedSetStack((prev) =>
        prev.map((call) => {
          if (promise && call.promise !== promise) return call
          call.resolve(response)
          return { ...call, ended: true }
        }),
      )

      globalThis.setTimeout(
        () =>
          scopedSetStack((prev) =>
            prev.filter((c) => promise && c.promise !== promise),
          ),
        unmountingDelay,
      )
    }

  return {
    call: (props) => {
      if (!$setStack) throw new Error('No <Root> found!')

      const key = String($nextKey++)
      let resolve: PrivateResolve<Response>
      const promise = new Promise<Response>((res) => {
        resolve = res
      })

      $setStack((prev) => [
        ...prev,
        { key, props, promise, resolve, end: createEnd(promise), ended: false },
      ])
      return promise
    },
    upsert: (props) => {
      if (!$setStack) throw new Error('No <Root> found!')

      if ($upsertPromise) {
        $setStack((prev) => {
          const existingCall = prev.find(
            (call) => call.promise === $upsertPromise && !call.ended,
          )
          if (existingCall) {
            return prev.map((call) =>
              call === existingCall ? { ...call, props } : call,
            )
          }
          return prev
        })
        return $upsertPromise
      }

      const key = String($nextKey++)
      let resolve: PrivateResolve<Response>
      const promise = new Promise<Response>((res) => {
        resolve = res
      })
      $upsertPromise = promise

      const createUpsertEnd = (response: Response) => {
        $upsertPromise = null
        createEnd(promise)(response)
      }

      $setStack((prev) => [
        ...prev,
        {
          key,
          props,
          promise,
          resolve,
          end: createUpsertEnd,
          ended: false,
          isUpsert: true,
        },
      ])
      return promise
    },
    end: (...args: [Promise<Response>, Response] | [Response]) => {
      const targeted = args.length === 2
      return createEnd(targeted ? args[0] : null)(targeted ? args[1] : args[0])
    },
    update: (
      ...args: [Promise<Response>, Partial<Props>] | [Partial<Props>]
    ) => {
      if (!$setStack) return
      const scopedSetStack = $setStack
      const targeted = args.length === 2

      scopedSetStack((prev) =>
        prev.map((call) =>
          targeted && call.promise !== args[0]
            ? call
            : {
                ...call,
                props: { ...call.props, ...(targeted ? args[1] : args[0]) },
              },
        ),
      )
    },
    Root: (rootProps: RootProps) => {
      const [stack, setStack] = useState<PrivateStackState<Props, Response>>([])

      useEffect(() => {
        if ($setStack) throw new Error('Multiple instances of <Root> found!')
        $setStack = setStack
        return () => {
          $setStack = null
          $upsertPromise = null
          $nextKey = 0
        }
      }, [])

      return stack.map(({ props, ...call }, index) => (
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
      ))
    },
  }
}
