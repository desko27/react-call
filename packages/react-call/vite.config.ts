import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

// vite-plugin-dts emits one rolled-up .d.ts per entry. Consumers using
// `require('react-call')` resolve through the `require` condition of
// exports, which (per publint --strict and ADR-0007) must point at a
// .d.cts file, not the ESM .d.ts. ADR-0012 added the `vite` entry.
//
// For entries with a `default` export (like the Vite plugin), the
// .d.cts must use TypeScript's `export = X` to match the CJS runtime
// shape `module.exports = X`. Without this rewrite, ATTW's
// "FalseExportDefault" check fires under node16-from-CJS: TS would
// think consumers need `require(...).default`, but at runtime the
// function is the module itself. For entries with only named exports
// (like the main runtime), the .d.ts is copy-safe as-is.
const ENTRY_NAMES = ['main', 'vite', 'mutation-flow'] as const
const DEFAULT_EXPORT_RE = /^export default (\w+);?\s*$/m
const TRAILING_EMPTY_EXPORT_RE = /^export\s*\{\s*\};?\s*$/m

const copyDtsToCts = {
  name: 'copy-dts-to-cts',
  closeBundle: async () => {
    for (const base of ENTRY_NAMES) {
      const src = resolve(import.meta.dirname, `dist/${base}.d.ts`)
      const dst = resolve(import.meta.dirname, `dist/${base}.d.cts`)
      const content = await readFile(src, 'utf-8')
      const defaultMatch = content.match(DEFAULT_EXPORT_RE)
      if (defaultMatch) {
        const rewritten = content
          .replace(DEFAULT_EXPORT_RE, `export = ${defaultMatch[1]};`)
          .replace(TRAILING_EMPTY_EXPORT_RE, '')
        await writeFile(dst, rewritten)
      } else {
        await writeFile(dst, content)
      }
    }
  },
}

export default defineConfig({
  plugins: [
    react(),
    dts({
      bundleTypes: true,
      insertTypesEntry: true,
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/__tests__/**'],
    }),
    copyDtsToCts,
  ],
  build: {
    copyPublicDir: false,
    lib: {
      entry: {
        main: resolve(import.meta.dirname, 'src/main.ts'),
        vite: resolve(import.meta.dirname, 'src/vite/index.ts'),
        'mutation-flow': resolve(
          import.meta.dirname,
          'src/mutation-flow/index.ts',
        ),
      },
      formats: ['es', 'cjs'],
      fileName: (format, name) => `${name}.${format === 'cjs' ? 'cjs' : 'js'}`,
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', 'vite'],
    },
  },
})
