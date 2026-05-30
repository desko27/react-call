import { createCallable } from 'react-call'

interface Props {
  message: string
}
type Response = boolean

// The third generic is RootProps — what the Root mount accepts and what
// each call reads via `call.root`. It's separate from the per-call Props.
type RootProps = {
  userName: string
}

export const Greeter = createCallable<Props, Response, RootProps>(
  ({ call, message }) => (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-2xl">
        <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
          Signed in as {call.root.userName}
        </p>
        <p className="mt-2 text-base text-[var(--color-fg)]">{message}</p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => call.end(false)}
            className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={() => call.end(true)}
            className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)]"
          >
            Enable
          </button>
        </div>
      </div>
    </div>
  ),
)
Greeter.displayName = 'Greeter'
