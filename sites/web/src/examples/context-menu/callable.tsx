import { useEffect, useRef } from 'react'
import { createCallable } from 'react-call'

interface Action {
  id: string
  label: string
  destructive?: boolean
}

interface Props {
  x: number
  y: number
  actions: readonly Action[]
}

export const ContextMenu = createCallable<Props, string | null>(
  ({ call, x, y, actions }) => {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const onDocClick = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) {
          call.end(null)
        }
      }
      const onEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') call.end(null)
      }
      document.addEventListener('mousedown', onDocClick)
      document.addEventListener('keydown', onEsc)
      return () => {
        document.removeEventListener('mousedown', onDocClick)
        document.removeEventListener('keydown', onEsc)
      }
    }, [call])

    return (
      <div
        ref={ref}
        role="menu"
        style={{ top: y, left: x }}
        className="fixed z-50 min-w-[180px] rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] p-1 shadow-2xl"
      >
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            role="menuitem"
            onClick={() => call.end(action.id)}
            className={
              action.destructive
                ? 'block w-full rounded px-3 py-1.5 text-left text-sm text-red-500 transition-colors hover:bg-red-500/10'
                : 'block w-full rounded px-3 py-1.5 text-left text-sm text-[var(--color-fg)] transition-colors hover:bg-[var(--color-bg-subtle)]'
            }
          >
            {action.label}
          </button>
        ))}
      </div>
    )
  },
)
ContextMenu.displayName = 'ContextMenu'
