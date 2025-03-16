import type { PrivateCallContext, PrivateStackState } from './types'

type Listener<Props, Response> = (
  stack: PrivateStackState<Props, Response>,
) => void

export function createCallStackStore<Props, Response>() {
  let nextKey = 0
  let stack: PrivateStackState<Props, Response> = []
  let listeners: Listener<Props, Response>[] = []

  const emitChange = () => listeners.forEach((listener) => listener(stack))

  return {
    add: (call: Omit<PrivateCallContext<Props, Response>, 'key'>) => {
      stack = [...stack, { ...call, key: String(nextKey++) }]
      emitChange()
    },
    set: (
      promise: Promise<Response> | null,
      updateFn: (
        call: PrivateCallContext<Props, Response>,
      ) => PrivateCallContext<Props, Response>,
    ) => {
      stack = stack.map((call) =>
        promise && call.promise !== promise ? call : updateFn(call),
      )
      emitChange()
    },
    remove: (promise: Promise<Response> | null) => {
      stack = stack.filter((c) => promise && c.promise !== promise)
      emitChange()
    },
    subscribe: (listener: Listener<Props, Response>) => {
      if (listeners.length)
        throw new Error('Multiple instances of <Root> found!')
      listeners = [...listeners, listener]

      return () => {
        listeners = listeners.filter((l) => l !== listener)
        if (!listeners.length) {
          nextKey = 0
          stack = []
        }
      }
    },
    getSnapshot: () => stack,
    hasListeners: () => !!listeners.length,
  }
}
