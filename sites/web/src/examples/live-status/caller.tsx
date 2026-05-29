import { useState } from 'react'
import { Status } from './callable'

type Stage = 'placed' | 'packing' | 'shipped' | 'out' | 'delivered'

const SEQUENCE: Stage[] = ['packing', 'shipped', 'out', 'delivered']

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

export const PlaceOrderButton = () => {
  const [running, setRunning] = useState(false)

  const handleClick = async () => {
    setRunning(true)
    // The promise IS the call identity — hold the reference so we can
    // push updates to *this* specific open call later on.
    const promise = Status.call({ stage: 'placed' })

    // Stop pushing if the user dismisses early.
    let dismissed = false
    promise.then(() => {
      dismissed = true
    })

    for (const stage of SEQUENCE) {
      await sleep(900)
      if (dismissed) break
      // Re-render the open Status with new props — no new instance,
      // no upsert ambiguity, just this call.
      Status.update(promise, { stage })
    }

    await promise
    setRunning(false)
  }

  return (
    <button
      type="button"
      disabled={running}
      onClick={handleClick}
      className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
    >
      {running ? 'Watching order…' : 'Place order'}
    </button>
  )
}
