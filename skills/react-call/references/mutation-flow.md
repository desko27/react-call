# Mutation flow

`useMutationFlow` (from the subpath `react-call/mutation-flow`) wires a Call to an
async submission — the **MutationFlow**. It manages `pending` for you, and because
closing the Call requires an explicit `call.end()`, a handler that doesn't reach
`end` leaves the Call open: the user can retry without losing their place.

## Terms

- **MutationFn** — the async handler the caller provides as a prop:
  `(call, payload) => Promise<void>`. Owns the side effects and decides when to
  close the Call.
- **MutationCall** — the narrow view of CallContext the MutationFn receives:
  just `{ end }`. Keeping it minimal lets MutationFn skip the `RootProps` generic.
- **Trigger** — what `useMutationFlow` returns. Calling it runs the MutationFn;
  read `trigger.pending` for the in-flight UI state.
- **Fallback response** — the value used to close the Call when the Trigger fires
  but no MutationFn was provided, delivered at the callsite via `.orEnd(value)`.
- **Manual-close path** — neither a MutationFn nor a Fallback response closes the
  Call; the consumer leaves it open on purpose (a "No" button, click-outside).

## Required MutationFn

```tsx
import { createCallable } from 'react-call'
import { useMutationFlow, type MutationFn } from 'react-call/mutation-flow'

type Props = { mutationFn: MutationFn<boolean> }

export const Confirm = createCallable<Props, boolean>(({ call, mutationFn }) => {
  const submit = useMutationFlow(call, mutationFn)
  return (
    <div role="dialog">
      <button disabled={submit.pending} onClick={() => submit()}>Yes</button>
      <button onClick={() => call.end(false)}>No</button>
    </div>
  )
})

await Confirm.call({
  mutationFn: async (call) => {
    await api.delete(id)
    call.end(true) // the handler decides when to close
  },
})
```

If the MutationFn throws, the Trigger swallows it, `pending` clears, and the Call
**stays open** — the handler itself owns `call.end()`.

## Optional MutationFn + `.orEnd`

Type the prop as optional and chain `.orEnd(value)` at the callsite. The chain
fires only when no MutationFn was provided; with one, it's a no-op.

```tsx
type Props = { mutationFn?: MutationFn<boolean> }

export const Confirm = createCallable<Props, boolean>(({ call, mutationFn }) => {
  const submit = useMutationFlow(call, mutationFn)
  //                  closes with `true` (Fallback response) if no mutationFn ↓
  return <button disabled={submit.pending} onClick={() => submit().orEnd(true)}>Yes</button>
})
```

- Provide `.orEnd(value)` → that value is the **Fallback response**.
- Omit `.orEnd` and pass no MutationFn → the Call is on the **Manual-close path**
  (open until something else closes it). Only reachable when the MutationFn prop
  is typed as possibly-undefined.

## Payload

`MutationFn<Response, Payload>` — `Payload` is the second generic, defaults to
`void`, so `submit()` takes no argument unless you opt in. It's typed end-to-end
(the Trigger callsite and the handler share it) and lives at the callsite, so
different Triggers in the same component can forward different payloads (useful
for pickers).

```tsx
type Props = { mutationFn: MutationFn<boolean, { name: string }> }

export const Create = createCallable<Props, boolean>(({ call, mutationFn }) => {
  const [name, setName] = useState('')
  const submit = useMutationFlow(call, mutationFn)
  return <button onClick={() => submit({ name })}>Create</button>
})

await Create.call({
  mutationFn: async (call, payload) => { // payload: { name: string }
    await api.create(payload.name)
    call.end(true)
  },
})
```
