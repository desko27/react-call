import { createCallable } from 'react-call'

type UploadState = 'uploading' | 'paused' | 'done'

interface Props {
  label: string
  state: UploadState
}

const ROW_HEIGHT = 52 // px per stacked pill, including gap

const STATE_META: Record<UploadState, { icon: string; text: string }> = {
  uploading: { icon: '↑', text: 'uploading…' },
  paused: { icon: '⏸', text: 'paused' },
  done: { icon: '✓', text: 'done' },
}

export const Upload = createCallable<Props, void>(({ call, label, state }) => {
  // call.index is this call's slot in the stack — offset each pill upward
  // so concurrent uploads stack instead of overlapping.
  const bottom = 24 + call.index * ROW_HEIGHT
  const { icon, text } = STATE_META[state]

  return (
    <div
      style={{ bottom }}
      className="pointer-events-none fixed right-6 z-50 transition-[bottom] duration-200"
    >
      <div className="pointer-events-auto flex w-72 items-center gap-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 text-sm text-[var(--color-fg)] shadow-2xl backdrop-blur">
        <span aria-hidden="true">{icon}</span>
        <span className="flex-1 truncate">{label}</span>
        <span className="font-mono text-xs text-[var(--color-fg-subtle)]">
          {text}
        </span>
        <button
          type="button"
          onClick={() => call.end()}
          aria-label="Dismiss"
          className="-mr-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-base leading-none text-[var(--color-fg-subtle)] transition-colors hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-fg)]"
        >
          ×
        </button>
      </div>
    </div>
  )
})
Upload.displayName = 'Upload'
