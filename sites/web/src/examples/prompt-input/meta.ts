import type { ExampleMeta } from '~/lib/examples'

export const meta = {
  title: 'Prompt for input',
  description:
    'window.prompt(), but with your component. Resolves with the entered string, or null on cancel.',
  category: 'dialog',
  behaviors: [],
  tags: ['text-input', 'string', 'rename'],
  files: { callable: 'Prompt.tsx', caller: 'RenameButton.tsx' },
  order: 3,
} satisfies ExampleMeta
