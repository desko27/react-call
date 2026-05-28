import { useEffect } from 'react'
import { createCallable } from 'react-call'

interface Props {
  message: string
  durationMs?: number
}

const ROW_HEIGHT = 52 // px per stacked banner, including gap

export const ErrorBanner = createCallable<Props, void>(
  ({ call, message, durationMs = 2000 }) => {
    useEffect(() => {
      const t = setTimeout(() => call.end(), durationMs)
      return () => clearTimeout(t)
    }, [call, durationMs])

    // call.index reflects this call's position in the active stack — use it
    // to offset each banner downward so concurrent toasts don't overlap.
    const top = 24 + call.index * ROW_HEIGHT

    return (
      <div
        role="alert"
        aria-live="assertive"
        style={{ top }}
        className="pointer-events-none fixed left-1/2 z-50 -translate-x-1/2 transition-[top] duration-200"
      >
        <div className="pointer-events-auto flex items-center gap-3 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200 shadow-2xl backdrop-blur">
          <span aria-hidden="true">⚠</span>
          <span>{message}</span>
          <button
            type="button"
            onClick={() => call.end()}
            aria-label="Dismiss"
            className="-mr-1 ml-2 inline-flex h-7 w-7 items-center justify-center rounded-md text-base leading-none text-red-300/80 transition-colors hover:bg-red-500/20 hover:text-red-100"
          >
            ×
          </button>
        </div>
      </div>
    )
  },
)
ErrorBanner.displayName = 'ErrorBanner'
