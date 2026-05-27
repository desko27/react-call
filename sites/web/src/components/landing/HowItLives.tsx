import { useEffect, useState } from 'react'

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

type Phase = 'idle' | 'calling' | 'rendering' | 'resolving'

export const HowItLives = () => {
  const [phase, setPhase] = useState<Phase>('idle')
  const [autoplay, setAutoplay] = useState(true)

  useEffect(() => {
    if (!autoplay) return
    let cancelled = false
    const run = async () => {
      while (!cancelled) {
        setPhase('idle')
        await sleep(1200)
        if (cancelled) return
        setPhase('calling')
        await sleep(800)
        if (cancelled) return
        setPhase('rendering')
        await sleep(1400)
        if (cancelled) return
        setPhase('resolving')
        await sleep(1000)
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

        <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_auto_1fr]">
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

          {/* Middle: arrow + promise */}
          <div className="flex flex-col items-center justify-center gap-2 px-2">
            <Arrow phase={phase} />
            <span className="font-mono text-xs text-[var(--color-fg-subtle)]">
              Promise{`<`}Response{`>`}
            </span>
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
              <div className={phase === 'calling' ? 'animate-pulse-bg' : ''}>
                <span>{`const accepted = `}</span>
                <span className="text-[var(--color-fg)]">await </span>
                <span
                  className={
                    phase !== 'idle'
                      ? 'rounded bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)] px-1 text-[var(--color-accent)]'
                      : 'text-[var(--color-fg)]'
                  }
                >
                  Confirm.call({`{ message }`})
                </span>
              </div>
              <div
                className={
                  phase === 'resolving' ? 'text-[var(--color-accent)]' : ''
                }
              >
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
        ? 'rounded bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)] text-[var(--color-fg)]'
        : ''
    }
  >
    {children}
  </div>
)

const Arrow = ({ phase }: { phase: Phase }) => {
  const isCalling = phase === 'calling'
  const isResolving = phase === 'resolving'
  return (
    <svg
      width="120"
      height="60"
      viewBox="0 0 120 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="lg:rotate-0"
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="8"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L8,3 z" fill="var(--color-accent)" />
        </marker>
        <marker
          id="arrowhead-back"
          markerWidth="10"
          markerHeight="10"
          refX="8"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L8,3 z" fill="var(--color-fg-muted)" />
        </marker>
      </defs>
      <path
        d="M 5 22 L 110 22"
        stroke={
          isCalling ? 'var(--color-accent)' : 'var(--color-border-strong)'
        }
        strokeWidth="2"
        markerEnd="url(#arrowhead)"
        className={isCalling ? 'animate-pulse' : ''}
      />
      <path
        d="M 110 42 L 5 42"
        stroke={isResolving ? 'var(--color-fg)' : 'var(--color-border-strong)'}
        strokeWidth="2"
        markerEnd="url(#arrowhead-back)"
        className={isResolving ? 'animate-pulse' : ''}
        strokeDasharray="4 4"
      />
      <text
        x="60"
        y="16"
        textAnchor="middle"
        fontSize="10"
        fontFamily="var(--font-mono)"
        fill="var(--color-fg-subtle)"
      >
        .call(…)
      </text>
      <text
        x="60"
        y="55"
        textAnchor="middle"
        fontSize="10"
        fontFamily="var(--font-mono)"
        fill="var(--color-fg-subtle)"
      >
        Response
      </text>
    </svg>
  )
}
