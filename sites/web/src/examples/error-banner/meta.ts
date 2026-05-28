import type { ExampleMeta } from '~/lib/examples'

export const meta = {
  title: 'Auto-dismissing error',
  description:
    'A transient banner that closes itself via setTimeout. Multiple calls stack — each error gets its own banner.',
  category: 'notification',
  behaviors: ['stacking'],
  tags: ['error', 'auto-dismiss', 'stack'],
  files: { callable: 'ErrorBanner.tsx', caller: 'TriggerErrorButton.tsx' },
  order: 11,
} satisfies ExampleMeta
