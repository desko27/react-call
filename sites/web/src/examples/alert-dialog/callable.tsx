import { createCallable } from 'react-call'

interface Props {
  title: string
  message: string
}

export const Alert = createCallable<Props, void>(({ call, title, message }) => (
  <div
    role="alertdialog"
    aria-modal="true"
    aria-labelledby="alert-title"
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
  >
    <div className="w-full max-w-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-2xl">
      <p
        id="alert-title"
        className="text-base font-medium text-[var(--color-fg)]"
      >
        {title}
      </p>
      <p className="mt-2 text-sm text-[var(--color-fg-muted)]">{message}</p>
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={() => call.end()}
          className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          OK
        </button>
      </div>
    </div>
  </div>
))
Alert.displayName = 'Alert'
