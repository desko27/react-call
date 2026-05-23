import type { Plugin } from 'vite'
import { transformInjectDisplayNames } from './transform'

// react-call/vite — auto-injects `<Callable>.displayName = '<Callable>'`
// for every top-level `(export)? const <Callable> = createCallable(...)`
// the consumer writes (ADR-0012). Strict + rename detection: only
// works for direct named imports of `createCallable` from 'react-call'
// (with optional `as` rename). Namespace imports, default exports,
// nested-in-function declarations, and `.Root` chains are skipped —
// the consumer can still set `displayName` manually in those cases.
// Dev-only: gated on `config.command === 'serve'` so the consumer's
// production build is byte-identical to one built without the plugin.

const SUPPORTED_FILE_RE = /\.(?:[cm]?[jt]sx?)$/

// biome-ignore lint/style/noDefaultExport: Vite plugin convention is default export (`import reactCall from 'react-call/vite'`).
export default function reactCall(): Plugin {
  let active = false
  return {
    name: 'react-call',
    enforce: 'pre',
    configResolved(config) {
      active = config.command === 'serve' || config.mode === 'development'
    },
    transform(code, id) {
      if (!active) return null
      if (id.includes('node_modules')) return null
      if (!SUPPORTED_FILE_RE.test(id)) return null
      const out = transformInjectDisplayNames(code, id)
      if (out === null) return null
      return { code: out, map: null }
    },
  }
}
