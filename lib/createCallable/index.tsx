import { useState, useEffect } from 'react'
import type {
  UserComponent as UserComponentType,
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

  return {
    call: (props) => {
      if (!$setStack) throw new Error('No <Root> found!')

      const key = String($nextKey++)
      let resolve: (value: Response | PromiseLike<Response>) => void
      const promise = new Promise<Response>((res) => {
        resolve = res
      })

      const end = (response: Response) => {
        resolve(response)
        if (!$setStack) return
        const scopedSetStack = $setStack

        if (unmountingDelay > 0) {
          scopedSetStack((prev) =>
            prev.map((c) => (c.key !== key ? c : { ...c, ended: true })),
          )
        }

        globalThis.setTimeout(
          () => scopedSetStack((prev) => prev.filter((c) => c.key !== key)),
          unmountingDelay,
        )
      }

      $setStack((prev) => [...prev, { key, props, end, ended: false }])
      return promise
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

      return stack.map(({ props, ...call }) => (
        <UserComponent
          {...props}
          key={call.key}
          call={{ ...call, root: rootProps, stackSize: stack.length }}
        />
      ))
    },
  }
}
