import { useEffect } from 'react'
import { createCallable } from 'react-call'

interface Props {
  message: string
  durationMs?: number
}

export const ErrorBanner = createCallable<Props, void>(
  ({ call, message, durationMs = 4000 }) => {
    useEffect(() => {
      const t = setTimeout(() => call.end(), durationMs)
      return () => clearTimeout(t)
    }, [call, durationMs])

    return (
      <div
        role="alert"
        aria-live="assertive"
        className="pointer-events-none fixed left-1/2 top-6 z-50 -translate-x-1/2"
      >
        <div className="pointer-events-auto flex items-center gap-3 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200 shadow-2xl backdrop-blur">
          <span aria-hidden="true">⚠</span>
          <span>{message}</span>
          <button
            type="button"
            onClick={() => call.end()}
            aria-label="Dismiss"
            className="ml-2 text-red-300/70 hover:text-red-100"
          >
            ×
          </button>
        </div>
      </div>
    )
  },
)
ErrorBanner.displayName = 'ErrorBanner'
