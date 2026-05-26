import { createCallable } from 'react-call'

interface Props {
  message: string
}
type Response = boolean

export const HeroConfirm = createCallable<Props, Response>(
  ({ call, message }) => (
    <div
      role="dialog"
      aria-modal="true"
      className="
        fixed inset-0 z-50 flex items-center justify-center
        bg-black/50 backdrop-blur-sm
      "
    >
      <div
        className="
          w-full max-w-sm rounded-lg border border-[var(--color-border)]
          bg-[var(--color-bg)] p-6 shadow-2xl
        "
      >
        <p className="text-base text-[var(--color-fg)]">{message}</p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => call.end(false)}
            className="
              rounded-md border border-[var(--color-border)]
              px-4 py-2 text-sm font-medium
              text-[var(--color-fg-muted)]
              transition-colors
              hover:text-[var(--color-fg)] hover:border-[var(--color-border-strong)]
            "
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => call.end(true)}
            className="
              rounded-md bg-[var(--color-accent)]
              px-4 py-2 text-sm font-medium
              text-[var(--color-accent-fg)]
              transition-colors
              hover:bg-[var(--color-accent-hover)]
            "
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  ),
)
HeroConfirm.displayName = 'HeroConfirm'
