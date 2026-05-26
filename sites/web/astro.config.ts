import { fileURLToPath } from 'node:url'
import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
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
  integrations: [
    expressiveCode({
      themes: ['github-light', 'github-dark'],
      themeCssSelector: (theme) =>
        theme.name === 'github-dark' ? '.dark' : ':root',
      defaultProps: { wrap: true },
      styleOverrides: {
        codeFontFamily:
          'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)',
        uiFontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)',
        borderRadius: '0.5rem',
      },
    }),
    mdx(),
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: [
        { find: /^react-call$/, replacement: reactCallPath('src/main.ts') },
        {
          find: /^react-call\/mutation-flow$/,
          replacement: reactCallPath('src/mutation-flow.ts'),
        },
        {
          find: /^react-call\/package\.json$/,
          replacement: reactCallPath('package.json'),
        },
      ],
    },
  },
})
