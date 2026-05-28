import { createCallable } from 'react-call'

const DOM_LIMIT = 10

interface Props {
  level: number
}

export const NestedDialog = createCallable<Props, void>(({ call, level }) => {
  // Keep older instances in the Stack so closing the top falls back to
  // them, but skip rendering once they're more than DOM_LIMIT below the
  // top — the DOM doesn't need to hold hundreds of hidden dialogs.
  if (call.index < call.stackSize - DOM_LIMIT) return null

  const isTopmost = call.index + 1 === call.stackSize
  const openNested = () => NestedDialog.call({ level: level + 1 })
  // Loop the cascade after a few steps so the card never marches off-screen.
  const offset = (call.index % 6) * 18

  return (
    <div
      className={
        isTopmost
          ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm'
          : 'pointer-events-none fixed inset-0 z-50 flex items-center justify-center'
      }
    >
      <div
        className="pointer-events-auto w-[340px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-2xl"
        style={{ transform: `translate(${offset}px, ${offset}px)` }}
      >
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-fg-subtle)]">
            Level {level} · #{call.index + 1} of {call.stackSize}
          </p>
          <button
            type="button"
            onClick={() => call.end()}
            aria-label="Close"
            className="-mr-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-base leading-none text-[var(--color-fg-subtle)] transition-colors hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-fg)]"
          >
            ×
          </button>
        </div>
        <p className="mt-3 text-sm text-[var(--color-fg)]">
          A Callable can open itself. Each open instance has its own promise,
          resolved by its own{' '}
          <code className="font-mono text-xs">call.end()</code>.
        </p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => NestedDialog.end()}
            className="rounded-md text-sm font-medium text-[var(--color-fg-subtle)] transition-colors hover:text-[var(--color-fg-muted)]"
          >
            Close all
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => call.end()}
              className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
            >
              Close
            </button>
            <button
              type="button"
              onClick={openNested}
              className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)]"
            >
              Open nested
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})
NestedDialog.displayName = 'NestedDialog'
