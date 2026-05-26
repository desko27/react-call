import { useState } from 'react'
import { createCallable } from 'react-call'

interface Props {
  message: string
  count: number
}

const Notice = createCallable<Props, void>(({ call, message, count }) => (
  <div
    role="status"
    aria-live="polite"
    className="pointer-events-none absolute bottom-4 right-4"
  >
    <div className="pointer-events-auto min-w-[240px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3 shadow-2xl">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[var(--color-fg)]">{message}</p>
        <span className="font-mono text-xs text-[var(--color-accent)]">
          #{count}
        </span>
      </div>
      <button
        type="button"
        onClick={() => call.end()}
        className="mt-2 font-mono text-[10px] uppercase tracking-wider text-[var(--color-fg-subtle)] hover:text-[var(--color-fg-muted)]"
      >
        Dismiss
      </button>
    </div>
  </div>
))
Notice.displayName = 'Notice'

export const UpsertDemo = () => {
  const [calls, setCalls] = useState(0)

  const send = () => {
    const next = calls + 1
    setCalls(next)
    Notice.upsert({
      message:
        next === 1
          ? 'First call → new instance'
          : `Update ${next - 1} → same instance, new props`,
      count: next,
    })
  }

  const reset = () => {
    Notice.end()
    setCalls(0)
  }

  return (
    <div className="relative h-[200px] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
      <Notice />
      <div className="absolute left-4 top-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={send}
          className="rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          Call upsert()
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 text-xs text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
        >
          end()
        </button>
        <p className="mt-2 font-mono text-xs text-[var(--color-fg-subtle)]">
          calls fired: {calls}
        </p>
      </div>
    </div>
  )
}
