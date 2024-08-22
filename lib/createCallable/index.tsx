import { useState, useEffect } from 'react'
import type {
  UserComponent as UserComponentType,
  PrivateStackState,
  PrivateStackStateSetter,
  Callable,
} from './types'

const PromiseWithResolvers = <Response,>() => {
  let resolve: (value: Response | PromiseLike<Response>) => void
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  let reject: (reason?: any) => void

  const promise = new Promise<Response>((res, rej) => {
    resolve = res
    reject = rej
  })

  // @ts-ignore
  return { promise, resolve, reject }
}

export function createCallable<Props = void, Response = void, RootProps = {}>(
  UserComponent: UserComponentType<Props, Response, RootProps>,
): Callable<Props, Response, RootProps> {
  let $setStack: PrivateStackStateSetter<Props, Response> | null = null
  let $nextKey = 0

  return {
    call: (props) => {
      if ($setStack === null) throw new Error('No <Root> found!')

      const key = String($nextKey++)
      const promise = PromiseWithResolvers<Response>()

      const end = (response: Response) => {
        if ($setStack === null) return
        promise.resolve(response)
        $setStack((prev) => prev.filter((c) => c.key !== key))
      }

      $setStack((prev) => [...prev, { key, props, end }])
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
