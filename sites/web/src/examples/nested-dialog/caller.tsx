import { NestedDialog } from './callable'

export const OpenNestedButton = () => (
  <button
    type="button"
    onClick={() => NestedDialog.call({ level: 1 })}
    className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)]"
  >
    Open dialog
  </button>
)
