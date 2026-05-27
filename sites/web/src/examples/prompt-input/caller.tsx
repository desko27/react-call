import { useState } from 'react'
import { Prompt } from './callable'

export const RenameButton = () => {
  const [name, setName] = useState('untitled-file.txt')

  const handleClick = async () => {
    const next = await Prompt.call({
      title: 'Rename file',
      defaultValue: name,
      placeholder: 'New filename',
    })
    if (next) setName(next)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)]"
      >
        Rename
      </button>
      <span className="font-mono text-xs text-[var(--color-accent)]">
        → {name}
      </span>
    </div>
  )
}
