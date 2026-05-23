# react-call domain

Glossary of the terms used across the library, its docs, and its agent
skills. Terms here are project-specific; general programming concepts
are excluded.

## Language

### Core

**Callable**:
The value returned by `createCallable()`. It is both a React component
(mount it as `<Confirm />`) and a namespace of imperative methods
(`call`, `upsert`, `end`, `update`). One Callable maps to one async UI
pattern.
_Avoid_: Modal, Dialog, Component (those are what a Callable models, not
the thing itself).

**Call**:
A single imperative invocation of a Callable (`Confirm.call({...})`).
Resolves to a `Response` once the call's `end` runs. The same Callable
can have many concurrent calls.
_Avoid_: Invocation, request, instance.

**Root**:
The mounting form of a Callable inside the React tree. Soft-deprecated
alias `Callable.Root`; canonical form is the bare component
(`<Confirm />`). See ADR-0013.
_Avoid_: Provider, Portal, Outlet.

**CallContext**:
The `call` prop the user component receives per active call. Exposes
`end`, `ended`, `key`, `index`, `stackSize`, `root`. Per-call; siblings
in the stack each get their own.
_Avoid_: Props.call, context (React `Context` is something else).

**Stack**:
The ordered list of currently-active calls of a Callable. The Root
renders the stack; newer calls appear later in iteration order.
_Avoid_: Queue, list, history.

**Upsert**:
Singleton-style call semantics. First `upsert()` creates the call,
subsequent `upsert()`s update its props. Returns the same promise across
the singleton's lifetime.
_Avoid_: Toast, singleton (those are use cases, not the operation).

**Caller scope**:
The site where `Confirm.call({...})` is invoked — typically a feature
component or a domain handler. The async logic and the response handling
live here.
_Avoid_: Parent, container.

### Mutation flow

**MutationFlow**:
The orchestrated async-submission lifecycle: trigger fires → pending
goes true → caller-supplied async runs → on success the caller closes
the call, on throw the call stays open and pending clears. Provided by
`useMutationFlow` from the subpath entry `react-call/mutation-flow`.
_Avoid_: Submission, async pattern, mutation (bare).

**MutationFn**:
The async handler the caller provides as a prop of the call. Signature
`(call, payload) => Promise<void>`. Owns the side effects and decides
when to close the call.
_Avoid_: Action, onSubmit, mutator, asyncAction.

**MutationCall**:
The minimal view of CallContext that a MutationFn receives — currently
just `{ end }`. Narrower than CallContext on purpose, so MutationFn does
not need to know `RootProps`.
_Avoid_: MutationContext (would falsely suggest a separate React
Context), Closer.

**Trigger**:
The callable function returned by `useMutationFlow`. Calling it runs the
MutationFn (or the fallback) while exposing `trigger.pending`. One
trigger per call to `useMutationFlow`.
_Avoid_: Submit, runner, dispatcher.

**Fallback response**:
The Response value used when `submit()` fires but no MutationFn was
provided. Required as the 3rd argument to `useMutationFlow` exactly when
the MutationFn parameter is typed as possibly-undefined.
_Avoid_: Default, no-op.

## Relationships

- A **Callable** produces zero or more **Calls** over its lifetime.
- A **Call** carries one **CallContext**; siblings in the **Stack** each
  carry their own.
- A **MutationFlow** is scoped to a single **Call** — the **Trigger**
  closes over that call's **CallContext**.
- A **MutationFn** lives in **caller scope** but runs against the
  **MutationCall** view of the **CallContext**, not the full one.
- The **Fallback response** is only meaningful when the **MutationFn**
  may be absent at the **Call** site.

## Example dialogue

> **Maintainer:** "If the **MutationFn** throws, does the **Call** end?"
>
> **Designer:** "No — the **Trigger** swallows the throw, **pending**
> clears, the **Call** stays open. The **MutationFn** itself decides
> when to invoke `call.end()`."
>
> **Maintainer:** "And if the caller never provides a **MutationFn**?"
>
> **Designer:** "Then `submit()` closes the **Call** with the
> **Fallback response** — but the type signature only lets you omit the
> fallback when the **MutationFn** parameter is non-nullable."

## Flagged ambiguities

- "mutation" used to mean both the **MutationFlow** (the lifecycle) and
  the **MutationFn** (the handler). Resolved: **MutationFlow** is the
  pattern, **MutationFn** is the function the caller writes.
- "context" risked collision with React's `Context`. Resolved: we use
  **CallContext** (the per-call prop bag, not a React `Context`) and
  **MutationCall** (the subset the handler sees) — the word "context"
  alone is avoided in lib API.
- "asyncAction" appears in third-party patterns this design takes
  inspiration from. Resolved: the canonical name in react-call is
  **MutationFn**.
