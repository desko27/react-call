import { type MouseEvent, useState } from 'react'
import { ContextMenu } from './callable'

const ACTIONS = [
  { id: 'rename', label: 'Rename' },
  { id: 'duplicate', label: 'Duplicate' },
  { id: 'archive', label: 'Archive' },
  { id: 'delete', label: 'Delete', destructive: true },
] as const

export const ItemRow = () => {
  const [lastAction, setLastAction] = useState<string | null>(null)

  const handleContextMenu = async (e: MouseEvent) => {
    e.preventDefault()
    const action = await ContextMenu.call({
      x: e.clientX,
      y: e.clientY,
      actions: ACTIONS,
    })
    if (action) setLastAction(action)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onContextMenu={handleContextMenu}
        className="cursor-default select-none rounded-md border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-subtle)] px-8 py-6 text-center text-sm text-[var(--color-fg-muted)]"
      >
        Right-click me
      </button>
      <span className="font-mono text-xs text-[var(--color-fg-subtle)]">
        {lastAction ? (
          <span className="text-[var(--color-accent)]">→ {lastAction}</span>
        ) : (
          '→ no action yet'
        )}
      </span>
    </div>
  )
}
