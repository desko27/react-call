---
"react-call": minor
---

**New `react-call/host` subpath export** — an imperative `mount(element, options?)` helper for environments that render multiple isolated React subtrees in parallel for previewing (Storybook autodocs page, Ladle, Histoire, react-cosmos). Mounts a single shared Root in a body-level `<div data-react-call-host>` via its own `createRoot`, sidestepping the multi-root call-time throw that decorator-per-story patterns otherwise hit.

```tsx
// .storybook/preview.tsx
import { mount } from 'react-call/host'
import { Confirm } from '../src/Confirm'

mount(<Confirm />)
```

Options:

- `wrapper?: ComponentType<{ children: ReactNode }>` — wraps the rendered element in providers (theme, i18n, router). The wrapper runs inside the Confirm's own React tree, so context from story decorators does **not** propagate; for reactive providers tied to host state (e.g. Storybook globals), subscribe inside the wrapper via `useGlobals` from `@storybook/preview-api` or an external store.
- `container?: HTMLElement` — mount target; defaults to a fresh `<div data-react-call-host>` appended to `document.body`.

Idempotent under HMR: subsequent `mount()` calls re-render against the cached root (kept on `globalThis[Symbol.for('react-call.host')]`) rather than creating a second one, so an open `Confirm.call()` survives edits to `preview.tsx`.

Adds `react-dom` as an optional peer dependency (mirrors the `vite` optional peer). Consumers who don't import `react-call/host` see no install change.

See [ADR-0016](https://github.com/desko27/react-call/blob/main/docs/adr/0016-react-call-host-imperative-mount.md) for the design discussion.
