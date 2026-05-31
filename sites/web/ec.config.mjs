import { defineEcConfig } from 'astro-expressive-code'

export default defineEcConfig({
  themes: ['github-light', 'github-dark'],
  useDarkModeMediaQuery: false,
  themeCssSelector: (theme) => (theme.type === 'dark' ? '.dark' : false),
  // Long lines scroll horizontally rather than wrapping, so each line
  // keeps its place — wrapping garbles code structure, worst on mobile.
  defaultProps: { wrap: false },
  styleOverrides: {
    codeFontFamily:
      'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)',
    uiFontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)',
    borderRadius: '0.5rem',
    textMarkers: {
      // Use the brand accent for line highlights so the marked
      // createCallable / call.end / .call( lines tie back to the rest
      // of the site visually.
      markBackground: 'rgba(225, 29, 116, 0.14)',
      markBorderColor: 'rgba(225, 29, 116, 0.55)',
    },
  },
})
