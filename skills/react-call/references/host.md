# Multi-preview Hosts (Storybook, Ladle, Histoire, react-cosmos)

A **Host** is an environment that renders multiple isolated React subtrees in
parallel for previewing. If each preview's decorator mounts `<Confirm />`, every
preview registers its own Root and `Confirm.call()` throws *"Multiple instances
of <Root> found!"* the moment any preview triggers a Call (the single-Root
invariant).

`react-call/host` exposes `mount()` — it puts a **single** shared Root in a
body-level `<div>` *outside* the previews, via its own `createRoot`. Call it once
from the host's preview entry file; your story decorators don't render Callables
at all.

```tsx
// .storybook/preview.tsx
import { mount } from 'react-call/host'
import { Confirm } from '../src/Confirm'

mount(<Confirm />)

const preview = { /* normal Storybook config */ }
export default preview
```

The mount is idempotent under HMR — saving `preview.tsx` doesn't double-mount, and
an open Call survives the edit. Your app's own `<Confirm />` mount stays where it
is; this helper only handles the preview environment. If you previously rendered
`<Confirm />` inside a story decorator, drop it from the decorator.

## Providers

The Root renders in its own React tree, separate from every preview — it does
**not** inherit context from story decorators. Pass theme/locale/router via
`wrapper`.

```tsx
mount(<Confirm />, {
  wrapper: ({ children }) => <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>,
})
```

A static `wrapper` captures props once. If providers depend on Storybook globals
(toolbar toggles, args), subscribe inside the wrapper:

```tsx
import { useGlobals } from '@storybook/preview-api'

function ReactiveTheme({ children }: { children: ReactNode }) {
  const [{ theme = 'light' }] = useGlobals()
  return <ThemeProvider theme={theme === 'dark' ? darkTheme : lightTheme}>{children}</ThemeProvider>
}

mount(<Confirm />, { wrapper: ReactiveTheme })
```

External stores (Zustand, Jotai, Redux — anything on `useSyncExternalStore`) work
the same way: both trees subscribe to the same source of truth.

## Options

```tsx
mount(element, {
  wrapper?: ComponentType<{ children: ReactNode }>,
  container?: HTMLElement, // default: <div data-react-call-host> in document.body
})
```

Works wherever React DOM does.
