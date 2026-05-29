import { useState } from 'react'
import { createCallable } from 'react-call'

interface Props {
  depth: number
  label: string
}

const StackedDialog = createCallable<Props, void>(({ call, depth, label }) => (
  <div
    role="dialog"
    aria-modal="false"
    style={{
      top: `calc(50% + ${depth * 14 - 80}px)`,
      left: `calc(50% + ${depth * 18 - 140}px)`,
    }}
    className="absolute w-72 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-2xl"
  >
    <div className="flex items-center justify-between">
      <span className="font-mono text-xs text-[var(--color-fg-subtle)]">
        call #{depth + 1}
      </span>
      <button
        type="button"
        onClick={() => call.end()}
        aria-label="Close this call"
        className="-mr-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-base leading-none text-[var(--color-fg-subtle)] transition-colors hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-fg)]"
      >
        ×
      </button>
    </div>
    <p className="mt-2 text-sm text-[var(--color-fg)]">{label}</p>
  </div>
))
StackedDialog.displayName = 'StackedDialog'

const LABELS = [
  "I'm the first call. There can be many of us.",
  'A second call appeared on top. The first stays alive.',
  'Each call has its own CallContext. Closing me leaves the others.',
  'Open as many as you want — order is preserved, state isolated.',
  'Cap reached. Close one, open another. Or close all at once.',
]

const MAX = 5

export const StackSection = () => {
  const [active, setActive] = useState(0)

  const open = () => {
    if (active >= MAX) return
    const depth = active
    setActive((n) => n + 1)
    StackedDialog.call({
      depth,
      label: LABELS[depth] ?? 'Another call.',
    }).then(() => setActive((n) => n - 1))
  }

  // No manual setActive(0) here — end() resolves each active call's
  // promise, and the .then in `open` decrements active once per resolved
  // call. The same path handles the × button on individual dialogs, so
  // the badge stays in sync however the user closes.
  const closeAll = () => {
    StackedDialog.end()
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
            The Stack
          </p>
          <h2 className="mt-3 text-3xl font-medium tracking-tight text-[var(--color-fg)] md:text-4xl">
            Many calls. One Root. No conflict.
          </h2>
          <p className="mt-4 text-base text-[var(--color-fg-muted)]">
            Each <code className="font-mono text-sm">.call()</code> adds an
            active call to the stack. The Root renders all of them at once. A
            nested confirm-inside-a-form is just two calls living together.
          </p>
          <p className="mt-3 text-base text-[var(--color-fg-muted)]">
            Closing one doesn't affect the others. The model is concurrent by
            default — you don't have to wire it up.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={open}
              disabled={active >= MAX}
              className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
            >
              Open another
            </button>
            <button
              type="button"
              onClick={closeAll}
              className="rounded-md border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-4 py-2 text-sm text-[var(--color-fg)] transition-colors hover:bg-[var(--color-bg-muted)]"
            >
              Close all
            </button>
            <span className="font-mono text-xs text-[var(--color-fg-subtle)]">
              {active} / {MAX} active
            </span>
          </div>
        </div>

        <div className="relative h-[360px] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
          <StackedDialog />
          {active === 0 && (
            <div className="flex h-full items-center justify-center font-mono text-xs text-[var(--color-fg-subtle)]">
              click "Open another" to start a call
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
