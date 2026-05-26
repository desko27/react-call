import { useState } from 'react'
import { createCallable } from 'react-call'

interface Props {
  depth: number
  label: string
}

const StackDialog = createCallable<Props, void>(({ call, depth, label }) => (
  <div
    style={{
      top: `${50 + depth * 18}px`,
      left: `${50 + depth * 24}px`,
    }}
    role="dialog"
    aria-modal="false"
    className="absolute w-[280px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-2xl"
  >
    <div className="flex items-center justify-between">
      <p className="font-mono text-xs text-[var(--color-fg-subtle)]">
        call #{depth + 1}
      </p>
      <button
        type="button"
        onClick={() => call.end()}
        aria-label="Close"
        className="text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)]"
      >
        ×
      </button>
    </div>
    <p className="mt-2 text-sm text-[var(--color-fg)]">{label}</p>
  </div>
))
StackDialog.displayName = 'StackDialog'

export const StackDemo = () => {
  const [calls, setCalls] = useState(0)

  const open = () => {
    const next = calls + 1
    setCalls(next)
    StackDialog.call({
      depth: calls,
      label: `Each call gets its own CallContext. Older calls stay alive underneath.`,
    })
  }

  const closeAll = () => {
    StackDialog.end()
    setCalls(0)
  }

  return (
    <div className="relative h-[280px] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
      <StackDialog />
      <div className="absolute left-4 top-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={open}
          className="rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          Open another
        </button>
        <button
          type="button"
          onClick={closeAll}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 text-xs text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
        >
          Close all
        </button>
      </div>
    </div>
  )
}
