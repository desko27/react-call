import type { ExampleMeta } from '~/lib/examples'

export const meta = {
  title: 'Resolve from the caller',
  description:
    "The promise from call() is the call's identity. A timeout in the caller settles that exact open call from the outside with Approval.end(promise, false) — delivering a response without any in-dialog click.",
  category: 'flow',
  behaviors: ['end-from-caller'],
  tags: ['timeout', 'external', 'promise'],
  files: { callable: 'Approval.tsx', caller: 'RequestApprovalButton.tsx' },
  order: 62,
} satisfies ExampleMeta
