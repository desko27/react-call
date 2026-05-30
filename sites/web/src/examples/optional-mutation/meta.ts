import type { ExampleMeta } from '~/lib/examples'

export const meta = {
  title: 'Confirm with optional async',
  description:
    'One Callable, two callers. Omit mutationFn and submit().orEnd(true) closes instantly with a fallback response; pass one and the async handler decides when to close — the same Confirm serves both.',
  category: 'dialog',
  behaviors: ['mutation-flow'],
  tags: ['optional', 'orEnd', 'fallback'],
  files: { callable: 'Confirm.tsx', caller: 'PublishButton.tsx' },
  order: 7,
} satisfies ExampleMeta
