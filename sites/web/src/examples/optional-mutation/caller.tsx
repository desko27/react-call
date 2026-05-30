import { useState } from 'react'
import { Confirm } from './callable'

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

export const PublishButton = () => {
  const [status, setStatus] = useState<string>('→ awaiting click…')

  // No mutationFn: `submit().orEnd(true)` closes the call instantly with
  // the fallback response. A plain confirm — no async, no pending state.
  const quickConfirm = async () => {
    const ok = await Confirm.call({ message: 'Discard your draft?' })
    setStatus(ok ? '→ draft discarded' : '→ kept')
  }

  // With a mutationFn: `.orEnd` becomes a no-op. The handler owns the
  // close — pending shows while it runs, then it calls call.end(true).
  const confirmAndPublish = async () => {
    const ok = await Confirm.call({
      message: 'Publish this post now?',
      mutationFn: async (call) => {
        await sleep(900)
        call.end(true)
      },
    })
    setStatus(ok ? '→ published' : '→ cancelled')
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={quickConfirm}
          className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
        >
          Discard draft
        </button>
        <button
          type="button"
          onClick={confirmAndPublish}
          className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          Publish post
        </button>
      </div>
      <span className="font-mono text-xs text-[var(--color-fg-subtle)]">
        {status}
      </span>
    </div>
  )
}
