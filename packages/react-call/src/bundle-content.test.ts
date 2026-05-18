import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// React Native compatibility guard — see ADR-0007.
// The library claims "✓ React Native" in the README. RN runs JavaScript
// without a DOM, without window/document/navigator, and without react-dom.
// Any reference to these in the published bundle would crash an RN
// consumer at import time. This test scans the dist for forbidden symbols
// the moment they slip into a build, instead of waiting for an RN user to
// file an issue.

const DIST = resolve(__dirname, '..', 'dist')

const FORBIDDEN_SYMBOLS = [
  'react-dom',
  'document.',
  'window.',
  'navigator.',
  'localStorage',
  'sessionStorage',
  'HTMLElement',
  'Element.prototype',
  'CSSStyleDeclaration',
] as const

describe('bundle content — ADR-0007 React Native compatibility', () => {
  it.each(['main.js', 'main.cjs'] as const)(
    'dist/%s has no DOM-only / react-dom references',
    async (filename) => {
      const code = await readFile(resolve(DIST, filename), 'utf-8')
      for (const symbol of FORBIDDEN_SYMBOLS) {
        expect(
          code,
          `forbidden symbol "${symbol}" found in ${filename}`,
        ).not.toContain(symbol)
      }
    },
  )
})
