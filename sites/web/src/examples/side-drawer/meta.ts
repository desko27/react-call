import type { ExampleMeta } from '~/lib/examples'

export const meta = {
  title: 'Settings drawer',
  description:
    'A panel that slides in from the edge and slides back out on close. Props carry the initial settings as plain data; the Callable owns its own form state and resolves with the saved values, or null if the user dismisses.',
  category: 'drawer',
  behaviors: ['exit-animation'],
  tags: ['settings', 'panel', 'form'],
  files: { callable: 'SettingsDrawer.tsx', caller: 'OpenSettingsButton.tsx' },
  order: 41,
} satisfies ExampleMeta
