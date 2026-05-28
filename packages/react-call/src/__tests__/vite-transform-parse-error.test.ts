import { describe, expect, test, vi } from 'vitest'

// `parseSync` (oxc, re-exported by Vite) is error-tolerant: it recovers
// from bad syntax and returns a partial AST rather than throwing, so the
// `catch` in transformInjectDisplayNames is only reachable on a genuine
// parser failure (e.g. an oxc panic). Mock it to throw so we can assert
// the contract: a parser failure degrades to null — no injection —
// instead of crashing the consumer's dev server. Scoped to its own file
// because vi.mock is file-wide and would break the real-parser tests.
vi.mock('vite', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vite')>()
  return {
    ...actual,
    parseSync: () => {
      throw new Error('simulated parser panic')
    },
  }
})

const { transformInjectDisplayNames } = await import('../vite/transform')

describe('react-call/vite — transform parse failure', () => {
  test('returns null when the parser throws', () => {
    const code = [
      `import { createCallable } from 'react-call'`,
      `export const Confirm = createCallable((p) => null)`,
    ].join('\n')
    expect(transformInjectDisplayNames(code, '/proj/src/Foo.tsx')).toBeNull()
  })
})
