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

// React's useSyncExternalStore compares snapshots with Object.is and
// throws "The result of getServerSnapshot should be cached to avoid an
// infinite loop" if the function returns a fresh value every call.
// A single per-store stable reference is enough — on the server the
// stack is always empty (no `call()` can run before hydration), and
// hydration switches the hook to `getSnapshot` immediately. Surfaced
// by the apps/nextjs playground; Vite CSR never hit this path.
const EMPTY_STACK: Stack<unknown, unknown> = []

export function createStackStore<Props, Response>() {
  let nextKey = 0
  let stack: Stack<Props, Response> = []
  let upsertPromise: Promise<Response> | null = null
  const listeners: Set<Listener<Props, Response>> = new Set()

  const emitChange = () => {
    for (const listener of listeners) listener(stack)
  }

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
    remove: (promises: Set<Promise<Response>>) => {
      stack = stack.filter((c) => !promises.has(c.promise))
      emitChange()
    },
    subscribe: (listener: Listener<Props, Response>) => {
      listeners.add(listener)

      return () => {
        listeners.delete(listener)
        if (!listeners.size) {
          nextKey = 0
          stack = []
          upsertPromise = null
        }
      }
    },
    getSnapshot: () => stack,
    getServerSnapshot: () => EMPTY_STACK as Stack<Props, Response>,
    getListenersSize: () => listeners.size,
    getUpsertPromise: () => upsertPromise,
    setUpsertPromise: (p: Promise<Response> | null) => {
      upsertPromise = p
    },
  }
}
