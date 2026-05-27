import type { ExampleMeta } from '~/lib/examples'

export const meta = {
  title: 'Multi-step wizard',
  description:
    'A signup flow with three steps and a back/forward navigation. State lives inside the Callable; the caller awaits a single structured response.',
  category: 'flow',
  behaviors: [],
  tags: ['multi-step', 'form', 'onboarding'],
  files: { callable: 'Wizard.tsx', caller: 'SignupButton.tsx' },
  order: 60,
} satisfies ExampleMeta
