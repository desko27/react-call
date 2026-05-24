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
 * Throws are swallowed by the trigger — pending clears, the call stays
 * open, the caller can retry.
 */
export type MutationFn<Response, Payload = void> = (
  call: MutationCall<Response>,
  payload: Payload,
) => Promise<void>

/**
 * The callable returned by `useMutationFlow`. `pending` reflects the
 * in-flight state for the UI; calling the trigger runs the MutationFn
 * (or the fallback, when no MutationFn is provided).
 */
export type Trigger<Payload> = ((payload: Payload) => void) & {
  pending: boolean
}

// Overloads encode the invariant "fallback is required iff mutationFn
// may be undefined". When the consumer types the prop as required, the
// fallback-less options shape applies. When the prop is possibly-
// undefined, TypeScript forces the shape that requires `fallback`. No
// dead-weight optional field leaks into the required-handler case.
export function useMutationFlow<Response, Payload = void>(
  call: MutationCall<Response>,
  options: { mutationFn: MutationFn<Response, Payload> },
): Trigger<Payload>
export function useMutationFlow<Response, Payload = void>(
  call: MutationCall<Response>,
  options: {
    mutationFn: MutationFn<Response, Payload> | undefined
    fallback: Response
  },
): Trigger<Payload>
export function useMutationFlow<Response, Payload = void>(
  call: MutationCall<Response>,
  options: {
    mutationFn: MutationFn<Response, Payload> | undefined
    fallback?: Response
  },
): Trigger<Payload> {
  const { mutationFn, fallback } = options
  const [pending, setPending] = useState(false)
  // Synchronous re-entry guard. `pending` state alone can't guard against
  // a second call dispatched programmatically inside the same event-loop
  // turn (state hasn't flushed yet); the ref does.
  const inFlightRef = useRef(false)

  const trigger = ((payload: Payload) => {
    if (inFlightRef.current) return
    if (!mutationFn) {
      call.end(fallback as Response)
      return
    }
    inFlightRef.current = true
    setPending(true)
    mutationFn(call, payload)
      .catch(() => {})
      .finally(() => {
        inFlightRef.current = false
        setPending(false)
      })
  }) as Trigger<Payload>
  trigger.pending = pending

  return trigger
}
