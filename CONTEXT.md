# react-call domain

Glossary of the terms used across the library, its docs, and its agent skills.

## Async submission flow

The pattern where the user component triggers an asynchronous operation in
response to a click (typically an "Accept" button), needs to render a
loading state while it runs, and must keep the call open if the operation
fails or end the call if it succeeds.

The async work itself is owned by the **caller scope** (it's domain logic
— mutations, API calls — that doesn't belong inside a reusable dialog).
The pending UI state is owned by the **user component** (it's a UI
concern — disabled buttons, spinners — that doesn't belong at the call
site).

react-call's role is to provide call-context primitives that let the
component coordinate the two without re-implementing
`useState`/try-finally per dialog.

## Mutation

The async-submission flow is modeled as a **mutation** (terminology
imported from TanStack Query for free familiarity). Two additions
to `CallContext`:

- **`call.pending: boolean`** — true while an in-flight mutation
  hasn't settled. Component reads to disable inputs / show spinners.

- **`call.mutate(payload)`** — managed-pending trigger. Sets
  `pending` to true, invokes the caller-provided `mutationFn` with
  the payload, awaits, sets `pending` back to false. Errors thrown
  by `mutationFn` are swallowed (the call stays open; the caller's
  own `try/catch` inside `mutationFn` handles any UI side-effects).
  The `mutationFn` itself decides when (if ever) to call
  `call.end()` — the lib does not auto-end based on return value.

### Where mutationFn lives

`mutationFn` is **not** a prop. It lives in a separate options
slot on `call()` / `upsert()`:

```ts
Confirm.call(
  { message: 'Delete?' },                             // Props
  { mutationFn: async (call, payload) => { ... } }    // Options slot
)
```

The second arg is an extensible **options bag** (`CallOptions`),
not a `mutationFn`-only param. Future call-time options (e.g., the
`unmountOnEnd: false` lifecycle override sketched in issue #22) can
slot in alongside without breaking the signature. `upsert()`
accepts the same options bag for symmetry.

This keeps the component's Props strictly UI — the modal never
sees the async logic, and the caller never has to add a
"mutationFn" key to a props object that's otherwise pure UI.

### Exported helper types

- **`MutationContext<Response>`** — the first arg the `mutationFn`
  receives. Intentionally minimal: only `end(response)`. `pending`
  is meaningless inside `mutationFn` (always true while running);
  `ended` is theoretically useful for "bail post-cancel" logic but
  marginal — additive later if a real case emerges. Object shape
  (not bare `end`) preserves space for future additions
  (`signal`, `ended`, …) without breaking the signature.

- **`MutationFunction<Payload, Response>`** — full signature of
  the `mutationFn` slot. Composable: consumers can declare
  reusable mutation fns and pass them into `CallOptions`.

- **`CallOptions<Payload, Response>`** — shape of the options
  bag (`{ mutationFn?: MutationFunction<...> }`). Re-exported so
  consumers can build typed call-site helpers.

### Generic positioning (BREAKING in v2)

`createCallable`'s generics reorder to put `MutationPayload`
in 3rd position; `RootProps` moves to 4th:

```ts
createCallable<Props, Response, MutationPayload = void, RootProps = {}>
```

Rationale: `RootProps` is rarely used in practice (most consumers
never customize the Root's accepted props), while `MutationPayload`
is part of the mainline ergonomic flow we're shipping. Putting
the more-used generic earlier minimizes positional verbosity.
Breaking-change cost is borne by the (small) set of consumers
who passed three generics — they re-order one line.

## Responsibility split

- **Modal**: decides *when* to mutate and *what payload* to send
  (drawn from UI state — form data, which button, etc.). The
  payload is the modal's contribution only — not "all variables"
  of the mutation.
- **Caller**: defines `mutationFn` in caller scope, closing over
  domain helpers (mutation hooks, translations, alert system, …).
  Decides what to do with the payload and what value to close the
  call with (`call.end(value)` inside `mutationFn`).
- **Library**: manages `pending` lifecycle, swallows throws, warns
  in dev when `call.mutate()` fires but no `mutationFn` was
  provided in `CallOptions`.

## What is NOT in v2

- `Callable.mutate(...)` from outside. The mental model is
  "modal triggers mutate". External triggers don't fit and have
  no obvious semantics for "what payload" without the modal.
  Additive in a future minor if a real use case appears.
- `AbortSignal` exposed via `MutationContext`. Useful for
  long-running mutations the user cancels, but adds API surface;
  additive later if demand surfaces.
- `call.error` exposed on `CallContext` after a thrown mutation.
  Consumers who want inline error rendering wire it themselves
  via the `try/catch` already inside `mutationFn`. Additive
  later if a clean lifecycle for "when does the error clear"
  emerges.

## Mutation concurrency rules

- One mutation in-flight per call. Re-entrant `call.mutate(...)`
  while `pending` is true is a no-op (with `console.warn` in dev).
- `call.end()` invoked directly during a pending mutation ends
  the call immediately; the still-running `mutationFn`'s eventual
  `call.end(value)` is a silent no-op.
- `pending` is per-call, not per-mutationFn — a single mutation
  in-flight blocks any other on the same call.
- No `AbortSignal` exposed in v2 (additive in a future minor if
  consumer demand surfaces).
