import { useState, useEffect } from 'react'
import type {
  CallFunction,
  UserComponent,
  PrivateStackState,
  PrivateStackStateSetter,
  Callable,
} from './types'

export function createCallable<P = void, R = void>(
  $UserComponent: UserComponent<P, R>,
): Callable<P, R> {
  let $setStack: PrivateStackStateSetter<P, R> | null = null

  const call: CallFunction<P, R> = (props) => {
    if ($setStack === null) throw new Error('No <Root> found!')

    const key = globalThis.crypto.randomUUID()
    const promise = Promise.withResolvers<R>()

    const end = (response: R) => {
      if ($setStack === null) return
      promise.resolve(response)
      $setStack((prev) => prev.filter((c) => c.key !== key))
    }

    const nextCall = { key, props, end }
    $setStack((prev) => [...prev, nextCall])

    return promise.promise
  }

  function Root() {
    const [stack, setStack] = useState<PrivateStackState<P, R>>([])

    useEffect(() => {
      if ($setStack !== null)
        throw new Error('Multiple instances of <Root> found!')
      $setStack = setStack
      return () => {
        $setStack = null
      }
    }, [])

    return stack.map((stackedCall) => {
      const { props, ...call } = stackedCall // filter out props from call
      return <$UserComponent key={call.key} {...props} call={call} />
    })
  }

  return { Root, call }
}