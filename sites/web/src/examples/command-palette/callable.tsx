import { useEffect, useMemo, useRef, useState } from 'react'
import { createCallable } from 'react-call'

export interface Command {
  id: string
  label: string
  shortcut?: string
  group?: string
}

interface Props {
  commands: readonly Command[]
}

export const CommandPalette = createCallable<Props, string | null>(
  ({ call, commands }) => {
    const [query, setQuery] = useState('')
    const [active, setActive] = useState(0)
    const listRef = useRef<HTMLUListElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const paletteRef = useRef<HTMLDivElement>(null)

    const filtered = useMemo(() => {
      const q = query.trim().toLowerCase()
      if (!q) return commands
      return commands.filter((c) => c.label.toLowerCase().includes(q))
    }, [commands, query])

    useEffect(() => {
      inputRef.current?.focus()
      setActive(0)
    }, [])

    useEffect(() => {
      const onPointer = (e: MouseEvent) => {
        if (
          paletteRef.current &&
          !paletteRef.current.contains(e.target as Node)
        ) {
          call.end(null)
        }
      }
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') call.end(null)
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setActive((a) => Math.min(filtered.length - 1, a + 1))
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          setActive((a) => Math.max(0, a - 1))
        }
        if (e.key === 'Enter') {
          e.preventDefault()
          const item = filtered[active]
          if (item) call.end(item.id)
        }
      }
      document.addEventListener('mousedown', onPointer)
      document.addEventListener('keydown', onKey)
      return () => {
        document.removeEventListener('mousedown', onPointer)
        document.removeEventListener('keydown', onKey)
      }
    }, [call, filtered, active])

    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-32 backdrop-blur-sm"
      >
        <div
          ref={paletteRef}
          className="w-full max-w-md overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-2xl"
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border-b border-[var(--color-border)] bg-transparent px-4 py-3 text-sm text-[var(--color-fg)] focus:outline-none"
          />
          <ul ref={listRef} className="max-h-72 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-[var(--color-fg-subtle)]">
                No matches
              </li>
            ) : (
              filtered.map((cmd, i) => (
                <li key={cmd.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => call.end(cmd.id)}
                    className={
                      i === active
                        ? 'flex w-full items-center justify-between gap-3 rounded-md bg-[var(--color-bg-subtle)] px-3 py-2 text-left text-sm text-[var(--color-fg)]'
                        : 'flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm text-[var(--color-fg-muted)]'
                    }
                  >
                    <span>{cmd.label}</span>
                    {cmd.shortcut && (
                      <span className="font-mono text-xs text-[var(--color-fg-subtle)]">
                        {cmd.shortcut}
                      </span>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    )
  },
)
CommandPalette.displayName = 'CommandPalette'
