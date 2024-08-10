<div align="center">
  <h1>
    ⚛️ 📡
    <br />
    react-call
  </h1>
  <pre>npm i react-call</pre>
  <i>Call your React components</i>
</div>

# Features

Build your React component, `react-call` gives you the `call(<props>)` method.

- ⚡️ Fast
- 🔰 Easy to use
- ⛑️ Fully Type-Safe
- 🌀 Flexible: it's your component
- 🤯 Can be called outside of React
- 📦 Extremely lightweight: <500B
- 🕳️ Zero dependencies

# The mindset

Imperatively call your React component the way `window.confirm()` calls a confirmation dialog.

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

if (yes) deleteItem()
```

</td>
<td>

```tsx
const props = { message: 'Sure?' }
const yes = await Confirm.call(props)

if (yes) deleteItem()
```

</td>
</tr>
</table>

# Use cases

Useful to wait for ANY piece of UI from which potentially get data.

- ✅ Confirmation modals, warnings
- ✅ Notifications, toasts
- ✅ Feedback forms
- 🧑‍🔧 [Build your thing](#-build-your-thing)

# Usage

```tsx
//        ↙ response             props ↘
const accepted = await Confirm.call({ message: 'Continue?' })
```

> [!NOTE]
> A confirmation dialog is used as an example, but you can go with any component you can think of and create as many as you wish. They all will come paired with their own call method.

# Setup

## 🎁 1. Wrap your component

```tsx
import { createCallable } from 'react-call'

interface Props { message: string }
type Response = boolean

const Confirm = createCallable<Props, Response>(({ call, message }) => (
  <div role="dialog">
    <p>{message}</p>
    <button onClick={() => call.end(true)}>Yes</button>
    <button onClick={() => call.end(false)}>No</button>
  </div>
))
```

Apart from your props, a special `call` prop is received containing the end() method, which will finish the call returning the given response.

> [!TIP]
> Since it's just a component, state, hooks and any other React features are totally fine. You could have inputs, checkboxes, etc, bind them to a state and return such data via end() method.

## 🪣 2. Place the entry point

What `createCallable` returns is not your actual component but an entry point for the calls. Let's say it's sort of a bucket where every single call is thrown into.

```diff
// Somewhere in App.tsx
+ <Confirm />
//  ^-- no worries, it will only render active calls
```

> [!NOTE]
> No props for this one, since props are always passed as an argument when invoking the call method.

> [!IMPORTANT]
> If more than one call is active, they will render one after another (newer below). It works as a call stack.

> [!WARNING]
> There can only be one entry point. Avoid placing it in multiple locations that exist in the React Tree at the same time. If more than one is found an error will be thrown.

# 🧑‍🔧 Build your thing

Again, this is no way limited to confirmation modals, you can build anything!

For example, because of the nature of the call stack inside and its ability to display multiple calls at once, a particularly interesting use case is notifications, toasts or similar. You could end up with something like:

```tsx
const userAction = await Toast.call({
  message: 'This is a toast',
  duration: 5000,
  type: 'success',
})
```

But that's just an idea. It all depends on what you're building! The only thing `react-call` does is let you call components imperatively ⚛️ 📡 but it doesn't get in the way of your stuff!

# Errors

Error | Solution
--- | ---
No \<CallStack> found! | You forgot to place the component, check [place the entry point](#-2-place-the-entry-point) section.
Multiple instances of \<CallStack> found! | You placed more than one instance of the component, check [place the entry point](#-2-place-the-entry-point) section as there is a warning about this.
