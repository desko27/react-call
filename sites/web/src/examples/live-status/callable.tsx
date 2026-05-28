import { createCallable } from 'react-call'

type Stage = 'placed' | 'packing' | 'shipped' | 'out' | 'delivered'

const STAGES: Stage[] = ['placed', 'packing', 'shipped', 'out', 'delivered']

const LABELS: Record<Stage, string> = {
  placed: 'Order placed',
  packing: 'Packing your order',
  shipped: 'Handed to carrier',
  out: 'Out for delivery',
  delivered: 'Delivered',
}

interface Props {
  stage: Stage
}

export const Status = createCallable<Props, void>(({ call, stage }) => {
  const stepIndex = STAGES.indexOf(stage)
  const done = stage === 'delivered'

  return (
    <div className="pointer-events-none fixed right-6 bottom-6 z-50">
      <div className="pointer-events-auto w-[280px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-fg-subtle)]">
              Order #4821
            </p>
            <p className="mt-0.5 text-sm font-medium text-[var(--color-fg)]">
              {LABELS[stage]}
            </p>
          </div>
          <button
            type="button"
            onClick={() => call.end()}
            aria-label={done ? 'Dismiss' : 'Stop watching'}
            className="-mr-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-base leading-none text-[var(--color-fg-subtle)] transition-colors hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-fg)]"
          >
            ×
          </button>
        </div>
        <div className="mt-3 flex gap-1">
          {STAGES.map((s, i) => (
            <div
              key={s}
              className={
                i <= stepIndex
                  ? 'h-1 flex-1 rounded-full bg-[var(--color-accent)] transition-colors'
                  : 'h-1 flex-1 rounded-full bg-[var(--color-bg-muted)] transition-colors'
              }
            />
          ))}
        </div>
      </div>
    </div>
  )
})
Status.displayName = 'Status'
