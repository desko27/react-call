import type { ExampleMeta } from '~/lib/examples'

export const meta = {
  title: 'Nested dialog',
  description:
    'A Callable that opens itself. Each open instance can spawn the same Callable from inside its own JSX — the library tracks the stack and resolves each promise independently.',
  category: 'dialog',
  behaviors: ['nested'],
  tags: ['recursion', 'stack'],
  files: { callable: 'NestedDialog.tsx', caller: 'OpenNestedButton.tsx' },
  order: 4,
} satisfies ExampleMeta
