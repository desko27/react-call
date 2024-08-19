import { useState, useEffect } from 'react'
import type {
  UserComponent as UserComponentType,
  PrivateStackState,
  PrivateStackStateSetter,
  Callable,
} from './types'

export function createCallable<Props = void, Response = void, RootProps = {}>(
  UserComponent: UserComponentType<Props, Response, RootProps>,
  endingDelay = 0,
): Callable<Props, Response, RootProps> {
  let $setStack: PrivateStackStateSetter<Props, Response> | null = null
  let $nextKey = 0

  return {
    call: (props) => {
      if ($setStack === null) throw new Error('No <Root> found!')

      const key = String($nextKey++)
      const promise = Promise.withResolvers<Response>()

      const end = (response: Response) => {
        promise.resolve(response)
        $setStack?.((prev) =>
          prev.map((c) => (c.key !== key ? c : { ...c, ending: true })),
        )
        globalThis.setTimeout(
          () => $setStack?.((prev) => prev.filter((c) => c.key !== key)),
          endingDelay,
        )
      }

      $setStack((prev) => [...prev, { key, props, end, ending: false }])
      return promise.promise
    },
    Root: (rootProps: RootProps) => {
      const [stack, setStack] = useState<PrivateStackState<Props, Response>>([])

      useEffect(() => {
        if ($setStack !== null)
          throw new Error('Multiple instances of <Root> found!')
        $setStack = setStack
        return () => {
          $setStack = null
          $nextKey = 0
        }
      }, [])

      return stack.map(({ props, ...call }) => (
        <UserComponent
          {...props}
          key={call.key}
          call={{ ...call, root: rootProps }}
        />
      ))
    },
  }
}
