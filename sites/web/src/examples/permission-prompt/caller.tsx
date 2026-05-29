import { useState } from 'react'
import { Permission } from './callable'

export const ConnectButton = () => {
  const [status, setStatus] = useState<'idle' | 'connected' | 'denied'>('idle')

  const handleClick = async () => {
    const result = await Permission.call({
      appName: 'react-call demo',
      scopes: [
        'Read your profile',
        'Read your repositories',
        'Subscribe to webhook events',
      ],
    })
    setStatus(result === 'allow' ? 'connected' : 'denied')
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={status === 'connected'}
        className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
      >
        {status === 'connected' ? 'Connected' : 'Connect with GitHub'}
      </button>
      <span className="font-mono text-xs text-[var(--color-fg-subtle)]">
        {status === 'idle' && '→ awaiting consent…'}
        {status === 'connected' && (
          <span className="text-[var(--color-accent)]">→ allowed</span>
        )}
        {status === 'denied' && '→ denied'}
      </span>
    </div>
  )
}
