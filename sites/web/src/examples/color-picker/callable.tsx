import { useEffect, useRef } from 'react'
import { createCallable } from 'react-call'

interface Props {
  swatches: readonly string[]
  current?: string
}

export const ColorPicker = createCallable<Props, string | null>(
  ({ call, swatches, current }) => {
    const panelRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const onPointer = (e: MouseEvent) => {
        if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
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
        aria-label="Pick a color"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <div
          ref={panelRef}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-2xl"
        >
          <p className="mb-3 text-sm font-medium text-[var(--color-fg)]">
            Pick a color
          </p>
          <div className="grid grid-cols-6 gap-2">
            {swatches.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={color}
                onClick={() => call.end(color)}
                style={{ backgroundColor: color }}
                className={
                  color === current
                    ? 'h-9 w-9 rounded-md ring-2 ring-[var(--color-fg)] ring-offset-2 ring-offset-[var(--color-bg)]'
                    : 'h-9 w-9 rounded-md transition-transform hover:scale-110'
                }
              />
            ))}
          </div>
        </div>
      </div>
    )
  },
)
ColorPicker.displayName = 'ColorPicker'
