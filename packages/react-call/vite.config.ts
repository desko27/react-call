import { copyFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

// vite-plugin-dts emits a single rolled-up dist/main.d.ts. Consumers
// using `require('react-call')` resolve through the `require` condition
// of exports, which (per publint --strict and ADR-0007) must point at a
// .d.cts file, not the ESM .d.ts. The contents are identical for this
// library, so the simplest portable solution is to copy after build.
const copyDtsToCts = {
  name: 'copy-dts-to-cts',
  closeBundle: async () => {
    await copyFile(
      resolve(import.meta.dirname, 'dist/main.d.ts'),
      resolve(import.meta.dirname, 'dist/main.d.cts'),
    )
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
      fileName: 'main',
      entry: resolve(import.meta.dirname, 'src/main.ts'),
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime'],
    },
  },
})
