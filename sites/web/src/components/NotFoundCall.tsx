import { useEffect, useState } from 'react'
import { createCallable } from 'react-call'

interface Props {
  pathname: string
}

const NotFoundDialog = createCallable<Props, 'home' | 'close'>(
  ({ call, pathname }) => (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-2xl">
        <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-accent)]">
          404
        </p>
        <p className="mt-2 text-lg font-medium text-[var(--color-fg)]">
          This page doesn't exist.
        </p>
        <p className="mt-3 font-mono text-sm text-[var(--color-fg-muted)]">
          {pathname}
        </p>
        <p className="mt-3 text-sm text-[var(--color-fg-muted)]">
          Funny enough — this dialog is a real{' '}
          <code className="font-mono text-xs">.call()</code>. Closing it returns
          to the caller.
        </p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => call.end('close')}
            className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
          >
            Close me
          </button>
          <button
            type="button"
            onClick={() => call.end('home')}
            className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)]"
          >
            Take me home
          </button>
        </div>
      </div>
    </div>
  ),
)
NotFoundDialog.displayName = 'NotFoundDialog'

interface NotFoundCallProps {
  pathname: string
}

export const NotFoundCall = ({ pathname }: NotFoundCallProps) => {
  const [closed, setClosed] = useState(false)

  useEffect(() => {
    let cancelled = false
    const open = async () => {
      const choice = await NotFoundDialog.call({ pathname })
      if (cancelled) return
      if (choice === 'home') {
        window.location.href = '/'
      } else {
        setClosed(true)
      }
    }
    open()
    return () => {
      cancelled = true
    }
  }, [pathname])

  return (
    <>
      <NotFoundDialog />
      {closed && (
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
            404 · still no page
          </p>
          <h1 className="mt-3 text-3xl font-medium tracking-tight text-[var(--color-fg)] md:text-4xl">
            You closed the call.
          </h1>
          <p className="mt-4 text-base text-[var(--color-fg-muted)]">
            The page <code className="font-mono text-sm">{pathname}</code> still
            doesn't exist. But now you've seen react-call in action — the await
            above ran, you picked a value, the promise resolved.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <a
              href="/"
              className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)]"
            >
              Go home
            </a>
            <button
              type="button"
              onClick={() =>
                NotFoundDialog.call({ pathname }).then((c) => {
                  if (c === 'home') window.location.href = '/'
                })
              }
              className="text-sm text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
            >
              Re-open the call
            </button>
          </div>
        </div>
      )}
    </>
  )
}
