import type { ExampleMeta } from '~/lib/examples'

export const meta = {
  title: 'Permission consent',
  description:
    'OAuth-style "do you allow X?" prompt. Resolves with allow or deny — a tagged response, not a boolean.',
  category: 'flow',
  behaviors: [],
  tags: ['oauth', 'consent'],
  files: { callable: 'Permission.tsx', caller: 'ConnectButton.tsx' },
  order: 61,
} satisfies ExampleMeta
