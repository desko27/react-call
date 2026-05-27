import type { ExampleMeta } from '~/lib/examples'

export const meta = {
  title: 'Alert dialog',
  description:
    'A one-button notice. The caller awaits acknowledgement; the response type is void — the act of closing is the value.',
  category: 'dialog',
  behaviors: [],
  tags: ['info', 'one-button'],
  files: { callable: 'Alert.tsx', caller: 'ShowAlertButton.tsx' },
  order: 2,
} satisfies ExampleMeta
