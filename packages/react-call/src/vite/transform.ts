import { parseSync } from 'vite'

// AST helpers for the react-call/vite plugin (ADR-0012). Kept in a
// separate module so the public entry (./index.ts) exports nothing but
// the default factory — avoids the rollup MIXED_EXPORTS warning that
// fires when an entry mixes default + named exports.

interface ESTreeNode {
  type: string
  [k: string]: unknown
}

interface ProgramAst {
  program?: { body?: ESTreeNode[] }
}

const EXTENSION_TO_LANG: Record<string, 'ts' | 'tsx' | 'js' | 'jsx'> = {
  ts: 'ts',
  mts: 'ts',
  cts: 'ts',
  tsx: 'tsx',
  js: 'js',
  mjs: 'js',
  cjs: 'js',
  jsx: 'jsx',
}

function pickLang(id: string): 'ts' | 'tsx' | 'js' | 'jsx' {
  const ext = id.match(/\.([^.]+)(?:\?|$)/)?.[1]?.toLowerCase() ?? 'tsx'
  return EXTENSION_TO_LANG[ext] ?? 'tsx'
}

function findLocalCreateCallableNames(body: ESTreeNode[]): Set<string> {
  const names = new Set<string>()
  for (const node of body) {
    if (node.type !== 'ImportDeclaration') continue
    const source = (node as { source?: { value?: unknown } }).source
    if (source?.value !== 'react-call') continue
    const specifiers = (node as { specifiers?: ESTreeNode[] }).specifiers ?? []
    for (const spec of specifiers) {
      if (spec.type !== 'ImportSpecifier') continue
      const imported = (spec as { imported?: { name?: unknown } }).imported
      if (imported?.name !== 'createCallable') continue
      const local = (spec as { local?: { name?: string } }).local
      if (local?.name) names.add(local.name)
    }
  }
  return names
}

function findManualDisplayNames(body: ESTreeNode[]): Set<string> {
  const set = new Set<string>()
  for (const node of body) {
    if (node.type !== 'ExpressionStatement') continue
    const expr = (node as { expression?: ESTreeNode }).expression
    if (expr?.type !== 'AssignmentExpression') continue
    const e = expr as { operator?: string; left?: ESTreeNode }
    if (e.operator !== '=') continue
    const left = e.left
    if (left?.type !== 'MemberExpression') continue
    const m = left as {
      computed?: boolean
      object?: { type?: string; name?: string }
      property?: { type?: string; name?: string }
    }
    if (m.computed) continue
    if (m.object?.type !== 'Identifier') continue
    if (m.property?.type !== 'Identifier') continue
    if (m.property.name !== 'displayName') continue
    if (m.object.name) set.add(m.object.name)
  }
  return set
}

function findCallableDeclarations(
  body: ESTreeNode[],
  localCreateCallableNames: Set<string>,
): string[] {
  const found: string[] = []
  for (const topNode of body) {
    let varDecl: ESTreeNode | null = null
    if (topNode.type === 'VariableDeclaration') varDecl = topNode
    else if (topNode.type === 'ExportNamedDeclaration') {
      const inner = (topNode as { declaration?: ESTreeNode }).declaration
      if (inner?.type === 'VariableDeclaration') varDecl = inner
    }
    if (!varDecl) continue
    const v = varDecl as {
      kind?: string
      declarations?: Array<{
        id?: { type?: string; name?: string }
        init?: ESTreeNode
      }>
    }
    if (v.kind !== 'const') continue
    for (const decl of v.declarations ?? []) {
      if (decl.id?.type !== 'Identifier' || !decl.id.name) continue
      const init = decl.init
      if (init?.type !== 'CallExpression') continue
      const callee = (init as { callee?: { type?: string; name?: string } })
        .callee
      if (callee?.type !== 'Identifier' || !callee.name) continue
      if (!localCreateCallableNames.has(callee.name)) continue
      found.push(decl.id.name)
    }
  }
  return found
}

export function transformInjectDisplayNames(
  code: string,
  id: string,
): string | null {
  if (!code.includes('createCallable')) return null
  let ast: ProgramAst
  try {
    ast = parseSync(id, code, { lang: pickLang(id) }) as unknown as ProgramAst
  } catch {
    return null
  }
  const body = ast.program?.body ?? []
  const localNames = findLocalCreateCallableNames(body)
  if (!localNames.size) return null
  const manual = findManualDisplayNames(body)
  const callables = findCallableDeclarations(body, localNames).filter(
    (n) => !manual.has(n),
  )
  if (!callables.length) return null
  const injection = `\n${callables
    .map((n) => `${n}.displayName = ${JSON.stringify(n)};`)
    .join('\n')}\n`
  return code + injection
}
