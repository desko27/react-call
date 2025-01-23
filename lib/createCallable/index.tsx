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

  const createEnd = (promise: Promise<Response>) => (response: Response) => {
    if (!$setStack) return
    const scopedSetStack = $setStack

    scopedSetStack((prev) =>
      prev.map((call) => {
        if (call.promise !== promise) return call
        call.resolve(response)
        return { ...call, ended: true }
      }),
    )

    globalThis.setTimeout(
      () => scopedSetStack((prev) => prev.filter((c) => c.promise !== promise)),
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
    end: (promise, response) => createEnd(promise)(response),
    update: (promise, props) => {
      if (!$setStack) return
      const scopedSetStack = $setStack

      scopedSetStack((prev) =>
        prev.map((c) => (c.promise !== promise ? c : { ...c, props })),
      )
    },
    Root: (rootProps: RootProps) => {
      const [stack, setStack] = useState<PrivateStackState<Props, Response>>([])

      useEffect(() => {
        if ($setStack) throw new Error('Multiple instances of <Root> found!')
        $setStack = setStack
        return () => {
          $setStack = null
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
