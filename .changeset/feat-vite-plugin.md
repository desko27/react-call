---
"react-call": minor
---

**New `react-call/vite` subpath export** — a Vite plugin that auto-injects `<Callable>.displayName = '<Callable>'` for every top-level `(export) const X = createCallable(...)` it finds in dev mode. With the plugin enabled, the natural form

```tsx
export const Confirm = createCallable((props) => { /* ... */ })
```

keeps HMR persistence working without the manual displayName line.

Enable from `vite.config.ts`:

```ts
import react from '@vitejs/plugin-react'
import reactCall from 'react-call/vite'

export default {
  plugins: [react(), reactCall()],
}
```

Dev-only — no production bundle overhead. Strict detection (only top-level `(export) const` with `createCallable` imported by name from `'react-call'`, optionally renamed). Skips files that already set `displayName` manually. Requires `vite >= 8` (optional peer dependency — the runtime library itself has no Vite dependency).
