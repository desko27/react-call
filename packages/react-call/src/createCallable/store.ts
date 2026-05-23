import type { Resolve } from './types.private'
import type { MutationFunction } from './types.public'

type Stack<Props, Response, MutationPayload> = CallItem<
  Props,
  Response,
  MutationPayload
>[]
type Listener<Props, Response, MutationPayload> = (
  stack: Stack<Props, Response, MutationPayload>,
) => void

type CallItem<Props, Response, MutationPayload> = CallItemPublicProperties<
  Props,
  Response,
  MutationPayload
> & {
  props: Props
  promise: Promise<Response>
  resolve: Resolve<Response>
  mutationFn?: MutationFunction<MutationPayload, Response>
}

export type CallItemPublicProperties<_Props, Response, MutationPayload> = {
  key: string
  end: (response: Response) => void
  ended: boolean
  pending: boolean
  mutate: (payload: MutationPayload) => void
}

const EMPTY_STACK: Stack<unknown, unknown, unknown> = []

export function createStackStore<Props, Response, MutationPayload = void>() {
  let nextKey = 0
  let stack: Stack<Props, Response, MutationPayload> = []
  let upsertPromise: Promise<Response> | null = null
  const listeners: Set<Listener<Props, Response, MutationPayload>> = new Set()

  const emitChange = () => {
    for (const listener of listeners) listener(stack)
  }

  return {
    add: (call: Omit<CallItem<Props, Response, MutationPayload>, 'key'>) => {
      stack = [...stack, { ...call, key: String(nextKey++) }]
      emitChange()
    },
    set: (
      promise: Promise<Response> | null,
      updateFn: (
        call: CallItem<Props, Response, MutationPayload>,
      ) => CallItem<Props, Response, MutationPayload>,
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
    subscribe: (listener: Listener<Props, Response, MutationPayload>) => {
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
    getServerSnapshot: () =>
      EMPTY_STACK as Stack<Props, Response, MutationPayload>,
    getListenersSize: () => listeners.size,
    getUpsertPromise: () => upsertPromise,
    setUpsertPromise: (p: Promise<Response> | null) => {
      upsertPromise = p
    },
  }
}
