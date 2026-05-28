import { createCallable } from 'react-call'

interface Props {
  message: string
  percent?: number
}

export const Toast = createCallable<Props, void>(
  ({ call, message, percent }) => (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 right-6 z-50"
    >
      <div className="pointer-events-auto min-w-[280px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-[var(--color-fg)]">{message}</p>
          <button
            type="button"
            onClick={() => call.end()}
            aria-label="Dismiss"
            className="-mr-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-base leading-none text-[var(--color-fg-subtle)] transition-colors hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-fg)]"
          >
            ×
          </button>
        </div>
        {typeof percent === 'number' && (
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-[var(--color-bg-muted)]">
            <div
              className="h-full bg-[var(--color-accent)] transition-all duration-200"
              style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
            />
          </div>
        )}
      </div>
    </div>
  ),
)
Toast.displayName = 'Toast'
