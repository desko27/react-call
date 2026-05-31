import { readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

// Drift guard for the published consumer skill (see ADR-0021). The skill at
// `skills/react-call/` teaches an LLM the public API; if a `react-call` export
// or subpath it imports is renamed/removed, this test fails so the skill is
// updated in the same PR rather than silently lying to consumers.

const REPO_ROOT = join(import.meta.dirname, '..', '..', '..', '..')
const PKG = join(REPO_ROOT, 'packages', 'react-call')
const SKILL_DIR = join(REPO_ROOT, 'skills', 'react-call')

const SKILL_FILES = [
  join(SKILL_DIR, 'SKILL.md'),
  join(SKILL_DIR, 'references', 'mutation-flow.md'),
  join(SKILL_DIR, 'references', 'host.md'),
  join(SKILL_DIR, 'references', 'ssr-and-lazy.md'),
  join(SKILL_DIR, 'references', 'types.md'),
]

// Subpath specifier -> source entry whose exports back it.
const ENTRY_SOURCES: Record<string, string> = {
  'react-call': join(PKG, 'src', 'main.ts'),
  'react-call/mutation-flow': join(PKG, 'src', 'mutation-flow', 'index.ts'),
  'react-call/host': join(PKG, 'src', 'host', 'index.tsx'),
  'react-call/vite': join(PKG, 'src', 'vite', 'index.ts'),
}

const rel = (file: string) => relative(REPO_ROOT, file)

/** Names a source file exports (incl. type-only and re-exports), plus default. */
function exportedNames(src: string): {
  names: Set<string>
  hasDefault: boolean
} {
  const names = new Set<string>()
  // `export { a, b as c } [from '…']` and `export type { … }`
  for (const m of src.matchAll(/export\s+(?:type\s+)?\{([^}]*)\}/g)) {
    for (const raw of m[1].split(',')) {
      const name = raw
        .trim()
        .replace(/^type\s+/, '')
        .split(/\s+as\s+/)[0]
        .trim()
      if (name) names.add(name)
    }
  }
  // `export const|function|class|interface|type NAME`
  const decl =
    /export\s+(?:async\s+)?(?:const|function|class|interface|type)\s+([A-Za-z0-9_$]+)/g
  for (const m of src.matchAll(decl)) names.add(m[1])
  return { names, hasDefault: /export\s+default\b/.test(src) }
}

/** Parse the binding clause of an `import … from` statement. */
function parseClause(clause: string): { named: string[]; hasDefault: boolean } {
  const named: string[] = []
  let rest = clause.trim()
  const brace = rest.match(/\{([^}]*)\}/)
  if (brace) {
    for (const raw of brace[1].split(',')) {
      const t = raw.trim()
      if (!t) continue
      const name = t
        .replace(/^type\s+/, '')
        .split(/\s+as\s+/)[0]
        .trim()
      if (name) named.push(name)
    }
    rest = rest.replace(brace[0], '').replace(/,/g, ' ')
  }
  rest = rest.replace(/^type\b/, '').trim()
  const def = rest.match(/^([A-Za-z0-9_$*]+)/)
  const hasDefault = !!def && def[1] !== '*'
  return { named, hasDefault }
}

interface ImportRef {
  file: string
  spec: string
  named: string[]
  hasDefault: boolean
}

function extractReactCallImports(file: string): ImportRef[] {
  const text = readFileSync(file, 'utf8')
  const refs: ImportRef[] = []
  const re = /import\s+([^;]*?)\s+from\s+['"](react-call(?:\/[^'"]+)?)['"]/g
  for (const m of text.matchAll(re)) {
    const { named, hasDefault } = parseClause(m[1])
    refs.push({ file, spec: m[2], named, hasDefault })
  }
  return refs
}

const pkg = JSON.parse(readFileSync(join(PKG, 'package.json'), 'utf8'))
const validSubpaths = new Set(
  Object.keys(pkg.exports)
    .filter((k) => k !== './package.json')
    .map((k) => (k === '.' ? 'react-call' : k.replace(/^\.\//, 'react-call/'))),
)

const refs = SKILL_FILES.flatMap(extractReactCallImports)
const sourceExports = new Map<string, ReturnType<typeof exportedNames>>()
for (const spec of Object.keys(ENTRY_SOURCES)) {
  sourceExports.set(
    spec,
    exportedNames(readFileSync(ENTRY_SOURCES[spec], 'utf8')),
  )
}

describe('react-call skill stays in sync with the public API (ADR-0021)', () => {
  it('finds the react-call imports it is meant to guard', () => {
    // Catches a broken path/glob silently making the suite vacuous.
    expect(refs.length).toBeGreaterThan(0)
  })

  it('imports only declared package subpaths', () => {
    for (const ref of refs) {
      expect(
        [...validSubpaths],
        `${ref.spec} imported in ${rel(ref.file)} is not a package export`,
      ).toContain(ref.spec)
    }
  })

  it('imports only real public exports', () => {
    for (const ref of refs) {
      const exp = sourceExports.get(ref.spec)
      if (!exp) continue // unknown subpath already failed above
      for (const name of ref.named) {
        expect(
          [...exp.names],
          `${name} from '${ref.spec}' (in ${rel(ref.file)}) is not exported`,
        ).toContain(name)
      }
      if (ref.hasDefault) {
        expect(exp.hasDefault, `'${ref.spec}' has no default export`).toBe(true)
      }
    }
  })
})
