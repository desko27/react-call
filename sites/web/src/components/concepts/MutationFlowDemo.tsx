import { useState } from 'react'
import { createCallable } from 'react-call'
import { type MutationFn, useMutationFlow } from 'react-call/mutation-flow'

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

interface Props {
  mutationFn: MutationFn<'ok', { shouldFail: boolean }>
}
interface RootProps {
  shouldFail: boolean
}

const Save = createCallable<Props, 'ok', RootProps>(({ call, mutationFn }) => {
  const submit = useMutationFlow(call, mutationFn)
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Save changes"
      className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--color-bg)]/70 backdrop-blur-sm"
    >
      <div className="w-[80%] max-w-[300px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-2xl">
        <p className="text-sm text-[var(--color-fg)]">Save changes?</p>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={submit.pending}
            onClick={() => call.end('ok')}
            className="text-xs text-[var(--color-fg-subtle)] hover:text-[var(--color-fg-muted)] disabled:opacity-50"
          >
            Discard
          </button>
          <button
            type="button"
            disabled={submit.pending}
            onClick={() => submit({ shouldFail: call.root.shouldFail })}
            className="rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
          >
            {submit.pending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
})
Save.displayName = 'MutationFlowSave'

type LogEntry = { ts: number; line: string; tone: 'info' | 'good' | 'bad' }

export const MutationFlowDemo = () => {
  const [shouldFail, setShouldFail] = useState(false)
  const [log, setLog] = useState<LogEntry[]>([])
  const [busy, setBusy] = useState(false)

  const append = (line: string, tone: LogEntry['tone']) =>
    setLog((prev) => [...prev.slice(-3), { ts: Date.now(), line, tone }])

  const openSave = () => {
    if (busy) return
    setBusy(true)
    setLog([])
    Save.call({
      // Payload's shouldFail is read at submit() time from call.root.shouldFail,
      // so toggling the checkbox while the dialog is open takes effect on the
      // next retry — no stale closure.
      mutationFn: async (call, payload) => {
        append('• pending = true', 'info')
        await sleep(700)
        if (payload.shouldFail) {
          append('• throw → pending clears, call stays open', 'bad')
          throw new Error('Save failed')
        }
        append('• success → call.end()', 'good')
        call.end('ok')
      },
    })
      .catch(() => {})
      .finally(() => setBusy(false))
  }

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
      <div className="relative h-[240px] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
        <Save shouldFail={shouldFail} />
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            type="button"
            onClick={openSave}
            disabled={busy}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-fg)] transition-colors hover:bg-[var(--color-bg-muted)] disabled:opacity-50"
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
        <div className="mt-3 flex-1 overflow-y-auto rounded-md bg-[var(--color-bg)] p-3 font-mono text-xs">
          {log.length === 0 ? (
            <span className="text-[var(--color-fg-subtle)]">
              click "Open Save dialog" to start
            </span>
          ) : (
            log.map((e) => (
              <div
                key={e.ts}
                className={
                  e.tone === 'good'
                    ? 'text-[var(--color-accent)]'
                    : e.tone === 'bad'
                      ? 'text-red-400'
                      : 'text-[var(--color-fg-muted)]'
                }
              >
                {e.line}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
