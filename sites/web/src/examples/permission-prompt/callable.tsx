import { createCallable } from 'react-call'

interface Props {
  appName: string
  scopes: readonly string[]
}

export const Permission = createCallable<Props, 'allow' | 'deny'>(
  ({ call, appName, scopes }) => (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-2xl">
        <p className="text-base font-medium text-[var(--color-fg)]">
          Allow <span className="text-[var(--color-accent)]">{appName}</span>{' '}
          to:
        </p>
        <ul className="mt-4 space-y-2">
          {scopes.map((s) => (
            <li
              key={s}
              className="flex items-start gap-2 text-sm text-[var(--color-fg-muted)]"
            >
              <span aria-hidden="true" className="text-[var(--color-accent)]">
                ✓
              </span>
              {s}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => call.end('deny')}
            className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
          >
            Deny
          </button>
          <button
            type="button"
            onClick={() => call.end('allow')}
            className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)]"
          >
            Allow
          </button>
        </div>
      </div>
    </div>
  ),
)
Permission.displayName = 'Permission'
