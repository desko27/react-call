import { useState } from 'react'
import { SaveForm } from './callable'

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

// Simulates an API that fails once for every "bad" input.
let attempts = 0

export const NewItemButton = () => {
  const [saved, setSaved] = useState<string | null>(null)

  const handleClick = async () => {
    const result = await SaveForm.call({
      mutationFn: async (call, { name }) => {
        await sleep(900)
        attempts++
        if (name.toLowerCase() === 'fail' && attempts % 2 === 1) {
          throw new Error('Saving failed — try again.')
        }
        call.end(name)
      },
    })
    if (result) setSaved(result)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)]"
      >
        New item
      </button>
      <span className="font-mono text-xs text-[var(--color-fg-subtle)]">
        {saved ? (
          <span className="text-[var(--color-accent)]">→ saved "{saved}"</span>
        ) : (
          '→ try typing "fail" to see the dialog stay open'
        )}
      </span>
    </div>
  )
}
