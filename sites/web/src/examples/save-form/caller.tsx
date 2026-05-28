import { useState } from 'react'
import { SaveForm } from './callable'

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

export const NewItemButton = () => {
  const [saved, setSaved] = useState<string | null>(null)

  const handleClick = async () => {
    const result = await SaveForm.call({
      mutationFn: async (call, { name, shouldFail }) => {
        await sleep(900)
        // Handle your own errors inside the mutationFn — the lib lets a
        // throw propagate untouched. Not calling call.end() leaves the
        // dialog open, so the user can fix things and retry.
        try {
          if (shouldFail) throw new Error('Saving failed — try again.')
          call.end(name)
        } catch {
          // surface this however your UI needs; here we just stay open
        }
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
          '→ tick "simulate a failed save" to see it stay open'
        )}
      </span>
    </div>
  )
}
