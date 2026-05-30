import { createCallable } from 'react-call'
import { type MutationFn, useMutationFlow } from 'react-call/mutation-flow'

interface Props {
  message: string
  // Optional: type it as possibly-undefined to unlock `.orEnd(value)` at
  // the callsite. Callers may pass an async handler or skip it entirely.
  mutationFn?: MutationFn<boolean>
}

export const Confirm = createCallable<Props, boolean>(
  ({ call, message, mutationFn }) => {
    const submit = useMutationFlow(call, mutationFn)

    return (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <div className="w-full max-w-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-2xl">
          <p className="text-base text-[var(--color-fg)]">{message}</p>
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={submit.pending}
              onClick={() => call.end(false)}
              className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submit.pending}
              // No mutationFn → `.orEnd(true)` closes with the fallback.
              // With one → `.orEnd` is a no-op; the handler closes instead.
              onClick={() => submit().orEnd(true)}
              className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
            >
              {submit.pending ? 'Working…' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    )
  },
)
Confirm.displayName = 'Confirm'
