# Upsert state lives in `createCallable` closure, not in the store

`$upsertPromise` — the shared `Promise<Response>` returned by consecutive `upsert()` calls until the upsert instance ends — is declared as a `let` in the `createCallable` closure alongside `$store`, not as part of the store's internal state. To keep cleanup correct when the last `<Root>` unmounts, `createStackStore()` accepts an optional `onReset?: () => void` callback that fires from the same code path that resets `nextKey` and `stack`; `createCallable` passes `() => { $upsertPromise = null }` so the closure-level state participates in the same lifecycle the store already manages.

We chose this because `$upsertPromise` is coordination state between `upsert()` and `end()` invocations — the React tree never reads it, it does not participate in the `useSyncExternalStore` snapshot, and it changes synchronously on the call site rather than via a store mutation that triggers `emitChange()`. The store exists to feed `useSyncExternalStore`; non-render state does not belong there. Adding `onReset` is the minimum new store surface to keep the two lifecycles in sync, and it generalises beyond upsert (any future closure-level coordination state can hook into the same callback).

## Considered options

- **`$upsertPromise` as a store primitive** (`getUpsertPromise()` / `setUpsertPromise()` / `clearUpsertPromise()`). Rejected: would couple the store to the upsert feature specifically, and the new primitives would not participate in the listener notification loop the store was built for — they would be store-shaped state that bypasses the store's purpose.
- **Derive "is there an active upsert?" from the stack via an `isUpsert: true` flag on `CallItem`** (so `upsert()` would do `stack.find((c) => c.isUpsert && !c.ended)` instead of consulting a closure variable). Rejected for a latent ordering bug: two `upsert()` calls dispatched synchronously before the next render would not see each other through the stack — the first appends, the second searches the stack but the appended item is in the next snapshot, not the current one — and would both create new instances instead of the second updating the first. A closure variable is synchronously visible across `upsert()` calls; the stack is not.

## Consequences

- The store API gains one parameter (`onReset`) but stays focused on render state. Future per-`createCallable` coordination state can reuse the hook instead of inventing new store primitives.
- Internal architecture mirrors `main` (v1.8.x) — `$upsertPromise` lives in the same scope and is cleared on the same lifecycle events (untargeted `end()`, targeted `end()` on the upsert promise, and last-Root-unmount), so a side-by-side diff of upsert behaviour between branches stays small and reviewable.
- `isUpsert` metadata on `CallItem` is intentionally not added — `main` sets it but never reads it; dev does not need it because the upsert identity is tracked by promise equality in the closure.
