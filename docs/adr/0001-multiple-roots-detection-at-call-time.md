# Multiple-roots detection at call time, not mount time

When a consumer mounts more than one `<Root />` for the same `createCallable()` instance, the error `"Multiple instances of <Root> found!"` is thrown synchronously from `call()` (gated by `store.getListenersSize() > 1`), not from the Root's mount effect. The error message is preserved verbatim from the prior mount-time behaviour so any consumer tests asserting on the string keep working; only the moment the throw fires changes.

We chose this because the modern usage patterns the library actively promotes — `React.lazy` for the Root inside a `<Suspense>` boundary (documented in the README), HMR-driven re-mounts during development, and React StrictMode's double-mount-with-cleanup — all create transient windows where two listeners co-exist briefly without indicating real consumer error. Mount-time detection treated those windows as fatal; call-time detection ignores them entirely because by the moment a `call()` runs, any transient second listener has already been cleaned up. Call-time detection is also immune to the `useSyncExternalStore` subscribe/unsubscribe ordering that StrictMode exercises in dev.

## Considered options

- **Mount-time throw via `useEffect`** (the pattern still in `main` as of v1.8.x). Rejected: incompatible with lazy Root + Suspense (the very pattern the README teaches), fragile under StrictMode's intentional double-invoke, and prone to false positives during HMR. The signal the library cares about — "the consumer permanently has two Roots" — is observable just as well at call time without false positives.
- **Throw from `store.subscribe` when a second listener registers** (an earlier dev iteration in commit `ba97e1f`, later reverted in `62014a0`). Same class of false-positive problems as mount-time, plus it couples store internals to a consumer-facing error.
- **Opt-in `allowMultipleRootsWarning` to degrade the throw to `console.warn`** (also in `ba97e1f`, also reverted). Rejected: the underlying state — two Roots mounted simultaneously — is never a valid runtime configuration (only one Root receives `call()`s; the other renders nothing), so offering a "I know what I'm doing" escape hatch encourages broken setups and adds API surface for no real use case. If a concrete need surfaces later, it can be re-added with a documented justification.

## Consequences

- A consumer who accidentally renders two Roots will not see the error during initial render — only when the first `call()` fires. The trade-off is accepted: most consumers never hit this path, and those who do get a deterministic error at a moment they control (the call site) instead of a stack trace from React's render phase.
- The error timing diverges from `main` (v1.8.x). Consumer tests of the form `expect(() => render(<><Root /><Root /></>)).toThrow(...)` no longer pass; the equivalent assertion now lives at the `call()` site (`tests/src/call.test.tsx`). Release notes for the first stable cut of this branch must call this out.
- The `createCallable` second argument stays `unmountingDelay: number`, identical to `main`. No options-object overload, no `CreateCallableOptions` type — the public signature is unchanged.
