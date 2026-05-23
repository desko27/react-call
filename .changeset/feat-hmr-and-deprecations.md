---
"react-call": minor
---

- **HMR persistence under Vite Fast Refresh.** `createCallable` now keeps active calls (open dialogs, in-flight upserts) alive across saves of the consumer's module. Persistence is gated on a `displayName` set on the returned Callable:

  ```tsx
  export const Confirm = createCallable((props) => { /* ... */ })
  Confirm.displayName = 'Confirm'
  ```

  Callables without a `displayName` still HMR — only the dialog being edited resets. The new [`react-call/vite`](#) plugin automates the `displayName` assignment.

- **`Callable.Root` is deprecated** (no removal date). Both `<Confirm />` and `<Confirm.Root />` mount the same component since the Callable IS its own Root component. The deprecation is marked via JSDoc on the type, so editors surface a strikethrough; the property keeps working forever for backwards compatibility.

- **The `Callable<P, R, RP>` type widened** from `{ Root, call, upsert, end, update }` to `FunctionComponent<RP> & { Root, call, upsert, end, update }`. This is additive — existing code using `<Confirm.Root />` keeps working unchanged. A consumer who hand-constructed a `Callable<...>` literal (rare) will get a type error because their literal is not a function; the fix is to use `createCallable()`, which is the only supported way to produce a `Callable`.
