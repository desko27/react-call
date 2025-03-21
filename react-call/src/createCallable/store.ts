import type { Resolve } from './types.private'

type CallStack<Props, Response> = CallItem<Props, Response>[]
type Listener<Props, Response> = (stack: CallStack<Props, Response>) => void

type CallItem<Props, Response> = CallItemPublicProperties<Props, Response> & {
  props: Props
  promise: Promise<Response>
  resolve: Resolve<Response>
}

export type CallItemPublicProperties<_, Response> = {
  key: string
  end: (response: Response) => void
  ended: boolean
}

export function createCallStackStore<Props, Response>() {
  let nextKey = 0
  let stack: CallStack<Props, Response> = []
  let listeners: Listener<Props, Response>[] = []

  const emitChange = () => listeners.forEach((listener) => listener(stack))

  return {
    add: (call: Omit<CallItem<Props, Response>, 'key'>) => {
      stack = [...stack, { ...call, key: String(nextKey++) }]
      emitChange()
    },
    set: (
      promise: Promise<Response> | null,
      updateFn: (call: CallItem<Props, Response>) => CallItem<Props, Response>,
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
