import type { ExampleMeta } from '~/lib/examples'

export const meta = {
  title: 'Context menu',
  description:
    'A positioned menu opened on right-click. The caller forwards the cursor coordinates so the Callable renders at the click site.',
  category: 'menu',
  behaviors: [],
  tags: ['right-click', 'positioned'],
  files: {
    callable: 'ContextMenu.tsx',
    caller: 'ItemRow.tsx',
  },
  order: 30,
} satisfies ExampleMeta
