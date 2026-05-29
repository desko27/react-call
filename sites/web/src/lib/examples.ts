export type Category =
  | 'dialog'
  | 'picker'
  | 'notification'
  | 'menu'
  | 'drawer'
  | 'overlay'
  | 'flow'

export type Behavior =
  | 'update'
  | 'upsert'
  | 'mutation-flow'
  | 'stacking'
  | 'nested'

export interface ExampleMeta {
  title: string
  description: string
  category: Category
  behaviors?: Behavior[]
  tags?: string[]
  files: {
    callable: string
    caller: string
  }
  order?: number
}

interface RawMeta {
  meta: ExampleMeta
}

const metaModules = import.meta.glob<RawMeta>('../examples/*/meta.ts', {
  eager: true,
})

const callableSourceModules = import.meta.glob<string>(
  '../examples/*/callable.tsx',
  { query: '?raw', import: 'default', eager: true },
)

const callerSourceModules = import.meta.glob<string>(
  '../examples/*/caller.tsx',
  { query: '?raw', import: 'default', eager: true },
)

// Index file presence is asserted via the meta entry — the actual component
// is loaded client-side from ExampleHost (which owns its own glob).
const indexFilenames = new Set(
  Object.keys(
    import.meta.glob('../examples/*/index.tsx', {
      query: '?url',
      import: 'default',
      eager: true,
    }),
  ),
)

const slugFromPath = (path: string) => {
  const match = path.match(/\.\.\/examples\/([^/]+)\//)
  if (!match) throw new Error(`Cannot derive slug from path: ${path}`)
  return match[1]
}

export interface Example {
  slug: string
  meta: ExampleMeta
  callableSource: string
  callerSource: string
}

const buildIndex = (): Map<string, Example> => {
  const map = new Map<string, Example>()
  for (const [path, mod] of Object.entries(metaModules)) {
    const slug = slugFromPath(path)
    const callableSource =
      callableSourceModules[`../examples/${slug}/callable.tsx`]
    const callerSource = callerSourceModules[`../examples/${slug}/caller.tsx`]
    if (
      !callableSource ||
      !callerSource ||
      !indexFilenames.has(`../examples/${slug}/index.tsx`)
    ) {
      throw new Error(
        `Example "${slug}" is missing required files (callable.tsx, caller.tsx, index.tsx).`,
      )
    }
    map.set(slug, {
      slug,
      meta: mod.meta,
      callableSource,
      callerSource,
    })
  }
  return map
}

const index = buildIndex()

export const getAllExamples = (): Example[] =>
  [...index.values()].sort((a, b) => {
    const orderA = a.meta.order ?? 100
    const orderB = b.meta.order ?? 100
    if (orderA !== orderB) return orderA - orderB
    return a.meta.title.localeCompare(b.meta.title)
  })

export const getExample = (slug: string): Example | undefined => index.get(slug)

export const CATEGORY_LABELS: Record<Category, string> = {
  dialog: 'Dialog',
  picker: 'Picker',
  notification: 'Notification',
  menu: 'Menu',
  drawer: 'Drawer',
  overlay: 'Overlay',
  flow: 'Flow',
}

export const BEHAVIOR_LABELS: Record<Behavior, string> = {
  update: 'Update',
  upsert: 'Upsert',
  'mutation-flow': 'Mutation flow',
  stacking: 'Stacking',
  nested: 'Nested',
}
