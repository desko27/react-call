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

Bring your React component, `react-call` gives you the `call(<props>)` method.

- 🔰 Easy to use
- ⛑️ Fully Type-Safe
- 🛜 Setup once, call from anywhere
- ⛓️‍💥 Not limited by a context provider
- 🤯 Call from outside React
- 🌀 Flexible: it's your component
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

Present a piece of UI to the user, wait for it to be used and get the response data.

- ✅ Confirmations, dialogs
- ✅ Notifications, toasts
- ✅ Popup forms, modals
- ✅ Or anything! 🧑‍🔧 [Build your thing](#-build-your-thing)

# Usage

```tsx
//        ↙ response             props ↘
const accepted = await Confirm.call({ message: 'Continue?' })
```

> [!NOTE]
> A confirmation dialog is used as an example, but any component can become callable. Plus you can create as many as you wish.

# Setup

## 1. 🎁 Wrap your component

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

## 2. 📡 Place the Root

Place `Root` once, which is what listens to every single call and renders it. Any component that is visible when making your calls will do.

```diff
+ <Confirm.Root />
//  ^-- it will only render active calls
```

> [!IMPORTANT]
> If more than one call is active, they will render one after another (newer below). It works as a call stack.

> [!WARNING]
> Since it's the source of truth, there can only be one `Root`. Avoid placing it in multiple locations of the React Tree at the same time, an error will be thrown if so.

# 🧑‍🔧 Build your thing

Again, this is no way limited to confirmation dialogs. You can build anything!

For example, because of the nature of the call stack inside and its ability to display multiple calls at once, a particularly interesting use case is notifications, toasts or similar. You could end up with something like:

```tsx
const userAction = await Toast.call({
  message: 'This is a toast',
  duration: 5000,
  type: 'success',
})
```

But that's just an idea. It all depends on what you're building. The only thing `react-call` does is let you call components imperatively ⚛️ 📡 but it doesn't get in the way of your stuff!

# Errors

Error | Solution
--- | ---
No \<Root> found! | You forgot to place the Root, check [Place the Root](#2--place-the-root) section.
Multiple instances of \<Root> found! | You placed more than one Root, check [Place the Root](#2--place-the-root) section as there is a warning about this.
