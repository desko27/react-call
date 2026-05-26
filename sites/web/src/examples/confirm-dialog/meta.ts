import type { ExampleMeta } from '~/lib/examples'

export const meta = {
  title: 'Confirm dialog',
  description:
    'Ask the user to confirm a destructive action before it runs. Returns a boolean to the caller.',
  category: 'dialog',
  behaviors: [],
  tags: ['destructive', 'boolean'],
  files: {
    callable: 'Confirm.tsx',
    caller: 'DeleteButton.tsx',
  },
  order: 1,
} satisfies ExampleMeta
