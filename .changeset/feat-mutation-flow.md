---
"react-call": minor
---

- **New `react-call/mutation-flow` subpath entry** — `useMutationFlow(call, mutationFn, fallback?)` is an opt-in hook that wraps the canonical async-submission flow (click → run async → keep open on failure, end on success). The main `react-call` entry stays unchanged: bundle size and API surface of `createCallable` / `CallContext` are not affected. Consumers who never import the subpath pay zero.

  ```tsx
  import { createCallable } from 'react-call'
  import { useMutationFlow, type MutationFn } from 'react-call/mutation-flow'

  type Props = { mutationFn: MutationFn<boolean> }

  export const Confirm = createCallable<Props, boolean>(
    ({ call, mutationFn }) => {
      const submit = useMutationFlow(call, mutationFn)
      return (
        <button disabled={submit.pending} onClick={() => submit()}>
          Yes
        </button>
      )
    },
  )

  await Confirm.call({
    mutationFn: async (call) => {
      try {
        await api.delete(id)
        call.end(true)
      } catch (e) {
        toast.error(e) // dialog stays open, pending clears
      }
    },
  })
  ```

  The `mutationFn` receives a narrow `MutationCall<Response>` view (`{ end }`) — no `RootProps` ever leaks into the handler's signature. Throws are swallowed by the trigger so the call stays open for retry; the handler decides when (if ever) to `call.end()`. A 2-arg overload applies when the `mutationFn` parameter is required; a 3-arg overload requires a `fallback` response when `mutationFn` may be undefined. See [ADR-0014](docs/adr/0014-mutation-flow-as-composition-hook.md) for the design rationale and the trade-off versus making this a primitive on `CallContext`.

- **Exports**: `MutationFn`, `MutationCall`, `Trigger`, `useMutationFlow` from `react-call/mutation-flow`.
