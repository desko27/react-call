import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import dts from 'vite-plugin-dts'
import { nodeExternals } from 'rollup-plugin-node-externals'
import { resolve } from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodeExternals(),
    tsconfigPaths(),
    dts({ rollupTypes: true, tsconfigPath: 'tsconfig.lib.json' }),
  ],
  build: {
    copyPublicDir: false,
    lib: {
      fileName: 'main',
      entry: resolve(__dirname, 'lib/main.ts'),
      formats: ['es', 'cjs'],
    },
  },
})
