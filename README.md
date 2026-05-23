<div align="center">
  <h2>
    ⚛️ 📡 <a href="https://react-call.desko.dev">react-call</a>
    <!--<a href="https://www.npmjs.com/package/react-call"><img src="https://img.shields.io/npm/dw/react-call" alt="NPM Downloads"></a>-->
    <a href="https://www.npmjs.com/package/react-call"><img src="https://img.shields.io/npm/dw/react-call?style=flat&label=npm&color=blue" alt="NPM Downloads"></a>
  </h2>
  ✓ Lightweight ✓ No deps ✓ SSR ✓ React Native
</div>

# Call your React components

As simple as `window.confirm()` but it's React:

<table>
<tr>
<td>window.confirm</td>
<td>react-call</td>
</tr>
<tr>
<td>

```tsx
const message = 'Sure?'
const yes = window.confirm(message)

if (yes) thanosSnap() // 🫰
```

</td>
<td>

```tsx
const props = { message: 'Sure?' }
const yes = await Confirm.call(props)

if (yes) thanosSnap() // 🫰
```

</td>
</tr>
</table>

# Simple yet flexible

Present any piece of UI to the user, wait for the response data:

- 💬 Confirmations, dialogs, form modals
- 🔔 Notifications, toasts, popups
- 📋 Context menus
- 🎉 Or anything!

# Quick setup

```sh
npm install react-call
```

We'll setup a confirmation dialog, but you can setup any component to be callable.

## 1. ⚛️ Declaration

```tsx
import { createCallable } from 'react-call'

interface Props { message: string }
type Response = boolean

export const Confirm = createCallable<Props, Response>(({ call, message }) => (
  <div role="dialog">
    <p>{message}</p>
    <button onClick={() => call.end(true)}>Yes</button>
    <button onClick={() => call.end(false)}>No</button>
  </div>
))
```

Along with your props, there is a special `call` prop containing the `end()` method, which you can use to finish the call and return a response. State, hooks and any other React features are totally fine too.

## 2. 📡 Rooting

The Callable itself is the mounting point — it listens to every call and renders the active ones. Place it anywhere visible when making calls, for instance in `App.tsx`:

```diff
+ <Confirm />
//  ^-- it will render active calls
```

## 3. 🎉 Enjoy

You're all done! Now you can do this anywhere in your codebase:

```tsx
//        ↙ response             props ↘
const accepted = await Confirm.call({ message: 'Continue?' })
```

Check out [the demo site](https://react-call.desko.dev/) to see some live examples of other React components being called.

# Lazy loading

Use React.lazy to code-split callable components and load them on demand.

```tsx
import { createCallable } from 'react-call'
import { lazy, Suspense } from 'react'

// 1) Lazy-load your component
const Confirm = createCallable(
  lazy(() => import('./Confirm')), // default export required
)

// 2) Place the Callable inside a Suspense boundary
export function App() {
  return (
    <>
      {/* Other app UI */}
      <Suspense fallback={null}>
        <Confirm />
      </Suspense>
    </>
  )
}

// 3) Call it as usual (component is fetched on first call)
const accepted = await Confirm.call({ message: 'Continue?' })
```

Notes:
- Make sure the lazily imported file has a default export (React.lazy requirement).
- Wrap `<Confirm />` (or an ancestor) in `<Suspense>` to handle the loading state.
- The lazy component is split into a separate chunk and downloaded only when first called.

# Advanced usage

## End from caller

The returned promise can be used to end the call from the caller scope:

```tsx
const promise = Confirm.call({ message: 'Continue?' })

// For example, on some event subscription
onImportantEvent(() => {
  Confirm.end(promise, false)
})

// And still await the response where needed
const accepted = await promise
```

While the promise argument is used to target that specific call, all ongoing calls can be affected by omitting it:

```tsx
// All confirm calls are ended with `false`
Confirm.end(false)
```

## Update

The returned promise can also be used to update the call props on the fly:

```tsx
const promise = Alert.call({ message: 'Starting operation...' })
await asyncOperation()
Alert.update(promise, { message: 'Completed!' })
```

While the promise argument is used to target that specific call, all ongoing calls can be affected by omitting it:

```tsx
// All alert calls are updated with the new message prop
Alert.update({ message: 'Completed!' })
```

## Upsert

If you need to ensure only one instance of a component is active at a time, use `upsert()` instead of `call()`. This is particularly useful for notifications, loading states, or any singleton-like UI:

```tsx
// First call creates a new instance
const promise1 = Toast.upsert({ message: 'Loading...' })

// Second call updates the existing instance instead of creating a new one
const promise2 = Toast.upsert({ message: 'Almost done...' })

// promise1 === promise2 (same instance)
console.log(promise1 === promise2) // true
```

The `upsert()` method behaves as follows:

- **Creates** a new instance if no upsert instance is currently active
- **Updates** the existing upsert instance if one is already active
- **Does not affect** normal `call()` instances
- **Creates** a new instance if the previous upsert instance was ended

```tsx
// Example: Progress notification that updates itself
const showProgress = async () => {
  Toast.upsert({ message: 'Starting download...' })

  for (let i = 0; i <= 100; i += 10) {
    await new Promise(resolve => setTimeout(resolve, 100))
    Toast.upsert({ message: `Progress: ${i}%` })
  }

  // End the notification
  Toast.end(true)
}
```

## Async mutations

For the common "click → run async op → close on success / stay on failure" flow, the `call` prop exposes `call.pending` and `call.mutate(payload)`. The async operation itself lives in a `mutationFn` slot you pass at `call()` time — naming and signature follow TanStack Query so the mental model is the same: `mutationFn` is the work, `mutate(payload)` triggers it, `pending` reflects in-flight state.

```tsx
type Props = { message: string }
type Payload = { id: string }

export const Confirm = createCallable<Props, boolean, Payload>(({ call, message }) => (
  <div role="dialog">
    <p>{message}</p>
    <button
      disabled={call.pending}
      onClick={() => call.mutate({ id: 'abc' })}
    >
      Delete
    </button>
    <button onClick={() => call.end(false)}>Cancel</button>
  </div>
))

// At the call site, supply the async work in the optional second arg:
Confirm.call(
  { message: 'Delete this item?' },
  {
    mutationFn: async (call, { id }) => {
      try {
        await api.delete(id)
        call.end(true)
        toast.success('Deleted')
      } catch (err) {
        toast.error(err)
        // no end → dialog stays open, pending clears, user can retry
      }
    },
  },
)
```

The library handles the `pending` lifecycle (true while the `mutationFn` runs, false when it settles) and silently swallows any throw — your own `try/catch` inside `mutationFn` decides whether to close the dialog (`call.end(value)`) or leave it open for a retry. The mutation context (`call` inside `mutationFn`) exposes only `end` to keep the contract minimal.

**Concurrency rules:**
- Only one mutation can be in-flight per call — re-entrant `call.mutate()` while `pending` is a no-op (with a dev warning).
- `call.end()` invoked directly (e.g. from a Cancel button) during a pending mutation wins; the still-running `mutationFn`'s eventual `call.end(value)` is a silent no-op.

`upsert()` accepts the same options bag for symmetry:

```tsx
Toast.upsert(
  { message: 'Saving…' },
  { mutationFn: async (call, payload) => { /* … */ } },
)
```

If your component doesn't need a payload (e.g. a confirm with no extra data), the `MutationPayload` generic defaults to `void` and `call.mutate()` takes no args.

# Exit animations

To animate the exit of your component when `call.end()` is run, just pass the duration of your animation in milliseconds to createCallable as a second argument:

```diff
+ const UNMOUNTING_DELAY = 500

export const Confirm = createCallable<Props, Response>(
  ({ call }) => (
    <div
+     className={call.ended ? 'exit-animation' : '' }
    />
  ),
+ UNMOUNTING_DELAY
)
```

The `call.ended` boolean may be used to apply your animation CSS class.

# Passing Root props

You can also read props from Root, which are separate from the call props. To do that, just add your RootProps type to createCallable and pass them to your Root.

Root props will be available to your component via `call.root` object.

```diff
+ type RootProps = { userName: string }

export const Confirm = createCallable<
  Props,
  Response,
+ void,        // ← MutationPayload (3rd) — pass void if you don't use mutations
+ RootProps    // ← RootProps moved to 4th in v2 (ADR-0014)
>(({ call, message }) => (
  ...
+   Hi {call.root.userName}!
  ...
))
```

```diff
<Confirm
+ userName='John Doe'
/>
```

You may want to use Root props if you need to:

- Share the same piece of data to every call
- Use something that is availble in Root's parent
- Update your active call components on data changes

# Hot reload (HMR)

`createCallable` is Fast Refresh friendly — edits to your callable's source hot-update in place without a full page reload.

If you want the **open dialog to survive across saves** of its own source, set a `displayName` on the callable:

```diff
  export const Confirm = createCallable(({ call, message }) => (
    <div role="dialog">
      {/* ... */}
    </div>
  ))
+ Confirm.displayName = 'Confirm'
```

Callables without a `displayName` still HMR — only the dialog you're editing resets; sibling state in the rest of the page is preserved either way.

## Vite plugin (optional)

If you're on Vite, the bundled plugin auto-injects the `displayName` line so you don't have to write it:

```ts
// vite.config.ts
import react from '@vitejs/plugin-react'
import reactCall from 'react-call/vite'

export default {
  plugins: [react(), reactCall()],
}
```

With the plugin enabled, every top-level `(export) const X = createCallable(...)` gets `X.displayName = 'X'` appended at dev time only — no source change, no production overhead.

# FAQ

### What if more than one call is active?

`<Root>` works as a call stack. Multiple calls will render one after another (newer below, which is one on top of the other if your CSS is position fixed/absolute).

### Can I place more than one Root?

No. There can only be one `<Root>` mounted per createCallable(). Avoid placing it in multiple locations of the React Tree loaded at once, an error will be thrown if so.

# TypeScript types

You won't need them most likely, but if you want to split the component declaration and such, you may use the types under the `ReactCall` namespace:

```tsx
import type { ReactCall } from 'react-call'
```

Type | Description
--- | ---
ReactCall.Function<Props?, Response?, MutationPayload?> | The call() method
ReactCall.UpsertFunction<Props?, Response?, MutationPayload?> | The upsert() method
ReactCall.Context<Props?, Response?, MutationPayload?, RootProps?> | The call prop in UserComponent
ReactCall.Props<Props?, Response?, MutationPayload?, RootProps?> | Your props + the call prop
ReactCall.UserComponent<Props?, Response?, MutationPayload?, RootProps?> | What is passed to createCallable
ReactCall.Callable<Props?, Response?, MutationPayload?, RootProps?> | What createCallable returns
ReactCall.CallOptions<MutationPayload?, Response?> | Optional 2nd arg of `call()` / `upsert()` (`{ mutationFn? }`)
ReactCall.MutationContext<Response?> | The `call` arg the `mutationFn` receives (`{ end }`)
ReactCall.MutationFunction<MutationPayload?, Response?> | Full signature of the `mutationFn` slot

# Errors

Error | Solution
--- | ---
No \<Root> found! | You forgot to place the Root, check [Rooting section](#2--rooting). If it's already in place but not present by the time you call(), you may want to place it higher in your React tree. If you're getting this error on the server see [SSR section](#ssr).
Multiple instances of \<Root> found! | You placed more than one Root, check [Rooting section](#2--rooting) as there is a warning about this.

# SSR

✅ The react-call setup supports [Server Side Rendering](https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering). This means both createCallable and Root component are fine if run or rendered on the server.

However, bear in mind that because the call() method is meant to be triggered by user interaction, it is designed as a client-only feature.

> [!CAUTION]
> If call() is run on the server a "No \<Root> found!" error will be thrown. As long as you don't run the call() method on the server you'll be fine.

## Next.js / RSC

Mark the file where you call `createCallable(...)` as a Client Component (the lib uses `useSyncExternalStore`):

```diff
+ 'use client'

export const Confirm = createCallable(...)
```

Then `<Confirm />` mounts cleanly from any Server Component (e.g. `app/layout.tsx`).
