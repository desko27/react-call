import { useRef, useState } from 'react'

/**
 * The narrow view of a CallContext that a MutationFn receives. Only `end`
 * — the handler has no business reading `key`, `index`, `root`, etc. and
 * keeping it minimal lets MutationFn skip the `RootProps` generic.
 */
export type MutationCall<Response> = {
  end: (response: Response) => void
}

/**
 * The async handler the caller provides as a prop of the call. Owns the
 * side effects and decides when to close the call (via `call.end`).
 */
export type MutationFn<Response, Payload = void> = (
  call: MutationCall<Response>,
  payload: Payload,
) => Promise<void>

/**
 * The callable returned by `useMutationFlow` when the MutationFn
 * parameter is non-nullable. `pending` reflects the in-flight state for
 * the UI; calling the trigger runs the MutationFn.
 */
export type Trigger<Payload> = ((payload: Payload) => void) & {
  pending: boolean
}

/**
 * The callable returned by `useMutationFlow` when the MutationFn
 * parameter may be undefined. Calling the trigger returns a chain
 * object exposing `.orEnd(value)`, which the consumer uses to deliver
 * the Fallback response at the callsite. When the MutationFn is
 * actually present at runtime, `.orEnd` is a no-op.
 */
export type ChainTrigger<Payload, Response> = ((payload: Payload) => {
  orEnd: (value: Response) => void
}) & { pending: boolean }

const NOOP_CHAIN = { orEnd: () => {} }

// Overloads encode the invariant "the Fallback response is reachable
// iff mutationFn may be undefined". Required handler → submit returns
// void. Possibly-undefined handler → submit returns a chain object
// whose `.orEnd(value)` delivers the fallback at the callsite.
export function useMutationFlow<Response, Payload = void>(
  call: MutationCall<Response>,
  mutationFn: MutationFn<Response, Payload>,
): Trigger<Payload>
export function useMutationFlow<Response, Payload = void>(
  call: MutationCall<Response>,
  mutationFn: MutationFn<Response, Payload> | undefined,
): ChainTrigger<Payload, Response>
export function useMutationFlow<Response, Payload = void>(
  call: MutationCall<Response>,
  mutationFn: MutationFn<Response, Payload> | undefined,
): ChainTrigger<Payload, Response> {
  const [pending, setPending] = useState(false)
  // Synchronous re-entry guard. `pending` state alone can't guard against
  // a second call dispatched programmatically inside the same event-loop
  // turn (state hasn't flushed yet); the ref does.
  const inFlightRef = useRef(false)

  const trigger = ((payload: Payload) => {
    if (inFlightRef.current) return NOOP_CHAIN
    if (!mutationFn) {
      return { orEnd: (value: Response) => call.end(value) }
    }
    inFlightRef.current = true
    setPending(true)
    mutationFn(call, payload).finally(() => {
      inFlightRef.current = false
      setPending(false)
    })
    return NOOP_CHAIN
  }) as ChainTrigger<Payload, Response>
  trigger.pending = pending

  return trigger
}
