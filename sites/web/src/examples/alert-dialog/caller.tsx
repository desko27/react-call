import { useState } from 'react'
import { Alert } from './callable'

export const ShowAlertButton = () => {
  const [acked, setAcked] = useState(false)

  const handleClick = async () => {
    await Alert.call({
      title: 'Heads up',
      message:
        'Your session will expire in 5 minutes. Save your work to keep it.',
    })
    setAcked(true)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)]"
      >
        Show alert
      </button>
      <span className="font-mono text-xs text-[var(--color-fg-subtle)]">
        {acked ? '→ acknowledged' : '→ awaiting click…'}
      </span>
    </div>
  )
}
