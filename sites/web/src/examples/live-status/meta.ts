import type { ExampleMeta } from '~/lib/examples'

export const meta = {
  title: 'Live status update',
  description:
    'A pinned status pill. The caller pushes new props into the open call as work advances — same instance, updated from the outside via the promise reference.',
  category: 'notification',
  behaviors: ['update'],
  tags: ['status', 'live', 'tracker'],
  files: { callable: 'Status.tsx', caller: 'PlaceOrderButton.tsx' },
  order: 12,
} satisfies ExampleMeta
