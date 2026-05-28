// Pure helpers that decide which lines of an example's source get the
// Expressive Code text-marker treatment. Extracted from
// `pages/examples/[slug].astro` so the matching logic can be unit-tested
// in isolation — it's the one genuinely intricate, silently-regressable
// piece of the site (comment stripping, string-aware paren matching,
// multi-line invocation expansion).

// Lines that mark the model and expand from `(` to the matching `)`:
//   - call.end(...)                            (inside the Callable body)
//   - <Callable>.{call|upsert|end|update}(...) (from caller scope)
const EXPANDING_PATTERNS: RegExp[] = [
  /call\.end\(/g,
  /\b[A-Z]\w*\.(call|upsert|end|update)\(/g,
]

// lineStarts[i] is the absolute index of line (i+1)'s first char.
const lineOfIndex = (lineStarts: number[], idx: number): number => {
  let lo = 0
  let hi = lineStarts.length - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (lineStarts[mid] <= idx) lo = mid
    else hi = mid - 1
  }
  return lo + 1
}

/**
 * Replace every char inside line/block comments with a space (newlines
 * preserved) so the result keeps the same length and line layout as the
 * original — but patterns matching the cleaned version cannot fire on
 * comment content. String literals are left intact so a `//` inside a
 * quoted URL doesn't read as a comment.
 */
export const stripComments = (source: string): string => {
  let out = ''
  let inString: '"' | "'" | '`' | null = null
  let escaped = false
  let inLine = false
  let inBlock = false
  for (let i = 0; i < source.length; i++) {
    const ch = source[i]
    if (inLine) {
      if (ch === '\n') {
        inLine = false
        out += '\n'
      } else {
        out += ' '
      }
      continue
    }
    if (inBlock) {
      if (ch === '*' && source[i + 1] === '/') {
        inBlock = false
        out += '  '
        i++
      } else if (ch === '\n') {
        out += '\n'
      } else {
        out += ' '
      }
      continue
    }
    if (escaped) {
      escaped = false
      out += ch
      continue
    }
    if (ch === '\\') {
      escaped = true
      out += ch
      continue
    }
    if (inString) {
      if (ch === inString) inString = null
      out += ch
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch
      out += ch
      continue
    }
    if (ch === '/' && source[i + 1] === '/') {
      inLine = true
      out += '  '
      i++
      continue
    }
    if (ch === '/' && source[i + 1] === '*') {
      inBlock = true
      out += '  '
      i++
      continue
    }
    out += ch
  }
  return out
}

/**
 * Returns the index of the `)` matching the `(` at `openIdx`, walking
 * forward and skipping over string literals so a `)` inside a string
 * doesn't close the call prematurely. Falls back to the last index if
 * the source is unbalanced.
 */
export const findMatchingClose = (source: string, openIdx: number): number => {
  let depth = 1
  let inString: '"' | "'" | '`' | null = null
  let escaped = false
  for (let i = openIdx + 1; i < source.length; i++) {
    const ch = source[i]
    if (escaped) {
      escaped = false
      continue
    }
    if (ch === '\\') {
      escaped = true
      continue
    }
    if (inString) {
      if (ch === inString) inString = null
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch
      continue
    }
    if (ch === '(') depth++
    else if (ch === ')') {
      depth--
      if (depth === 0) return i
    }
  }
  return source.length - 1
}

/**
 * Produces the Expressive Code `meta` string (e.g. `{1,5,6}`) marking the
 * lines that carry the Callable model. Returns `''` when nothing matches.
 */
export const highlightedLines = (source: string): string => {
  const marked = new Set<number>()
  // Strip comments from the haystack so patterns can't fire on text that
  // lives inside `// …` or `/* … */`. Offsets and line numbers are
  // preserved, so closing-paren matching still aligns with the original.
  const cleanSource = stripComments(source)
  const lineStarts: number[] = [0]
  for (let i = 0; i < cleanSource.length; i++) {
    if (cleanSource[i] === '\n') lineStarts.push(i + 1)
  }

  // Detect `const submit = useMutationFlow(...)` so we can mark every line
  // that references the returned trigger (submit.pending, submit(payload)).
  const triggerNameMatch = cleanSource.match(
    /const\s+(\w+)\s*=\s*useMutationFlow\s*\(/,
  )
  const triggerName = triggerNameMatch ? triggerNameMatch[1] : null

  const expandingPatterns: RegExp[] = [...EXPANDING_PATTERNS]
  if (triggerName) {
    expandingPatterns.push(new RegExp(`\\b${triggerName}\\(`, 'g'))
  }

  for (const pattern of expandingPatterns) {
    pattern.lastIndex = 0
    let m = pattern.exec(cleanSource)
    while (m !== null) {
      // m[0] ends in `(` — find the matching `)` and mark every line in
      // the range so a multi-line argument list reads as one block.
      const openParenIdx = m.index + m[0].length - 1
      const closeIdx = findMatchingClose(cleanSource, openParenIdx)
      const startLine = lineOfIndex(lineStarts, m.index)
      const endLine = lineOfIndex(lineStarts, closeIdx)
      for (let l = startLine; l <= endLine; l++) marked.add(l)
      m = pattern.exec(cleanSource)
    }
  }

  // Single-line markers:
  //   - createCallable declaration site
  //   - relative-path imports that pull a sibling file in (the Callable)
  //   - useMutationFlow (import line + hook call site)
  //   - CallContext field reads (call.index/stackSize/key/root/ended)
  //   - bare references to the trigger name (submit.pending, etc.)
  const triggerWordRe = triggerName ? new RegExp(`\\b${triggerName}\\b`) : null
  const callContextFieldRe = /\bcall\.(ended|index|key|root|stackSize)\b/
  cleanSource.split('\n').forEach((line, i) => {
    if (
      line.includes('createCallable') ||
      /from\s+['"]\.\/\w+['"]/.test(line) ||
      line.includes('useMutationFlow') ||
      callContextFieldRe.test(line) ||
      triggerWordRe?.test(line)
    ) {
      marked.add(i + 1)
    }
  })

  if (marked.size === 0) return ''
  const sorted = [...marked].sort((a, b) => a - b)
  return `{${sorted.join(',')}}`
}

/** Strips the `.ts`/`.tsx` extension off a display filename. */
export const stemOf = (filename: string): string =>
  filename.replace(/\.tsx?$/, '')

/**
 * The on-disk caller imports `./callable` (folder convention), but the
 * code block shows the Callable's display filename. Rewrite the import so
 * the path matches what the reader sees.
 */
export const rewriteCallableImport = (
  callerSource: string,
  callableExport: string,
): string =>
  callerSource.replace(
    /from\s+['"]\.\/callable['"]/g,
    `from './${callableExport}'`,
  )

/** Builds the minimal App.tsx that mounts the Root next to the caller. */
export const buildAppSource = (
  callableExport: string,
  callerExport: string,
): string =>
  `import { ${callableExport} } from './${callableExport}'
import { ${callerExport} } from './${callerExport}'

export default function App() {
  return (
    <>
      <${callableExport} />
      <${callerExport} />
    </>
  )
}
`

/**
 * Marks the two lines of the generated App.tsx that carry the Root
 * contract: the Callable import and the `<Callable />` mount.
 */
export const appRootMeta = (
  appSource: string,
  callableExport: string,
): string => {
  const marked: number[] = []
  appSource.split('\n').forEach((line, i) => {
    if (
      line.includes(`from './${callableExport}'`) ||
      line.includes(`<${callableExport} />`)
    ) {
      marked.push(i + 1)
    }
  })
  return marked.length > 0 ? `{${marked.join(',')}}` : ''
}
