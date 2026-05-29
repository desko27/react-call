import { useState } from 'react'
import { ColorPicker } from './callable'

const SWATCHES = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#e11d74',
  '#a3a3a3',
  '#000000',
  '#ffffff',
  '#f59e0b',
] as const

export const ColorSwatch = () => {
  const [color, setColor] = useState<string>('#e11d74')

  const handleClick = async () => {
    const next = await ColorPicker.call({ swatches: SWATCHES, current: color })
    if (next) setColor(next)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-1.5 text-sm text-[var(--color-fg)] transition-colors hover:border-[var(--color-border-strong)]"
      >
        <span
          aria-hidden="true"
          style={{ backgroundColor: color }}
          className="h-5 w-5 rounded border border-[var(--color-border-strong)]"
        />
        <span className="font-mono text-xs">{color}</span>
      </button>
      <span className="font-mono text-xs text-[var(--color-fg-subtle)]">
        click to change
      </span>
    </div>
  )
}
