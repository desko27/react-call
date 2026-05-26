import { useState } from 'react'
import { Confirm } from './callable'

export const DeleteButton = () => {
  const [status, setStatus] = useState<'idle' | 'deleted' | 'cancelled'>('idle')

  const handleClick = async () => {
    const accepted = await Confirm.call({
      message: 'Delete this item? This action cannot be undone.',
    })
    setStatus(accepted ? 'deleted' : 'cancelled')
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
      >
        Delete item
      </button>
      <span className="font-mono text-xs text-[var(--color-fg-subtle)]">
        {status === 'idle' && '→ awaiting click…'}
        {status === 'deleted' && (
          <span className="text-[var(--color-accent)]">→ deleted</span>
        )}
        {status === 'cancelled' && '→ cancelled'}
      </span>
    </div>
  )
}
