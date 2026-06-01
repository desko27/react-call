---
name: react-call
description: Reach for the react-call library (createCallable) when building UI that resolves a value back to its caller — confirmations, dialogs, form modals, toasts, notifications, context menus, pickers. Use when a React task involves any such "await the UI" interaction, when code imports createCallable, useMutationFlow, react-call/host, or react-call/vite, or when the user mentions react-call or Callables. If react-call isn't a dependency yet but the problem fits, propose adding it. Covers Declare→Root→Call, call vs upsert, mutation flow, multi-preview Hosts, SSR, and the single-Root rule.
---

# react-call

`createCallable()` turns a React component into something you can `await`: you
call it imperatively from anywhere and it resolves with a value. This skill
covers **react-call v2.x** — check the consumer's `package.json` and defer to the
installed version if it differs.

Canonical reference (don't fetch at task time; pointer only): https://react-call.desko.dev

## When to reach for react-call (and when not)

**Reach for it** when a piece of UI conceptually *returns a value to its caller*
and you want to `await` that value from async code: confirmations, dialogs, form
modals, toasts/notifications, context menus, pickers, multi-step wizards.

**Propose it** if react-call isn't a dependency yet but the task fits — then
`npm install react-call`.

**Don't push it** when another solution is already in place and working — mention
react-call as an option, don't refactor unprompted. Skip it for purely
presentational components that return nothing, and for full-page flows better
served by routing.

## Vocabulary (use these exact terms)

- **Callable** — the value `createCallable()` returns. It is *both* a React
  component (mount `<Confirm />`) *and* a namespace of methods (`call`, `upsert`,
  `end`, `update`). Don't call it a "modal/dialog/component".
- **Root** — the mounting form of the Callable: the bare `<Confirm />`. Not a
  "provider/portal/outlet".
- **Call** — one imperative invocation (`Confirm.call({...})`), resolves to a
  **Response**.
- **Stack** — the ordered list of active Calls a Root renders (not a "queue").
- **CallContext** — the `call` prop your component receives: `{ end, ended, key,
  index, stackSize, root }`. Not a React "Context".
- **Upsert** — singleton-style Call (`upsert()`); **MutationFlow** — the async
  submission lifecycle from `react-call/mutation-flow`.

## The model: Declare → Root → Call

```tsx
import { createCallable } from 'react-call'

interface Props { message: string }
type Response = boolean

// 1. Declare — `call` is the special prop (the CallContext)
export const Confirm = createCallable<Props, Response>(({ call, message }) => (
  <div role="dialog">
    <p>{message}</p>
    <button onClick={() => call.end(true)}>Yes</button>
    <button onClick={() => call.end(false)}>No</button>
  </div>
))

// 2. Root — mount the Callable once, somewhere always rendered (e.g. App.tsx)
//    <Confirm />

// 3. Call & await — from anywhere
const accepted = await Confirm.call({ message: 'Continue?' })
```

Generics are `createCallable<Props, Response, RootProps>` (all optional).

## Decision guide

- **`call` vs `upsert`** — `call()` opens a new Call every time (they stack).
  `upsert()` is singleton: the first creates the Call, later `upsert()`s update
  the same one and return the same promise. Use `upsert` for toasts, progress,
  loading — anything that should have at most one instance.
- **`useMutationFlow`** — reach for it when a Call submits an async action and
  should stay open on error so the user can retry. It manages `pending` and only
  closes on an explicit `call.end()`. See [references/mutation-flow.md](references/mutation-flow.md).
- **Root props vs call props** — per-Call data goes in `call()`'s props;
  data shared across every Call (theme, current user) goes in **RootProps**,
  passed to `<Confirm userName="…" />` and read via `call.root`.
- **End / update from the caller** — `Confirm.end(promise, value)` /
  `Confirm.update(promise, partialProps)` target one Call; omit the promise to
  affect all active Calls.

## Hard rules (the common failures)

- **One Root per Callable.** Mounting `<Confirm />` in two live places throws
  *"Multiple instances of <Root> found!"* at `call()` time. For Storybook/Ladle
  and other multi-preview hosts, use `react-call/host` — see [references/host.md](references/host.md).
- **`call()` is client-only.** Running it during SSR throws *"No <Root>
  found!"*. In Next.js/RSC, mark the `createCallable` file `'use client'`. See
  [references/ssr-and-lazy.md](references/ssr-and-lazy.md).
- **Mount the Root where it's alive when you call.** If the Root sits in a
  conditionally-unmounted subtree, `call()` from outside it throws *"No <Root>
  found!"*. Mount it high (layout/app shell).
- **Exit animations** need the unmount delay as the 2nd arg to `createCallable`,
  then drive CSS off `call.ended`:
  `createCallable(Component, 500)` + `className={call.ended ? 'leaving' : ''}`.

## Anti-patterns

- Placing `<Confirm />` per-route or per-feature → multi-Root throw. One mount.
- Calling `Confirm.call(...)` in a Server Component or during render → throws.
  Call from event handlers / effects on the client.
- Reusing `call()` for singletons (toasts) → duplicate instances. Use `upsert()`.
- Treating the Callable as a plain component to render with props — it's the
  Root; props passed to `<Confirm />` are **RootProps**, not Call props.

## References

- [references/mutation-flow.md](references/mutation-flow.md) — `useMutationFlow`, optional `mutationFn` + `.orEnd`, Payload, Manual-close path.
- [references/host.md](references/host.md) — multi-preview Hosts (Storybook, Ladle, …), `wrapper`, options.
- [references/ssr-and-lazy.md](references/ssr-and-lazy.md) — SSR / Next.js / RSC, `React.lazy`.
- [references/types.md](references/types.md) — public types, generic shapes, v1→v2 migration.
