import type { ExampleMeta } from '~/lib/examples'

export const meta = {
  title: 'Bottom sheet',
  description:
    'Slides up from the bottom and back down on close — the mobile-native pattern for action menus and quick choices.',
  category: 'drawer',
  behaviors: ['exit-animation'],
  tags: ['mobile', 'actions'],
  files: { callable: 'BottomSheet.tsx', caller: 'ShareButton.tsx' },
  order: 40,
} satisfies ExampleMeta
