# Async submission flow as a first-class mutation primitive

v2 introduces `call.pending` + `call.mutate(payload)` on the `CallContext`, plus a `mutationFn` slot in a new `CallOptions` bag passed as the optional second arg to `call()` / `upsert()`. This closes issue #22 (open since Dec 2024) with a built-in answer to the "accept button → async op → disable while loading → stay open on failure / end on success" pattern, replacing the custom `asyncAction`-style boilerplate consumers were rolling per-dialog.

The shape is deliberately split across two scopes: the **modal** owns the `pending` UI concern and decides *when* and with *what payload* to mutate; the **caller** owns the `mutationFn` (defined in caller scope so it can close over mutation hooks, translations, alert systems, etc.) and decides *what to do* with the payload and *with what value* to close the call (`call.end(value)` inside `mutationFn`). The library glues both: it manages the `pending` lifecycle and swallows throws from `mutationFn` so failures keep the dialog open without consumer plumbing.

Three load-bearing constraints earned the API its current shape:

1. **The `mutationFn` is not a prop.** It lives in a separate `CallOptions` slot, not in `Props`. This keeps the component's Props strictly UI — the modal never sees the async logic, and the caller never has to add a `mutationFn` key to an otherwise pure-UI props object. Side benefit: the options bag is extensible (future call-time options like the `unmountOnEnd: false` lifecycle override sketched in issue #22 slot in without breaking the signature).

2. **`MutationPayload` takes 3rd generic position, demoting `RootProps` to 4th** (breaking under semver, covered by the v2 umbrella in ADR-0003). `RootProps` is rarely used in practice (most consumers never customize the Root); `MutationPayload` is part of the mainline ergonomic flow we're shipping. Putting the more-used generic earlier minimizes positional verbosity for the 99% case.

3. **Vocabulary aligns with TanStack Query** (`mutate` / `mutationFn` / `pending`) for free familiarity — anyone using TanStack reads the API and recognises the contract instantly. The one deviation: the modal-supplied data is called `payload`, not `variables`. In TanStack the entire mutation setup is co-located (`useMutation({ mutationFn })` + `.mutate(vars)`), so `variables` describes "all inputs". In react-call the `mutationFn` is defined in caller scope where it closes over half the inputs already; what flows through `call.mutate(...)` is *the modal's contribution only*, not "all variables of the mutation". `payload` describes that more honestly.

The signature uses a conditional tuple so the props arg cleanly disappears when `Props = void` (the second-arg-as-options case shouldn't force consumers to write `Confirm.call(undefined, { mutationFn })`):

```ts
type CallArgs<Props, Payload, Response> =
  Props extends void
    ? [options?: CallOptions<Payload, Response>]
    : [props: Props, options?: CallOptions<Payload, Response>]
```

Same pattern the lib already uses for `end()` and `update()`'s targeted/untargeted overloads — no new typing trick to learn.

## Considered options

- **Lower-level primitives only: split `resolve` from `dismiss`** (the original direction sketched in issue #22's first comment, e.g. `Confirm.call(..., { unmountOnEnd: false })` + `Confirm.update(promise, { loading: true })` + `Confirm.unmountResolved(promise)`). Maximally flexible but minimally ergonomic — every consumer rebuilds the same orchestration around the primitives. Rejected: the canonical case ("run X; close on success, stay on failure") accounts for the vast majority of async-submission flows, and shipping anything thinner forces consumers to keep writing the boilerplate the primitive is meant to remove.

- **Thick auto-end** (`call.endAsync(asyncFn)` where the fn's return value becomes the `end` argument, throw keeps open). Cleanest one-liner for the simple case. Rejected during grilling: it doesn't compose with side-effects the caller wants to run *after* closing (e.g., `alert.success()` post-`end`), and the "throw to stay open" path forced consumers to write `try { ... } catch (e) { alert.error(); throw e }` — the re-throw is awkward. The chosen "manual end via `call.end()` inside `mutationFn`" loses the one-liner but gains the natural flow consumers already write.

- **Chained config: `Confirm.withMutation(fn).call(props)`.** Aesthetically appealing (separates mutation from props, no magic prop name) but doesn't actually remove the typing constraint that drove the design — `Variables` still has to be known when the component is *defined* for `call.mutate(payload)` to be typed, which means a generic on `createCallable` regardless. Two variants exist: (a) chained sugar over the current Props-less options slot (zero structural gain, just aesthetic + new API surface), or (b) caller-driven payload where `Variables ≡ Props` and the modal calls `call.mutate()` with no args (clean for read-only flows like delete/retry but breaks form modals where the user types data). Rejected (a) because two ways to do the same thing has real DX cost; rejected (b) because the form-modal case is too common to write off. Additive later as a non-breaking variant if a real "read-only mutation" case appears repeatedly.

- **`mutationFn` as a regular prop** (typed via `Props['mutationFn']`, stripped from the component's view via internal `Omit`, args inferred via mapped type). Zero new generics, type inference is automatic. Rejected mainly on conceptual grounds: the modal's Props should describe its UI contract, not its async behaviour; mixing them muddies "what does this component do" at the type level. The separate options bag earns its keep by keeping that boundary clean even at the cost of one extra generic.

- **Migrate `createCallable`'s 2nd positional arg (`unmountingDelay`) to an options bag too**, for consistency with the new `CallOptions` bag in `call()`. Considered and explicitly rejected during grilling: v2's changelog is already long enough, the inconsistency is cosmetic, and consumers already pay the `(Component, 300)` cost in their existing 1.x code. If a future minor adds a second `createCallable`-level option, that's the right moment to migrate — not now for symmetry's sake.

## Out of scope for v2 (deliberate non-decisions)

These were each considered and explicitly deferred — not "we forgot," but "the v2 ship needs to stay tight, additive later costs nothing":

- **`Callable.mutate(promise?, payload)` from outside.** Would mirror `Callable.end` / `Callable.update`'s paired outside-trigger pattern. Rejected because the mental model of `mutate` is "the modal user clicked a button"; an external trigger has no obvious answer to "what payload" without the modal's UI state. Additive in a future minor if a real use case appears (e.g., global hotkey "press Cmd+Enter to submit pending dialog").

- **`AbortSignal` on `MutationContext`.** Useful for long-running mutations the user cancels mid-flight, but adds API surface and lifecycle complexity. Consumers who need it today can wire their own `AbortController` in the caller scope. Additive in a future minor if demand surfaces.

- **`call.error` on `CallContext` after a thrown mutation.** Would enable inline error rendering in the modal without the consumer wiring their own state. Rejected because (1) the canonical flow already runs `try/catch` inside `mutationFn` for toast/alert side-effects, and (2) the "when does `call.error` clear" lifecycle question doesn't have an obvious right answer — premature design without a real use case. Additive in a future minor if inline error UI becomes a common ask.

- **`pending` and `ended` exposed on `MutationContext`** (the first arg the `mutationFn` receives). `pending` is meaningless inside `mutationFn` (always true while running). `ended` is theoretically useful for "bail post-cancel" logic but marginal — the `call.end(value)` after a cancel is already a silent no-op, and side-effects post-cancel (e.g., a stale "deleted!" toast) are cosmetic, not data-corrupting. The minimal `{ end }` shape preserves space for future additions without breaking the signature.

## Consequences

- **`CallContext` gains two public properties (`pending`, `mutate`).** Additive to the surface locked by the v2 CallContext cleanup (ADR-0003 / changeset `breaking-call-context-cleanup`); no consumer migration needed for the additions themselves.

- **`createCallable`'s generic signature reorders** to `<Props, Response, MutationPayload = void, RootProps = {}>`. The (small) set of consumers who passed three generics to use `RootProps` need to add `void` (or `unknown`) in the new 3rd slot, or migrate to the 4th-positional `RootProps`. Migration is mechanical: one line per `createCallable` call site. Documented in the migration guide alongside the other v2 breakings.

- **`call()` and `upsert()` accept an optional 2nd `CallOptions` arg.** Additive (existing single-arg call sites keep working). The conditional tuple typing makes `Confirm.call({ mutationFn })` valid when `Props = void` — the options bag promotes to the first slot without forcing `undefined` placeholders.

- **Three helper types exported** (`MutationContext`, `MutationFunction`, `CallOptions`) for consumers building typed mutation helpers or reusable mutation fns. Re-exports under the `ReactCall.*` namespace alias for the namespaced consumer style.

- **Bundle size**: the new primitives add ~10 LoC (pending state on the call item, `mutate` method on the context, the swallow + warn logic). Stays well within the existing 1 KB budget.

- **Dev warning**: a `console.warn` fires (NODE_ENV-gated, same pattern as the rest of the lib's dev guards) when `call.mutate(...)` is invoked but no `mutationFn` was provided in `CallOptions`. Trivial cost, saves debugging time for the obvious misuse.

- **Issue #22 closes** when v2 ships. The discussion thread on the issue includes earlier proposals (`unmountOnEnd: false` + `Confirm.update(promise, { loading })` + `Confirm.unmountResolved(promise)`); this ADR explicitly supersedes those — the chosen shape is simpler, requires no extra outside calls from the caller, and keeps the modal as the natural locus for the UI-state concern.
