import { defineEcConfig } from 'astro-expressive-code'

export default defineEcConfig({
  themes: ['github-dark'],
  useDarkModeMediaQuery: false,
  defaultProps: { wrap: true },
  styleOverrides: {
    codeFontFamily:
      'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)',
    uiFontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)',
    borderRadius: '0.5rem',
  },
})
