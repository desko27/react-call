import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Same source-alias pattern as sites/demo (ADR-0005): edit the lib
// source and see HMR in this playground without a build step.
const reactCallPath = (p: string) =>
  fileURLToPath(new URL(`../../packages/react-call/${p}`, import.meta.url))

export default defineConfig({
  plugins: [react()],
  server: { port: 5174 },
  resolve: {
    alias: [
      { find: /^react-call$/, replacement: reactCallPath('src/main.ts') },
      {
        find: /^react-call\/package\.json$/,
        replacement: reactCallPath('package.json'),
      },
    ],
  },
})
