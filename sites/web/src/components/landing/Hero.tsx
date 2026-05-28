import { useState } from 'react'
import { HeroConfirm } from './HeroConfirm'
import { type Result, ResultBadge } from './ResultBadge'

export const Hero = () => {
  const [nativeResult, setNativeResult] = useState<Result | null>(null)
  const [callResult, setCallResult] = useState<Result | null>(null)

  const runNative = () => {
    const accepted = window.confirm('Continue?')
    setNativeResult({
      value: accepted ? 'true' : 'false',
      highlighted: accepted,
      ts: Date.now(),
    })
  }

  const runCall = async () => {
    const accepted = await HeroConfirm.call({ message: 'Continue?' })
    setCallResult({
      value: accepted ? 'true' : 'false',
      highlighted: accepted,
      ts: Date.now(),
    })
  }

  return (
    <>
      {/* The Callable Root — listens for HeroConfirm.call() */}
      <HeroConfirm />

      <section className="mx-auto max-w-6xl px-6 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="text-center">
          <p
            className="
              inline-block rounded-full
              border border-[var(--color-border)]
              bg-[var(--color-bg-subtle)]
              px-3 py-1 font-mono text-xs
              text-[var(--color-fg-muted)]
            "
          >
            ⚛ 📡 react-call · v2
          </p>
          <h1
            className="
              mt-6 text-4xl font-medium tracking-tight
              text-[var(--color-fg)]
              md:text-6xl
            "
          >
            Your component can{' '}
            <span className="font-mono text-[var(--color-accent)]">await</span>.
          </h1>
          <p
            className="
              mx-auto mt-6 max-w-xl text-base
              text-[var(--color-fg-muted)]
              md:text-lg
            "
          >
            <code className="font-mono text-sm">createCallable()</code> turns
            any React component into something you can{' '}
            <code className="font-mono text-sm">await</code>. Confirmations,
            dialogs, toasts, pickers, menus — any UI that conceptually returns a
            value.
          </p>
        </div>

        <div className="mt-16 grid gap-4 md:mt-20 md:grid-cols-2 md:gap-8">
          {/* Native side */}
          <div
            className="
              rounded-xl border border-[var(--color-border)]
              bg-[var(--color-bg-subtle)] p-6
              md:p-8
            "
          >
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
              <span>The browser</span>
            </div>
            <pre className="mt-4 overflow-x-auto font-mono text-sm leading-relaxed text-[var(--color-fg-muted)]">
              {`const yes = `}
              <span className="text-[var(--color-fg)]">
                {`window.confirm('Continue?')`}
              </span>
            </pre>
            <button
              type="button"
              onClick={runNative}
              className="
                mt-6 inline-flex items-center gap-2 rounded-md
                border border-[var(--color-border-strong)]
                bg-[var(--color-bg)] px-4 py-2
                font-mono text-sm text-[var(--color-fg)]
                transition-colors
                hover:bg-[var(--color-bg-muted)]
              "
            >
              Run it
            </button>
            <div className="mt-3 h-5">
              <ResultBadge result={nativeResult} />
            </div>
          </div>

          {/* Callable side */}
          <div
            className="
              rounded-xl border-2 border-[var(--color-accent)]
              bg-[var(--color-bg-subtle)] p-6
              md:p-8
            "
          >
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[var(--color-accent)]">
              <span>Your component</span>
            </div>
            <pre className="mt-4 overflow-x-auto font-mono text-sm leading-relaxed text-[var(--color-fg-muted)]">
              {`const yes = `}
              <span className="text-[var(--color-fg)]">
                {`await Confirm.call(props)`}
              </span>
            </pre>
            <button
              type="button"
              onClick={runCall}
              className="
                mt-6 inline-flex items-center gap-2 rounded-md
                bg-[var(--color-accent)] px-4 py-2
                font-mono text-sm text-[var(--color-accent-fg)]
                transition-colors
                hover:bg-[var(--color-accent-hover)]
              "
            >
              Run it
            </button>
            <div className="mt-3 h-5">
              <ResultBadge result={callResult} />
            </div>
          </div>
        </div>

        <p
          className="
            mx-auto mt-12 max-w-md text-center font-mono text-xs
            text-[var(--color-fg-subtle)]
          "
        >
          Same <span className="text-[var(--color-fg-muted)]">await</span>. Your
          design.
        </p>
      </section>
    </>
  )
}
