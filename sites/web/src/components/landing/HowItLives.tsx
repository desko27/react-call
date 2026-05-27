import { useEffect, useState } from 'react'

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

type Phase = 'idle' | 'calling' | 'rendering' | 'resolving'

const FLOW_ROWS = [
  {
    phase: 'calling' as const,
    label: '.call()',
    direction: 'forward' as const,
  },
  {
    phase: 'rendering' as const,
    label: 'Render',
    direction: 'backward' as const,
  },
  {
    phase: 'resolving' as const,
    label: 'Response',
    direction: 'forward' as const,
  },
]

export const HowItLives = () => {
  const [phase, setPhase] = useState<Phase>('idle')
  const [autoplay, setAutoplay] = useState(true)

  useEffect(() => {
    if (!autoplay) return
    let cancelled = false
    const PHASE_MS = 2000
    const run = async () => {
      while (!cancelled) {
        setPhase('idle')
        await sleep(PHASE_MS)
        if (cancelled) return
        setPhase('calling')
        await sleep(PHASE_MS)
        if (cancelled) return
        setPhase('rendering')
        await sleep(PHASE_MS)
        if (cancelled) return
        setPhase('resolving')
        await sleep(PHASE_MS)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [autoplay])

  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
            How it lives in your app
          </p>
          <h2 className="mt-3 text-3xl font-medium tracking-tight text-[var(--color-fg)] md:text-4xl">
            Declared once. Called from anywhere.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-[var(--color-fg-muted)]">
            The <code className="font-mono text-sm">{`<Confirm />`}</code> mount
            lives in your React tree — like any other component. The{' '}
            <code className="font-mono text-sm">Confirm.call(…)</code> happens
            in imperative code, from anywhere. One Root, many calls.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          {/* Left: the React tree */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6">
            <p className="mb-4 font-mono text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
              Your React tree
            </p>
            <div className="font-mono text-sm leading-7 text-[var(--color-fg-muted)]">
              <TreeLine indent={0}>
                {'<'}App{'>'}
              </TreeLine>
              <TreeLine indent={1}>
                {'<'}Header /{'>'}
              </TreeLine>
              <TreeLine indent={1}>
                {'<'}Routes /{'>'}
              </TreeLine>
              <TreeLine indent={1} highlight={phase === 'rendering'}>
                {'<'}
                <span className="text-[var(--color-accent)]">Confirm</span>
                {' />'}
                <span className="ml-2 text-[var(--color-fg-subtle)]">
                  ← the Root
                </span>
              </TreeLine>
              <TreeLine indent={0}>
                {'</'}App{'>'}
              </TreeLine>
            </div>
            <p className="mt-4 text-xs text-[var(--color-fg-subtle)]">
              You mount it once, anywhere visible. The Root listens for calls
              and renders the active ones as a stack.
            </p>
          </div>

          {/* Middle: 3-step flow */}
          <div className="flex flex-col items-stretch justify-center gap-5 lg:min-w-[160px]">
            {FLOW_ROWS.map((row) => (
              <FlowRow
                key={row.phase}
                label={row.label}
                direction={row.direction}
                active={phase === row.phase}
              />
            ))}
          </div>

          {/* Right: the caller site */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6">
            <p className="mb-4 font-mono text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
              Anywhere in your code
            </p>
            <div className="overflow-x-auto font-mono text-sm leading-7 text-[var(--color-fg-muted)]">
              <div>
                <span className="text-[var(--color-fg-subtle)]">{`// inside any handler, hook, or domain action`}</span>
              </div>
              <div>
                <CodeSpan active={phase === 'resolving'}>
                  const accepted
                </CodeSpan>
                <span className="text-[var(--color-fg-muted)]">{' = '}</span>
                <CodeSpan active={phase === 'calling'}>
                  await Confirm.call({`{ message }`})
                </CodeSpan>
              </div>
              <div className="text-[var(--color-fg-muted)]">
                {`if (accepted) await api.delete(id)`}
              </div>
            </div>
            <p className="mt-4 text-xs text-[var(--color-fg-subtle)]">
              The async logic owns the flow — UI gets pulled in only when the
              logic asks.
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-3 text-xs text-[var(--color-fg-subtle)]">
          <span className="font-mono">phase:</span>
          {(['idle', 'calling', 'rendering', 'resolving'] as Phase[]).map(
            (p) => (
              <span
                key={p}
                className={
                  phase === p
                    ? 'font-mono text-[var(--color-accent)]'
                    : 'font-mono text-[var(--color-fg-subtle)]'
                }
              >
                {p}
              </span>
            ),
          )}
          <button
            type="button"
            onClick={() => setAutoplay((v) => !v)}
            className="ml-3 rounded border border-[var(--color-border)] px-2 py-0.5 font-mono text-[10px] text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
          >
            {autoplay ? 'Pause' : 'Play'}
          </button>
        </div>
      </div>
    </section>
  )
}

interface TreeLineProps {
  indent: number
  children: React.ReactNode
  highlight?: boolean
}

const TreeLine = ({ indent, children, highlight }: TreeLineProps) => (
  <div
    style={{ paddingLeft: `${indent * 1.5}rem` }}
    className={
      highlight
        ? 'rounded bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)] text-[var(--color-fg)] transition-colors duration-200'
        : 'transition-colors duration-200'
    }
  >
    {children}
  </div>
)

interface CodeSpanProps {
  active: boolean
  children: React.ReactNode
}

const CodeSpan = ({ active, children }: CodeSpanProps) => (
  <span
    className={
      active
        ? 'rounded bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)] px-1 text-[var(--color-accent)] transition-colors duration-200'
        : 'text-[var(--color-fg)] transition-colors duration-200'
    }
  >
    {children}
  </span>
)

interface FlowRowProps {
  label: string
  direction: 'forward' | 'backward'
  active: boolean
}

const FlowRow = ({ label, direction, active }: FlowRowProps) => {
  const stroke = active ? 'var(--color-accent)' : 'var(--color-border-strong)'
  const textColor = active
    ? 'text-[var(--color-accent)]'
    : 'text-[var(--color-fg-subtle)]'

  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={`font-mono text-[11px] uppercase tracking-wider transition-colors duration-200 ${textColor}`}
      >
        {label}
      </span>
      <svg
        width="140"
        height="14"
        viewBox="0 0 140 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <marker
            id={`head-${direction}-${active ? 'on' : 'off'}`}
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L0,6 L8,3 z" fill={stroke} />
          </marker>
        </defs>
        {direction === 'forward' ? (
          <path
            d="M 5 7 L 132 7"
            stroke={stroke}
            strokeWidth="2"
            markerEnd={`url(#head-forward-${active ? 'on' : 'off'})`}
            className={active ? 'animate-pulse' : ''}
          />
        ) : (
          <path
            d="M 135 7 L 8 7"
            stroke={stroke}
            strokeWidth="2"
            markerEnd={`url(#head-backward-${active ? 'on' : 'off'})`}
            className={active ? 'animate-pulse' : ''}
          />
        )}
      </svg>
    </div>
  )
}
