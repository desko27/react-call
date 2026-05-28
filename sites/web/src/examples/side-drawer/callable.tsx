import { type ReactNode, useEffect, useRef } from 'react'
import { createCallable } from 'react-call'

interface Props {
  title: string
  body: ReactNode
}

export const SideDrawer = createCallable<Props, void>(
  ({ call, title, body }) => {
    const drawerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const onPointer = (e: MouseEvent) => {
        if (
          drawerRef.current &&
          !drawerRef.current.contains(e.target as Node)
        ) {
          call.end()
        }
      }
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') call.end()
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
        className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm"
      >
        <div
          ref={drawerRef}
          className="h-full w-full max-w-sm border-l border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <p className="text-base font-medium text-[var(--color-fg)]">
              {title}
            </p>
            <button
              type="button"
              onClick={() => call.end()}
              aria-label="Close"
              className="-mr-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-base leading-none text-[var(--color-fg-subtle)] transition-colors hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-fg)]"
            >
              ×
            </button>
          </div>
          <div className="mt-4 text-sm text-[var(--color-fg-muted)]">
            {body}
          </div>
        </div>
      </div>
    )
  },
)
SideDrawer.displayName = 'SideDrawer'
