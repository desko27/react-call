import { useState } from 'react'
import { Toast } from './callable'

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

export const DownloadButton = () => {
  const [running, setRunning] = useState(false)

  const handleClick = async () => {
    setRunning(true)
    // Capture the singleton promise so the loop can abort if the user
    // dismisses the toast via the × button mid-progress. Without this,
    // each upsert after a dismiss would create a brand-new instance and
    // the button would stay disabled until the loop finishes.
    let cancelled = false
    const session = Toast.upsert({ message: 'Starting download…', percent: 0 })
    session.then(() => {
      cancelled = true
    })

    for (let i = 10; i <= 100; i += 10) {
      await sleep(150)
      if (cancelled) {
        setRunning(false)
        return
      }
      Toast.upsert({ message: `Downloading… ${i}%`, percent: i })
    }
    Toast.upsert({ message: 'Done!', percent: 100 })
    await sleep(800)
    Toast.end()
    setRunning(false)
  }

  return (
    <button
      type="button"
      disabled={running}
      onClick={handleClick}
      className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
    >
      {running ? 'Downloading…' : 'Start download'}
    </button>
  )
}
