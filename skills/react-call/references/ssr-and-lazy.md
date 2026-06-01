# SSR, Next.js / RSC, and lazy loading

## SSR

The setup is SSR-safe: both `createCallable` and the Root (`<Confirm />`) are fine
to run/render on the server. But a **Call** is meant to be triggered by user
interaction, so `call()` is a **client-only** feature.

- Rendering `<Confirm />` on the server: ✅ (the Stack is empty until hydration).
- Running `Confirm.call(...)` on the server: ❌ throws *"No <Root> found!"*.

Keep `call()` out of server execution paths (call from event handlers / client
effects) and you're fine.

## Next.js / RSC

Mark the file where you run `createCallable(...)` as a Client Component — the
library uses `useSyncExternalStore`:

```tsx
'use client'

import { createCallable } from 'react-call'

export const Confirm = createCallable(/* ... */)
```

Then `<Confirm />` mounts cleanly from any Server Component (e.g.
`app/layout.tsx`). The mount renders on the server; Calls only happen after
hydration on the client.

## Lazy loading

If a Callable carries a heavy payload (rich-text editor, chart lib, big form),
wrap it with `React.lazy` so the chunk ships only when the first Call fires.

```tsx
import { createCallable } from 'react-call'
import { lazy, Suspense } from 'react'

const Confirm = createCallable(
  lazy(() => import('./Confirm')), // module must default-export the user component
)

<Suspense fallback={<Spinner />}>
  <Confirm />
</Suspense>
```

- The lazy module **must default-export** the user component (React.lazy
  requirement).
- The first Call waits for the chunk — pick a `fallback` that signals loading;
  `null` works but the user sees nothing happen on click.
- Subsequent Calls are instant (chunk cached by the browser).

The multi-Root throw fires at `call()` time (not at mount), which is what makes
`React.lazy` inside `<Suspense>`, StrictMode's double-invoke, and HMR re-mounts
compatible with a single Root.
