import type { ExampleMeta } from '~/lib/examples'

export const meta = {
  title: 'Image lightbox',
  description:
    'Click a thumbnail, open the full image as an overlay. The Callable closes on backdrop click or Escape.',
  category: 'overlay',
  behaviors: [],
  tags: ['gallery', 'image'],
  files: { callable: 'Lightbox.tsx', caller: 'Gallery.tsx' },
  order: 50,
} satisfies ExampleMeta
