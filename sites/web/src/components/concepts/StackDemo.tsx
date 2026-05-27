import { useState } from 'react'
import { createCallable } from 'react-call'

interface Props {
  depth: number
  label: string
}

const MAX = 5

const LABELS = [
  'First call. Older calls stay alive underneath when you open more.',
  'Second call layered on top. Both Calls hold their own CallContext.',
  'Three calls. Closing the middle one would leave the other two alive.',
  'Four. Order is preserved by insertion — no shuffling.',
  'Five — the demo cap. In real apps there is no limit.',
]

const StackDialog = createCallable<Props, void>(({ call, depth, label }) => (
  <div
    style={{
      top: `${40 + depth * 16}px`,
      left: `${24 + depth * 22}px`,
    }}
    role="dialog"
    aria-modal="false"
    className="absolute w-[260px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-2xl"
  >
    <div className="flex items-center justify-between">
      <p className="font-mono text-xs text-[var(--color-fg-subtle)]">
        call #{depth + 1}
      </p>
      <button
        type="button"
        onClick={() => call.end()}
        aria-label="Close this call"
        className="text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)]"
      >
        ×
      </button>
    </div>
    <p className="mt-2 text-sm text-[var(--color-fg)]">{label}</p>
  </div>
))
StackDialog.displayName = 'ConceptStackDialog'

export const StackDemo = () => {
  const [opened, setOpened] = useState(0)

  const open = () => {
    if (opened >= MAX) return
    StackDialog.call({
      depth: opened,
      label: LABELS[opened] ?? 'Another call on the stack.',
    })
    setOpened((n) => n + 1)
  }

  const closeAll = () => {
    StackDialog.end()
    setOpened(0)
  }

  return (
    <div className="relative h-[300px] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
      <StackDialog />
      <div className="absolute right-4 top-4 flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={open}
          disabled={opened >= MAX}
          className="rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
        >
          Open another
        </button>
        <button
          type="button"
          onClick={closeAll}
          disabled={opened === 0}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 text-xs text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)] disabled:opacity-50"
        >
          Close all
        </button>
        <span className="font-mono text-[10px] text-[var(--color-fg-subtle)]">
          {opened} / {MAX}
        </span>
      </div>
      {opened === 0 && (
        <div className="flex h-full items-center justify-center font-mono text-xs text-[var(--color-fg-subtle)]">
          click "Open another" to start a call
        </div>
      )}
    </div>
  )
}
