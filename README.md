<div align="center">
  <h2>
    ⚛️ 📡 <a href="https://react-call.desko.dev">react-call</a>
    <a href="https://www.npmjs.com/package/react-call"><img src="https://img.shields.io/npm/dw/react-call?style=flat&label=npm&color=blue" alt="NPM Downloads"></a>
    <a href="https://bundlephobia.com/package/react-call"><img src="https://img.shields.io/bundlephobia/minzip/react-call?style=flat&label=size&color=blue" alt="Bundle size"></a>
  </h2>
  ✓ 1 KB ✓ No deps ✓ SSR ✓ React Native
  <p>— Call your React components —</p>
</div>

> [!NOTE]
> These docs cover the upcoming **v2** API, currently published under the `next` tag — install it with `npm install react-call@next`. For the stable 1.x API see the [v1 README](https://github.com/desko27/react-call/blob/react-call%401.8.2/README.md).

`createCallable()` turns a React component into something you can `await`.

Good fits: confirmations, dialogs, form modals, toasts, notifications, context
menus, pickers — any UI that conceptually returns a value to its caller.


![Hero](./docs/assets/hero.png)

## Contents

- [Getting started](#getting-started)
  - [1. ⚛️ Declare](#1-️-declare)
  - [2. 📡 Root](#2--root)
  - [3. ▶️ Call \& Await](#3-️-call--await)
- [Advanced usage](#advanced-usage)
  - [End from caller](#end-from-caller)
  - [Update](#update)
  - [Upsert](#upsert)
- [Exit animations](#exit-animations)
- [Passing Root props](#passing-root-props)
- [Async submission flow](#async-submission-flow)
  - [Optional handlers](#optional-handlers)
  - [Per-button payload and fallback](#per-button-payload-and-fallback)
  - [Leave the dialog open](#leave-the-dialog-open)
- [Hot reload (HMR)](#hot-reload-hmr)
  - [Vite plugin (optional)](#vite-plugin-optional)
- [FAQ](#faq)
    - [What if more than one call is active?](#what-if-more-than-one-call-is-active)
    - [Can I place more than one Root?](#can-i-place-more-than-one-root)
- [TypeScript types](#typescript-types)
- [Errors](#errors)
- [Lazy loading](#lazy-loading)
- [SSR](#ssr)
  - [Next.js / RSC](#nextjs--rsc)
- [Migrating from v1](#migrating-from-v1)

# Getting started

```sh
npm install react-call@next
```

We'll setup a confirmation dialog, but you can setup any component to be callable.

## 1. ⚛️ Declare

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

## 2. 📡 Root

The Callable itself is the mounting point — it listens to every call and renders the active ones. Place it anywhere visible when making calls, for instance in `App.tsx`:

```diff
+ <Confirm />
//  ^-- it will render active calls
```

## 3. ▶️ Call & Await

You're all done! Now you can do this anywhere in your codebase:

```tsx
//        ↙ response             props ↘
const accepted = await Confirm.call({ message: 'Continue?' })
```

Check out [the demo site](https://react-call.desko.dev/) to see some live examples of other React components being called.

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

- Creates a new instance if no upsert instance is currently active
- Updates the existing upsert instance if one is already active
- Does not affect normal `call()` instances
- Creates a new instance if the previous upsert instance was ended

```tsx
// Example: progress notification that updates itself
const showProgress = async () => {
  Toast.upsert({ message: 'Starting download...' })

  for (let i = 0; i <= 100; i += 10) {
    await new Promise(resolve => setTimeout(resolve, 100))
    Toast.upsert({ message: `Progress: ${i}%` })
  }

  Toast.end()
}
```

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
+ RootProps
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

# Async submission flow

Use `useMutationFlow` from `react-call/mutation-flow` to wire a confirm button to an async action. The hook manages `pending` for you and **swallows throws so the dialog stays open** — the user can retry without losing their place.

```tsx
import { createCallable } from 'react-call'
import { useMutationFlow, type MutationFn } from 'react-call/mutation-flow'

type Props = { mutationFn: MutationFn<boolean> }

export const Confirm = createCallable<Props, boolean>(
  ({ call, mutationFn }) => {
    const submit = useMutationFlow(call, mutationFn)
    return (
      <div role="dialog">
        <button disabled={submit.pending} onClick={() => submit()}>Yes</button>
        <button onClick={() => call.end(false)}>No</button>
      </div>
    )
  },
)

await Confirm.call({
  mutationFn: async (call) => {
    await api.delete(id) // throws → dialog stays open, pending clears
    call.end(true)
  },
})
```

The `mutationFn` receives a narrow `{ end }` view of the call (no `RootProps` leakage) and decides when — if ever — to close.

## Optional handlers

If a caller may omit `mutationFn`, type the prop as optional and chain `.orEnd(value)` at the callsite. The chain fires only when no `mutationFn` was provided; with one, it's a no-op.

```tsx
type Props = { mutationFn?: MutationFn<boolean> }

export const Confirm = createCallable<Props, boolean>(({ call, mutationFn }) => {
  const submit = useMutationFlow(call, mutationFn)
  return (
    //                                          ↓ closes with `true` if no mutationFn
    <button disabled={submit.pending} onClick={() => submit().orEnd(true)}>Yes</button>
  )
})
```

## Per-button payload and fallback

`submit(payload)` forwards a typed payload to `mutationFn`. Because `.orEnd` lives at the callsite, sibling buttons can chain different values — useful in pickers where the response *is* the option picked:

```tsx
type Props = { mutationFn?: MutationFn<'A' | 'B', { choice: 'A' | 'B' }> }

export const Picker = createCallable<Props, 'A' | 'B'>(({ call, mutationFn }) => {
  const submit = useMutationFlow(call, mutationFn)
  return (
    <>
      <button onClick={() => submit({ choice: 'A' }).orEnd('A')}>A</button>
      <button onClick={() => submit({ choice: 'B' }).orEnd('B')}>B</button>
    </>
  )
})
```

## Leave the dialog open

To let the user dismiss manually when no `mutationFn` was provided — via a "No" button, click-outside, etc. — omit `.orEnd` entirely. `submit()` is a no-op in that case; the dialog stays mounted until something else closes it.

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

You won't need them most likely, but if you want to split the component declaration and such, the public types are available as named exports:

```tsx
import type { UserComponent, CallContext } from 'react-call'
```

Type | Description
--- | ---
CallFunction<Props?, Response?> | The call() method
UpsertFunction<Props?, Response?> | The upsert() method
CallContext<Props?, Response?, RootProps?> | The call prop in UserComponent
PropsWithCall<Props?, Response?, RootProps?> | Your props + the call prop
UserComponent<Props?, Response?, RootProps?> | What is passed to createCallable
Callable<Props?, Response?, RootProps?> | What createCallable returns

# Errors

Error | Solution
--- | ---
No \<Root> found! | You forgot to place the Root, check [Rooting section](#2--rooting). If it's already in place but not present by the time you call(), you may want to place it higher in your React tree. If you're getting this error on the server see [SSR section](#ssr).
Multiple instances of \<Root> found! | You placed more than one Root, check [Rooting section](#2--rooting) as there is a warning about this.

# Lazy loading

If your callable carries a heavy payload (rich-text editor, chart library, big form), wrap it with `React.lazy` so the chunk only ships when the call fires.

```tsx
import { createCallable } from 'react-call'
import { lazy, Suspense } from 'react'

const Confirm = createCallable(
  lazy(() => import('./Confirm')),
)

<Suspense fallback={<Spinner />}>
  <Confirm />
</Suspense>
```

- The lazy module must default-export the user component (React.lazy requirement).
- The first call waits for the chunk to download — pick a `fallback` that signals "something's loading"; `null` works but the user sees nothing happen on click.
- Subsequent calls are instant; the chunk is cached by the browser.

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

# Migrating from v1

If you're upgrading from 1.x, see the [full v2 changelog](packages/react-call/CHANGELOG.md). The breaking changes in short:

- **`<Confirm />` is the canonical Root.** The `<Confirm.Root />` form is still exported as a backwards-compatible alias but is soft-deprecated (ADR-0013).
- **Public types are flat named exports**, not under the `ReactCall` namespace (ADR-0015). Migration is a mechanical find-and-replace:

  | Before | After |
  | --- | --- |
  | `ReactCall.Function` | `CallFunction` |
  | `ReactCall.UpsertFunction` | `UpsertFunction` |
  | `ReactCall.Context` | `CallContext` |
  | `ReactCall.Props` | `PropsWithCall` |
  | `ReactCall.UserComponent` | `UserComponent` |
  | `ReactCall.Callable` | `Callable` |

- **`CallContext` no longer leaks `promise`, `resolve`, or `isUpsert`.** Replace `call.resolve(value)` with `call.end(value)`. The other two were internal and had no public-API equivalent.
- **`"Multiple instances of <Root> found!"` now fires at `call()` time**, not at Root mount time (ADR-0001) — making it compatible with `React.lazy` inside `<Suspense>`, React StrictMode's double-invoke, and HMR re-mounts. Tests of the form `expect(() => render(<><Root /><Root /></>)).toThrow(...)` should now assert at the `call()` site instead.
