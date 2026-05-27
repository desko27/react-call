import type { ExampleMeta } from '~/lib/examples'

export const meta = {
  title: 'Bottom sheet',
  description:
    'Slides up from the bottom — the mobile-native pattern for action menus and quick choices.',
  category: 'drawer',
  behaviors: [],
  tags: ['mobile', 'actions'],
  files: { callable: 'BottomSheet.tsx', caller: 'ShareButton.tsx' },
  order: 40,
} satisfies ExampleMeta
