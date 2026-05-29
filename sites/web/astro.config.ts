import { fileURLToPath } from 'node:url'
import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import expressiveCode from 'astro-expressive-code'

// Same pattern as sites/demo: the workspace consumer aliases react-call
// to its source so library edits hot-reload without a build step.
// CI validates the published artifact separately — see ADR-0005.
const reactCallPath = (p: string) =>
  fileURLToPath(new URL(`../../packages/react-call/${p}`, import.meta.url))

export default defineConfig({
  site: 'https://react-call.desko.dev',
  // Expressive Code options live in ec.config.mjs (required when using
  // non-serializable values like the themeCssSelector function).
  integrations: [expressiveCode(), mdx(), react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: [
        { find: /^react-call$/, replacement: reactCallPath('src/main.ts') },
        {
          find: /^react-call\/mutation-flow$/,
          replacement: reactCallPath('src/mutation-flow/index.ts'),
        },
        {
          find: /^react-call\/package\.json$/,
          replacement: reactCallPath('package.json'),
        },
      ],
    },
  },
})
