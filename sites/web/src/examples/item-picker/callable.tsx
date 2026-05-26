import { createCallable } from 'react-call'

interface Item {
  id: string
  name: string
  hint?: string
}

interface Props {
  title: string
  items: readonly Item[]
}

export const Picker = createCallable<Props, Item | null>(
  ({ call, title, items }) => (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2 shadow-2xl">
        <div className="flex items-center justify-between px-3 py-2">
          <p className="text-sm font-medium text-[var(--color-fg)]">{title}</p>
          <button
            type="button"
            onClick={() => call.end(null)}
            aria-label="Cancel"
            className="text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)]"
          >
            ×
          </button>
        </div>
        <ul className="max-h-72 overflow-y-auto">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => call.end(item)}
                className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm text-[var(--color-fg)] transition-colors hover:bg-[var(--color-bg-subtle)]"
              >
                <span>{item.name}</span>
                {item.hint && (
                  <span className="font-mono text-xs text-[var(--color-fg-subtle)]">
                    {item.hint}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  ),
)
Picker.displayName = 'Picker'
