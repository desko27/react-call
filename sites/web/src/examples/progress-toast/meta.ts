import type { ExampleMeta } from '~/lib/examples'

export const meta = {
  title: 'Progress toast',
  description:
    'A singleton toast that updates itself as work progresses. Uses upsert() so consecutive calls mutate the same instance.',
  category: 'notification',
  behaviors: ['upsert'],
  tags: ['progress', 'singleton'],
  files: {
    callable: 'Toast.tsx',
    caller: 'DownloadButton.tsx',
  },
  order: 10,
} satisfies ExampleMeta
