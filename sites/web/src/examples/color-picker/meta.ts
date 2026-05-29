import type { ExampleMeta } from '~/lib/examples'

export const meta = {
  title: 'Color picker',
  description:
    'A grid of swatches. The current value is forwarded as a prop so the picker can render it as selected; resolves with the chosen hex or null.',
  category: 'picker',
  behaviors: [],
  tags: ['color', 'grid'],
  files: { callable: 'ColorPicker.tsx', caller: 'ColorSwatch.tsx' },
  order: 21,
} satisfies ExampleMeta
