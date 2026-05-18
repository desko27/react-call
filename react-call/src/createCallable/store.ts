import type { Resolve } from './types.private'

type Stack<Props, Response> = CallItem<Props, Response>[]
type Listener<Props, Response> = (stack: Stack<Props, Response>) => void

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

export function createStackStore<Props, Response>(onReset?: () => void) {
  let nextKey = 0
  let stack: Stack<Props, Response> = []
  const listeners: Set<Listener<Props, Response>> = new Set()

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
      listeners.add(listener)

      return () => {
        listeners.delete(listener)
        if (!listeners.size) {
          nextKey = 0
          stack = []
          onReset?.()
        }
      }
    },
    getSnapshot: () => stack,
    getServerSnapshot: () => [],
    getListenersSize: () => listeners.size,
  }
}
