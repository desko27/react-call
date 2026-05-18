import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodeExternals } from 'rollup-plugin-node-externals'
import dts from 'vite-plugin-dts'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react(), nodeExternals(), dts({ rollupTypes: true })],
  build: {
    copyPublicDir: false,
    lib: {
      fileName: 'main',
      entry: resolve(__dirname, 'src/main.ts'),
      formats: ['es', 'cjs'],
    },
  },
})
