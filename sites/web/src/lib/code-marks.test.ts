import { describe, expect, test } from 'vitest'
import {
  appRootMeta,
  buildAppSource,
  findMatchingClose,
  highlightedLines,
  rewriteCallableImport,
  stemOf,
  stripComments,
} from './code-marks'

const lines = (...l: string[]) => l.join('\n')

describe('stripComments', () => {
  test('blanks a line comment but preserves length and layout', () => {
    const src = 'a // b'
    const out = stripComments(src)
    expect(out).toBe('a     ')
    expect(out).toHaveLength(src.length)
    expect(out).not.toContain('/')
  })

  test('blanks a block comment, keeping newlines', () => {
    const src = lines('x /* one', 'two */ y')
    const out = stripComments(src)
    expect(out).toHaveLength(src.length)
    expect(out.split('\n')).toHaveLength(2)
    expect(out).not.toContain('one')
    expect(out).not.toContain('two')
    expect(out.startsWith('x ')).toBe(true)
    expect(out.endsWith(' y')).toBe(true)
  })

  test('leaves a // inside a string literal intact', () => {
    const src = "const u = 'http://example.com'"
    expect(stripComments(src)).toBe(src)
  })

  test('does not treat // inside a template literal as a comment', () => {
    const src = 'const u = `http://x`'
    expect(stripComments(src)).toBe(src)
  })
})

describe('findMatchingClose', () => {
  test('matches a flat call', () => {
    const src = 'foo(a, b)'
    expect(findMatchingClose(src, src.indexOf('('))).toBe(src.length - 1)
  })

  test('matches across nested parens', () => {
    const src = 'f(g(x))'
    expect(findMatchingClose(src, 1)).toBe(6)
  })

  test('ignores a close paren inside a string', () => {
    const src = "f(')')"
    expect(findMatchingClose(src, 1)).toBe(5)
  })

  test('falls back to the last index when unbalanced', () => {
    const src = 'f(a, b'
    expect(findMatchingClose(src, 1)).toBe(src.length - 1)
  })
})

describe('highlightedLines', () => {
  test('returns empty when nothing matches', () => {
    expect(highlightedLines(lines('const x = 1', 'const y = 2'))).toBe('')
  })

  test('marks the createCallable declaration and a call.end on its own line', () => {
    const src = lines(
      "import { createCallable } from 'react-call'", // 1
      '', // 2
      'export const Confirm = createCallable(({ call }) => (', // 3
      '  <button onClick={() => call.end(true)}>OK</button>', // 4
      '))', // 5
    )
    expect(highlightedLines(src)).toBe('{1,3,4}')
  })

  test('expands a multi-line caller invocation and marks the sibling import', () => {
    const src = lines(
      "import { Confirm } from './callable'", // 1 (relative import)
      '', // 2
      'const yes = await Confirm.call({', // 3 (expanding open)
      "  message: 'Sure?',", // 4
      '})', // 5 (close)
    )
    expect(highlightedLines(src)).toBe('{1,3,4,5}')
  })

  test('does NOT mark a line whose only match lives in a comment', () => {
    const src = lines(
      '// call.index gives the position', // 1: match only in comment
      'const x = 1', // 2
    )
    expect(highlightedLines(src)).toBe('')
  })

  test('marks CallContext field reads', () => {
    const src = lines(
      'const offset = call.index * 12', // 1
      'const total = call.stackSize', // 2
    )
    expect(highlightedLines(src)).toBe('{1,2}')
  })

  test('detects the useMutationFlow trigger and marks its references', () => {
    const src = lines(
      'const submit = useMutationFlow(call, fn)', // 1: hook + trigger word
      '<button disabled={submit.pending}>', // 2: trigger word
      '  onClick={() => submit({ a: 1 })}', // 3: trigger call + word
    )
    expect(highlightedLines(src)).toBe('{1,2,3}')
  })

  test('ignores a close paren inside a string when expanding', () => {
    const src = lines(
      "Confirm.call({ label: ')' })", // 1: the ) in the string must not end it early
      'const after = 1', // 2: must stay unmarked
    )
    expect(highlightedLines(src)).toBe('{1}')
  })
})

describe('stemOf', () => {
  test('strips .tsx and .ts', () => {
    expect(stemOf('Confirm.tsx')).toBe('Confirm')
    expect(stemOf('helpers.ts')).toBe('helpers')
    expect(stemOf('NoExt')).toBe('NoExt')
  })
})

describe('rewriteCallableImport', () => {
  test('rewrites ./callable to the display filename', () => {
    const src = "import { Confirm } from './callable'"
    expect(rewriteCallableImport(src, 'Confirm')).toBe(
      "import { Confirm } from './Confirm'",
    )
  })

  test('leaves unrelated imports untouched', () => {
    const src = "import { useState } from 'react'"
    expect(rewriteCallableImport(src, 'Confirm')).toBe(src)
  })
})

describe('buildAppSource + appRootMeta', () => {
  test('mounts both components and marks the Root contract lines', () => {
    const app = buildAppSource('Confirm', 'DeleteButton')
    expect(app).toContain("import { Confirm } from './Confirm'")
    expect(app).toContain('<Confirm />')
    expect(app).toContain('<DeleteButton />')
    // Import is line 1; the <Confirm /> mount is line 7.
    expect(appRootMeta(app, 'Confirm')).toBe('{1,7}')
  })
})
