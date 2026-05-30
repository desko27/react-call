import { useState } from 'react'
import { Upload } from './callable'

const FILES = ['report.pdf', 'photo.jpg', 'archive.zip']

export const UploadQueueButton = () => {
  const [online, setOnline] = useState(true)
  const [openCount, setOpenCount] = useState(0)

  const start = () => {
    setOnline(true)
    for (const label of FILES) {
      // The promise resolves when this pill is dismissed (× → call.end()),
      // so we can track how many are still open and re-enable Start at zero.
      const promise = Upload.call({ label, state: 'uploading' })
      setOpenCount((n) => n + 1)
      promise.then(() => setOpenCount((n) => n - 1))
    }
  }

  // One update() with no promise broadcasts to EVERY open call. It merges
  // `state` into each pill's props, so they all flip together while each
  // keeps its own `label`.
  const toggleConnection = () => {
    const next = !online
    setOnline(next)
    Upload.update({ state: next ? 'uploading' : 'paused' })
  }

  const completeAll = () => {
    setOnline(true)
    Upload.update({ state: 'done' })
  }

  const idle = openCount === 0

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={start}
          disabled={!idle}
          className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
        >
          Start 3 uploads
        </button>
        <button
          type="button"
          onClick={toggleConnection}
          disabled={idle}
          className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)] disabled:opacity-50"
        >
          Toggle connection
        </button>
        <button
          type="button"
          onClick={completeAll}
          disabled={idle}
          className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)] disabled:opacity-50"
        >
          Complete all
        </button>
      </div>
      <span className="font-mono text-xs text-[var(--color-fg-subtle)]">
        {idle
          ? '→ start some uploads, then broadcast to all of them'
          : `connection: ${online ? 'online' : 'offline'} — ${openCount} open`}
      </span>
    </div>
  )
}
