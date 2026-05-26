import { useState } from 'react'
import { createCallable } from 'react-call'
import { type MutationFn, useMutationFlow } from 'react-call/mutation-flow'

interface Props {
  initialName?: string
  mutationFn: MutationFn<string, { name: string }>
}

export const SaveForm = createCallable<Props, string>(
  ({ call, initialName = '', mutationFn }) => {
    const [name, setName] = useState(initialName)
    const submit = useMutationFlow(call, mutationFn)

    return (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <div className="w-full max-w-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-2xl">
          <p className="text-base font-medium text-[var(--color-fg)]">
            Save item
          </p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submit.pending}
            placeholder="Item name"
            className="mt-4 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-2 text-sm text-[var(--color-fg)] focus:border-[var(--color-accent)] focus:outline-none disabled:opacity-50"
          />
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={submit.pending}
              onClick={() => call.end('')}
              className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submit.pending || !name.trim()}
              onClick={() => submit({ name: name.trim() })}
              className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
            >
              {submit.pending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    )
  },
)
SaveForm.displayName = 'SaveForm'
