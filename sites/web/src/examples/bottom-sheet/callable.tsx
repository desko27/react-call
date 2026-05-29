import { useEffect, useRef } from 'react'
import { createCallable } from 'react-call'

interface Action {
  id: string
  label: string
  icon?: string
}

interface Props {
  title: string
  actions: readonly Action[]
}

export const BottomSheet = createCallable<Props, string | null>(
  ({ call, title, actions }) => {
    const sheetRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const onPointer = (e: MouseEvent) => {
        if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
          call.end(null)
        }
      }
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') call.end(null)
      }
      document.addEventListener('mousedown', onPointer)
      document.addEventListener('keydown', onKey)
      return () => {
        document.removeEventListener('mousedown', onPointer)
        document.removeEventListener('keydown', onKey)
      }
    }, [call])

    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      >
        <div
          ref={sheetRef}
          className="w-full max-w-md rounded-t-2xl border-t border-x border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-2xl"
        >
          <div
            aria-hidden="true"
            className="mx-auto mb-3 h-1 w-10 rounded-full bg-[var(--color-border-strong)]"
          />
          <p className="px-2 py-1 text-sm font-medium text-[var(--color-fg)]">
            {title}
          </p>
          <ul className="mt-2">
            {actions.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => call.end(a.id)}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm text-[var(--color-fg)] transition-colors hover:bg-[var(--color-bg-subtle)]"
                >
                  {a.icon && <span aria-hidden="true">{a.icon}</span>}
                  <span>{a.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  },
)
BottomSheet.displayName = 'BottomSheet'
