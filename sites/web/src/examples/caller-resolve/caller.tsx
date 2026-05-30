import { useState } from 'react'
import { Approval } from './callable'

const TIMEOUT_SECONDS = 4

export const RequestApprovalButton = () => {
  const [status, setStatus] = useState<string>('→ no request yet')
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)

  const handleClick = async () => {
    setStatus('awaiting approval…')

    // The promise returned by call() IS the call's identity. Hold it so
    // the timeout can settle THIS specific open call from out here.
    const promise = Approval.call({ action: 'Deploy to production' })

    let answered = false
    promise.then(() => {
      answered = true
    })

    // A plain caller-side countdown — no update() needed, it's local UI.
    let left = TIMEOUT_SECONDS
    setSecondsLeft(left)
    const ticker = setInterval(() => {
      left -= 1
      setSecondsLeft(left > 0 ? left : null)
      if (left <= 0) clearInterval(ticker)
    }, 1000)

    let timedOut = false
    const timer = setTimeout(() => {
      if (answered) return
      timedOut = true
      // End the call from caller scope, delivering a Response value.
      // Targeted at `promise`, so only this call is settled.
      Approval.end(promise, false)
    }, TIMEOUT_SECONDS * 1000)

    const approved = await promise
    clearTimeout(timer)
    clearInterval(ticker)
    setSecondsLeft(null)
    setStatus(
      approved
        ? '→ approved'
        : timedOut
          ? '→ auto-declined (timed out)'
          : '→ declined',
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={secondsLeft !== null}
        className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
      >
        Request approval
      </button>
      <span className="font-mono text-xs text-[var(--color-fg-subtle)]">
        {secondsLeft !== null ? (
          <span className="text-[var(--color-accent)]">
            auto-declines in {secondsLeft}s…
          </span>
        ) : (
          status
        )}
      </span>
    </div>
  )
}
