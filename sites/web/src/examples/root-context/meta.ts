import type { ExampleMeta } from '~/lib/examples'

export const meta = {
  title: 'Account-aware dialog',
  description:
    'A dialog that greets the signed-in user without the caller ever passing their name. The user lives on a Root prop and reaches every call through call.root — separate from the per-call props.',
  category: 'dialog',
  behaviors: ['root-props'],
  tags: ['root-props', 'context', 'shared'],
  files: { callable: 'Greeter.tsx', caller: 'AskButton.tsx' },
  rootProps: 'userName="Ada Lovelace"',
  order: 6,
} satisfies ExampleMeta
