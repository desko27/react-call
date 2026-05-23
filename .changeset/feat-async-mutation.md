---
"react-call": major
---

**Async submission flow as a first-class mutation primitive** (closes #22, see ADR-0014).

Two additions to `CallContext`:

- **`call.pending: boolean`** — true while an in-flight mutation hasn't settled. Component reads to disable inputs / show spinners.
- **`call.mutate(payload)`** — managed-pending trigger. Sets `pending` to true, invokes the caller-provided `mutationFn` with the payload, awaits, sets `pending` back to false. Errors thrown by `mutationFn` are swallowed; the call stays open (the caller's own `try/catch` inside `mutationFn` handles any UI side-effects).

The `mutationFn` lives in a new optional `CallOptions` slot — the second arg of `call()` / `upsert()` — **not** in `Props`. This keeps the modal's Props strictly UI, while the caller closes over domain helpers (mutation hooks, alerts, translations) in `mutationFn`:

```tsx
type Props = { message: string }
type Payload = { id: string }

const Confirm = createCallable<Props, boolean, Payload>(({ call, message }) => (
  <Dialog>
    <p>{message}</p>
    <button disabled={call.pending} onClick={() => call.mutate({ id: 'abc' })}>
      Delete
    </button>
    <button onClick={() => call.end(false)}>Cancel</button>
  </Dialog>
))

Confirm.call(
  { message: 'Delete?' },
  {
    mutationFn: async (call, { id }) => {
      try {
        await api.delete(id)
        call.end(true)
        alert.success(...)
      } catch (e) {
        alert.error(...)
        // no end / no throw → dialog stays open, pending clears
      }
    },
  },
)
```

**BREAKING — generic reorder.** `createCallable<Props, Response, MutationPayload = void, RootProps = {}>` — `MutationPayload` takes 3rd position and `RootProps` moves to 4th. Consumers who passed three generics to set `RootProps` need to insert `void` in the new 3rd slot. Migration is mechanical:

```ts
// 1.x / pre-2.0
createCallable<Props, Response, RootProps>(Component)

// 2.0
createCallable<Props, Response, void, RootProps>(Component)
```

When `Props = void`, `Confirm.call()` and `Confirm.call({ mutationFn })` are both valid via a conditional tuple — the options slot promotes to first arg.

**Concurrency rules** (enforced by the lib): one mutation in-flight per call; re-entrant `call.mutate()` while `pending` is a no-op (with dev warn); `call.end()` invoked directly during a pending mutation ends immediately and the still-running `mutationFn`'s eventual `call.end(value)` is a silent no-op.

**Dev warnings** (NODE_ENV-gated, stripped from consumer production bundles): `call.mutate()` invoked without a `mutationFn` in CallOptions, and re-entrant mutate while pending.

**Bundle budget** raised from 1 KB to 1.25 KB brotli to accommodate the new primitive. Honest reflection of new functionality — the alternative was crunching helpful dev warnings to fit a budget that pre-dated the feature.

**New helper types exported** (under both named exports and the `ReactCall.*` namespace):

- `MutationContext<Response>` — minimal `{ end }` context the `mutationFn` receives as its first arg.
- `MutationFunction<Payload, Response>` — full signature of the `mutationFn` slot, composable for consumers building typed mutation helpers.
- `CallOptions<Payload, Response>` — shape of the options bag.

**Out of scope for this release** (deliberate, additive later if real demand surfaces): `Callable.mutate(...)` from outside, `AbortSignal` on `MutationContext`, `call.error` on `CallContext`. See ADR-0014.
