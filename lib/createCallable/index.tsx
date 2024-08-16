import { useState, useEffect } from 'react'
import type {
  CallFunction,
  UserComponent as UserComponentType,
  PrivateStackState,
  PrivateStackStateSetter,
  Callable,
} from './types'

export function createCallable<Props = void, Response = void, RootProps = {}>(
  UserComponent: UserComponentType<Props, Response, RootProps>,
): Callable<Props, Response, RootProps> {
  let $setStack: PrivateStackStateSetter<Props, Response> | null = null
  let $nextKey = 0

  const call: CallFunction<Props, Response> = (props) => {
    if ($setStack === null) throw new Error('No <Root> found!')

    const key = String($nextKey++)
    const promise = Promise.withResolvers<Response>()

    const end = (response: Response) => {
      if ($setStack === null) return
      promise.resolve(response)
      $setStack((prev) => prev.filter((c) => c.key !== key))
    }

    const nextCall = { key, props, end }
    $setStack((prev) => [...prev, nextCall])

    return promise.promise
  }

  function Root(rootProps: RootProps) {
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

    return stack.map((stackedCall) => {
      const { props, ...callWithoutProps } = stackedCall
      const call = { ...callWithoutProps, root: rootProps }
      return <UserComponent key={call.key} {...props} call={call} />
    })
  }

  return { Root, call }
}
