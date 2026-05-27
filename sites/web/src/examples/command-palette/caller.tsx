import { useState } from 'react'
import { CommandPalette } from './callable'

const COMMANDS = [
  { id: 'new-file', label: 'New file', shortcut: '⌘ N' },
  { id: 'open', label: 'Open…', shortcut: '⌘ O' },
  { id: 'save', label: 'Save', shortcut: '⌘ S' },
  { id: 'find', label: 'Find in files', shortcut: '⌘ ⇧ F' },
  { id: 'toggle-theme', label: 'Toggle theme' },
  { id: 'restart', label: 'Restart' },
] as const

export const CommandPaletteTrigger = () => {
  const [last, setLast] = useState<string | null>(null)

  const handleClick = async () => {
    const id = await CommandPalette.call({ commands: COMMANDS })
    if (id) setLast(id)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        className="rounded-md border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-4 py-2 font-mono text-sm text-[var(--color-fg)] transition-colors hover:bg-[var(--color-bg-muted)]"
      >
        ⌘ K
      </button>
      <span className="font-mono text-xs text-[var(--color-fg-subtle)]">
        {last ? (
          <span className="text-[var(--color-accent)]">→ {last}</span>
        ) : (
          '→ no command run yet'
        )}
      </span>
    </div>
  )
}
