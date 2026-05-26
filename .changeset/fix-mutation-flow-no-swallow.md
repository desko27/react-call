---
"react-call": patch
---

`useMutationFlow` no longer swallows throws from the user's `mutationFn` ([ADR-0016](docs/adr/0016-mutation-flow-propagates-throws.md)). A rejected `mutationFn` now propagates as a normal unhandled promise rejection — visible in the dev console, observable by `window.addEventListener('unhandledrejection', ...)` and by telemetry tools (Sentry, Datadog) that hook into it.

The hook's state-machine contract is unchanged: `.finally` still clears `pending` and the in-flight guard on both fulfillment and rejection, so the trigger remains retry-ready. The dialog still stays open when a `mutationFn` doesn't reach `call.end()` — that has always been a property of the Call/Stack lifecycle, not of the swallow.

If you want to react to a `mutationFn` failure (surface a toast, route to Sentry, etc.), wrap the body in `try/catch`:

```ts
mutationFn: async (call) => {
  try {
    await api.delete(id)
    call.end(true)
  } catch (e) {
    toast.error(e)
    Sentry.captureException(e)
    // no call.end → dialog stays open for retry
  }
}
```

Only relevant if you adopted `useMutationFlow` from `2.0.0-next.3` onwards. The 1.x line never had the hook.
