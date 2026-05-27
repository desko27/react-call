import { useState } from 'react'
import { createCallable } from 'react-call'
import { type MutationFn, useMutationFlow } from 'react-call/mutation-flow'

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

interface Props {
  mutationFn: MutationFn<'saved', { shouldFail: boolean }>
}
interface RootProps {
  shouldFail: boolean
}

const SaveDialog = createCallable<Props, 'saved', RootProps>(
  ({ call, mutationFn }) => {
    const submit = useMutationFlow(call, mutationFn)
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Save changes"
        className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--color-bg)]/70 p-4 backdrop-blur-sm"
      >
        <div className="w-full max-w-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-5 shadow-2xl">
          <p className="text-sm font-medium text-[var(--color-fg)]">
            Save changes?
          </p>
          <p className="mt-1 text-xs text-[var(--color-fg-muted)]">
            Your unsaved work will be persisted.
          </p>
          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={submit.pending}
              onClick={() => call.end('saved')}
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
  },
)
SaveDialog.displayName = 'LandingSaveDialog'

type LogEntry = { ts: number; line: string; tone: 'info' | 'good' | 'bad' }

export const MutationFlowSection = () => {
  const [shouldFail, setShouldFail] = useState(false)
  const [log, setLog] = useState<LogEntry[]>([])
  const [busy, setBusy] = useState(false)

  const append = (line: string, tone: LogEntry['tone']) =>
    setLog((prev) => [...prev.slice(-4), { ts: Date.now(), line, tone }])

  const openSave = () => {
    if (busy) return
    setBusy(true)
    setLog([])
    SaveDialog.call({
      // shouldFail comes through payload (fed from call.root.shouldFail at
      // submit time) so toggling "Make it fail" while the dialog is open
      // takes effect on the next retry instead of being captured stale.
      mutationFn: async (call, payload) => {
        append('trigger fires • pending = true', 'info')
        await sleep(900)
        if (payload.shouldFail) {
          append('throw → pending clears, call stays open', 'bad')
          throw new Error('Network error')
        }
        append('success → call.end("saved")', 'good')
        call.end('saved')
      },
    })
      .catch(() => {
        /* swallow the rejection from the .catch chain */
      })
      .finally(() => {
        setBusy(false)
      })
  }

  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
              Mutation flow
            </p>
            <h2 className="mt-3 text-3xl font-medium tracking-tight text-[var(--color-fg)] md:text-4xl">
              Stay open on failure. Close on success.
            </h2>
            <p className="mt-4 text-base text-[var(--color-fg-muted)]">
              The hook tracks pending for you. Your{' '}
              <code className="font-mono text-sm">mutationFn</code> decides — by
              calling <code className="font-mono text-sm">call.end()</code> or
              not — whether the dialog closes.
            </p>
            <p className="mt-3 text-base text-[var(--color-fg-muted)]">
              Throw, and the call stays open. The user retries without losing
              their input. That single property handles 90% of "save form" flows
              for you.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-[var(--color-fg-muted)]">
                <input
                  type="checkbox"
                  checked={shouldFail}
                  onChange={(e) => setShouldFail(e.target.checked)}
                  className="accent-[var(--color-accent)]"
                />
                Make it fail
              </label>
              <button
                type="button"
                onClick={openSave}
                disabled={busy}
                className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
              >
                Open Save dialog
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="relative h-[180px] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
              <SaveDialog shouldFail={shouldFail} />
              {!busy && (
                <div className="flex h-full items-center justify-center font-mono text-xs text-[var(--color-fg-subtle)]">
                  the Save dialog will appear here
                </div>
              )}
            </div>

            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5">
              <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
                Lifecycle log
              </p>
              <div className="mt-3 min-h-[150px] space-y-1.5 font-mono text-xs">
                {log.length === 0 ? (
                  <span className="text-[var(--color-fg-subtle)]">
                    open the dialog and click Save…
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
                      <span className="text-[var(--color-fg-subtle)]">▸ </span>
                      {e.line}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
