import { useState } from 'react'
import { Greeter } from './callable'

export const AskButton = () => {
  const [status, setStatus] = useState<'idle' | 'enabled' | 'dismissed'>('idle')

  const handleClick = async () => {
    // Note what the caller does NOT pass: the user's name. That lives on
    // the Root and reaches the call through `call.root` — the caller only
    // supplies the per-call message.
    const enabled = await Greeter.call({
      message: 'Enable two-factor authentication for your account?',
    })
    setStatus(enabled ? 'enabled' : 'dismissed')
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)]"
      >
        Review security
      </button>
      <span className="font-mono text-xs text-[var(--color-fg-subtle)]">
        {status === 'idle' && '→ awaiting click…'}
        {status === 'enabled' && (
          <span className="text-[var(--color-accent)]">→ 2FA enabled</span>
        )}
        {status === 'dismissed' && '→ dismissed'}
      </span>
    </div>
  )
}
