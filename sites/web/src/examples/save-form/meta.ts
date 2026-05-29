import type { ExampleMeta } from '~/lib/examples'

export const meta = {
  title: 'Save form with mutation flow',
  description:
    'A dialog with an async submit. useMutationFlow tracks pending; on throw, the call stays open so the user can retry without losing their input.',
  category: 'dialog',
  behaviors: ['mutation-flow'],
  tags: ['async', 'submit', 'retry'],
  files: {
    callable: 'SaveForm.tsx',
    caller: 'NewItemButton.tsx',
  },
  order: 5,
} satisfies ExampleMeta
