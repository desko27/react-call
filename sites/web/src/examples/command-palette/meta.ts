import type { ExampleMeta } from '~/lib/examples'

export const meta = {
  title: 'Command palette (⌘K)',
  description:
    'A searchable list of actions. Keyboard-driven: arrow keys to navigate, Enter to run, Esc to dismiss.',
  category: 'menu',
  behaviors: [],
  tags: ['cmdk', 'search', 'keyboard'],
  files: {
    callable: 'CommandPalette.tsx',
    caller: 'CommandPaletteTrigger.tsx',
  },
  order: 31,
} satisfies ExampleMeta
