import { useState, useEffect } from 'react'
import type {
  CallFunction,
  CallableComponentArgument,
  StackState,
  StackStateSetter,
  CallableComponent,
} from './types'

export function createCallable<P = void, R = void>(
  UserComponent: CallableComponentArgument<P, R>,
): CallableComponent<P, R> {
  let $setStack: StackStateSetter<P, R> | null = null

  const call: CallFunction<P, R> = (props) => {
    if ($setStack === null) throw new Error('No <CallStack> found!')

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

  function CallStack() {
    const [stack, setStack] = useState<StackState<P, R>>([])

    useEffect(() => {
      if ($setStack !== null)
        throw new Error('Multiple instances of <CallStack> found!')
      $setStack = setStack
      return () => {
        $setStack = null
      }
    }, [])

    return stack.map((stackedCall) => {
      const { props, ...call } = stackedCall // filter out props from call
      return <UserComponent key={call.key} {...props} call={call} />
    })
  }

  CallStack.call = call
  return CallStack
}
