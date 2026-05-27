import { useState } from 'react'
import { BottomSheet } from './callable'

const ACTIONS = [
  { id: 'share', label: 'Share', icon: '⇪' },
  { id: 'copy-link', label: 'Copy link', icon: '⤴' },
  { id: 'pin', label: 'Pin', icon: '📌' },
  { id: 'archive', label: 'Archive', icon: '🗄' },
] as const

export const ShareButton = () => {
  const [last, setLast] = useState<string | null>(null)

  const handleClick = async () => {
    const id = await BottomSheet.call({
      title: 'Quick actions',
      actions: ACTIONS,
    })
    if (id) setLast(id)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)]"
      >
        Quick actions
      </button>
      <span className="font-mono text-xs text-[var(--color-fg-subtle)]">
        {last ? (
          <span className="text-[var(--color-accent)]">→ {last}</span>
        ) : (
          '→ no action yet'
        )}
      </span>
    </div>
  )
}
