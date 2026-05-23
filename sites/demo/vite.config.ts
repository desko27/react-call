import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The demo is a development fixture, not a consumer. Vite resolves
// `react-call` to packages/react-call/src/ so library edits hot-reload
// without a build step. CI validates the publishable artifact
// separately — see ADR-0005.
const reactCallPath = (p: string) =>
  fileURLToPath(new URL(`../../packages/react-call/${p}`, import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
