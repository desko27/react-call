---
"react-call": major
---

Breaking changes for 2.0:

- **`"Multiple instances of <Root> found!"` now fires at `call()` time instead of at Root mount time** (ADR-0001). This makes the error compatible with `React.lazy`-wrapped Roots inside `<Suspense>` boundaries, React StrictMode's double-invoke, and HMR re-mounts — all patterns that briefly create transient second listeners that aren't real consumer errors. Migration: any test of the form `expect(() => render(<><Root /><Root /></>)).toThrow(...)` should now assert the throw at the `call()` site instead.

- **`CallContext` (the `call` prop your UserComponent receives) no longer leaks three internal fields** that 1.8.x exposed by accident: `promise`, `resolve`, and `isUpsert`. The public surface is now exactly `{ key, end, ended, root, index, stackSize }`. Migration:
  - Replace `call.resolve(value)` with `call.end(value)`.
  - `call.promise` and `call.isUpsert` have no public-API equivalent — they were never meant to be touched.
