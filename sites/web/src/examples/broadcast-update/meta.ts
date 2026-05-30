import type { ExampleMeta } from '~/lib/examples'

export const meta = {
  title: 'Broadcast to every call',
  description:
    'Several upload pills stacked at once. One Upload.update(props) with no promise merges into every open call, so a single connection change flips them all — while each keeps its own filename.',
  category: 'notification',
  behaviors: ['update', 'stacking'],
  tags: ['broadcast', 'status', 'stack'],
  files: { callable: 'Upload.tsx', caller: 'UploadQueueButton.tsx' },
  order: 13,
} satisfies ExampleMeta
