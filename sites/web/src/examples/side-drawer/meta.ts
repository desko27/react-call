import type { ExampleMeta } from '~/lib/examples'

export const meta = {
  title: 'Side drawer',
  description:
    'A panel that slides in from the edge. Useful for settings, filters, and detail views. Callable accepts a ReactNode body via props.',
  category: 'drawer',
  behaviors: [],
  tags: ['settings', 'panel'],
  files: { callable: 'SideDrawer.tsx', caller: 'OpenSettingsButton.tsx' },
  order: 41,
} satisfies ExampleMeta
