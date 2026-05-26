import { useState } from 'react'
import { Picker } from './callable'

const FRUITS = [
  { id: 'apple', name: 'Apple', hint: '🍎' },
  { id: 'banana', name: 'Banana', hint: '🍌' },
  { id: 'cherry', name: 'Cherry', hint: '🍒' },
  { id: 'grape', name: 'Grape', hint: '🍇' },
  { id: 'mango', name: 'Mango', hint: '🥭' },
] as const

export const FruitPickerTrigger = () => {
  const [picked, setPicked] = useState<string | null>(null)

  const handleClick = async () => {
    const choice = await Picker.call({
      title: 'Pick a fruit',
      items: FRUITS,
    })
    setPicked(choice ? choice.name : null)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)]"
      >
        Pick a fruit
      </button>
      <span className="font-mono text-xs text-[var(--color-fg-subtle)]">
        {picked ? (
          <span className="text-[var(--color-accent)]">→ {picked}</span>
        ) : (
          '→ nothing picked yet'
        )}
      </span>
    </div>
  )
}
