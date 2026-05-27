import { useEffect, useRef, useState } from 'react'
import { createCallable } from 'react-call'

interface Props {
  title: string
  placeholder?: string
  defaultValue?: string
}

export const Prompt = createCallable<Props, string | null>(
  ({ call, title, placeholder, defaultValue = '' }) => {
    const [value, setValue] = useState(defaultValue)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
      inputRef.current?.focus()
    }, [])

    return (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            call.end(value.trim() || null)
          }}
          className="w-full max-w-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-2xl"
        >
          <label
            htmlFor="prompt-input"
            className="text-base font-medium text-[var(--color-fg)]"
          >
            {title}
          </label>
          <input
            id="prompt-input"
            ref={inputRef}
            type="text"
            value={value}
            placeholder={placeholder}
            onChange={(e) => setValue(e.target.value)}
            className="mt-4 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-2 text-sm text-[var(--color-fg)] focus:border-[var(--color-accent)] focus:outline-none"
          />
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => call.end(null)}
              className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)]"
            >
              OK
            </button>
          </div>
        </form>
      </div>
    )
  },
)
Prompt.displayName = 'Prompt'
