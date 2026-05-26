import type { ExampleMeta } from '~/lib/examples'

export const meta = {
  title: 'Item picker',
  description:
    'Show a list and resolve with the chosen item. Caller-side cancellation returns null; selecting an item returns the object itself.',
  category: 'picker',
  behaviors: [],
  tags: ['list', 'select'],
  files: {
    callable: 'Picker.tsx',
    caller: 'FruitPickerTrigger.tsx',
  },
  order: 20,
} satisfies ExampleMeta
