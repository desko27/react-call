import { useState } from 'react'
import { ErrorBanner } from './callable'

export const TriggerErrorButton = () => {
  const [count, setCount] = useState(0)

  const handleClick = () => {
    setCount((c) => c + 1)
    ErrorBanner.call({
      message: `Network request failed (#${count + 1})`,
      durationMs: 3000,
    })
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        className="rounded-md border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/20"
      >
        Simulate error
      </button>
      <span className="font-mono text-xs text-[var(--color-fg-subtle)]">
        {count > 0
          ? `${count} error${count === 1 ? '' : 's'} triggered`
          : 'no errors yet'}
      </span>
    </div>
  )
}
