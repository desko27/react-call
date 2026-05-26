import { useState } from 'react'
import { createCallable } from 'react-call'
import { type MutationFn, useMutationFlow } from 'react-call/mutation-flow'

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

interface Props {
  mutationFn: MutationFn<'ok'>
}

const Save = createCallable<Props, 'ok'>(({ call, mutationFn }) => {
  const submit = useMutationFlow(call, mutationFn)
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-2xl">
      <p className="text-sm text-[var(--color-fg)]">Save changes?</p>
      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          type="button"
          disabled={submit.pending}
          onClick={() => submit()}
          className="rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
        >
          {submit.pending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
})
Save.displayName = 'MutationFlowSave'

export const MutationFlowDemo = () => {
  const [shouldFail, setShouldFail] = useState(false)
  const [log, setLog] = useState<string[]>([])

  const append = (line: string) => setLog((prev) => [...prev.slice(-3), line])

  const openSave = () => {
    setLog([])
    Save.call({
      mutationFn: async (call) => {
        append('• pending = true')
        await sleep(700)
        if (shouldFail) {
          append('• throw → pending clears, call stays open')
          throw new Error('Save failed')
        }
        append('• success → call.end()')
        call.end('ok')
      },
    }).catch(() => {})
  }

  return (
    <div className="grid gap-4 md:grid-cols-[1fr,1fr]">
      <div className="relative h-[240px] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
        <Save />
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            type="button"
            onClick={openSave}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-fg)] transition-colors hover:bg-[var(--color-bg-muted)]"
          >
            Open Save dialog
          </button>
        </div>
      </div>

      <div className="flex h-[240px] flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4">
        <label className="flex items-center gap-2 text-sm text-[var(--color-fg-muted)]">
          <input
            type="checkbox"
            checked={shouldFail}
            onChange={(e) => setShouldFail(e.target.checked)}
            className="accent-[var(--color-accent)]"
          />
          Make it fail
        </label>
        <div className="mt-3 flex-1 overflow-y-auto rounded-md bg-[var(--color-bg)] p-3 font-mono text-xs text-[var(--color-fg-muted)]">
          {log.length === 0 ? (
            <span className="text-[var(--color-fg-subtle)]">
              click "Open Save dialog" to start
            </span>
          ) : (
            log.map((line, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: log lines are append-only
              <div key={i}>{line}</div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
