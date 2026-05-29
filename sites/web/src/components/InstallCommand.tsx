import { useEffect, useState } from 'react'

type PM = 'npm' | 'pnpm' | 'yarn' | 'bun'

const PMS: PM[] = ['npm', 'pnpm', 'yarn', 'bun']

const COMMANDS: Record<PM, string> = {
  npm: 'npm install react-call',
  pnpm: 'pnpm add react-call',
  yarn: 'yarn add react-call',
  bun: 'bun add react-call',
}

const STORAGE_KEY = 'pm'
const EVENT = 'pm-change'

const readPM = (): PM => {
  if (typeof window === 'undefined') return 'npm'
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v && (PMS as string[]).includes(v)) return v as PM
  } catch {
    // localStorage unavailable
  }
  return 'npm'
}

export const InstallCommand = () => {
  const [pm, setPM] = useState<PM>('npm')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setPM(readPM())
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<PM>).detail
      if ((PMS as string[]).includes(detail)) setPM(detail)
    }
    window.addEventListener(EVENT, onChange as EventListener)
    return () => window.removeEventListener(EVENT, onChange as EventListener)
  }, [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(COMMANDS[pm])
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable
    }
  }

  const select = (next: PM) => {
    if (next === pm) return
    setPM(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // localStorage unavailable
    }
    window.dispatchEvent(new CustomEvent(EVENT, { detail: next }))
  }

  return (
    <div
      className="
        inline-flex flex-col overflow-hidden rounded-md
        border border-[var(--color-border)]
        bg-[var(--color-bg-subtle)]
        text-left
      "
    >
      <div
        role="tablist"
        aria-label="Package manager"
        className="flex border-b border-[var(--color-border)]"
      >
        {PMS.map((name) => {
          const active = pm === name
          return (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => select(name)}
              className={`
                px-3 py-1.5 font-mono text-xs transition-colors
                ${
                  active
                    ? 'text-[var(--color-accent)]'
                    : 'text-[var(--color-fg-subtle)] hover:text-[var(--color-fg-muted)]'
                }
              `}
            >
              {name}
            </button>
          )
        })}
      </div>
      <div
        className="
          flex items-center gap-2 px-4 py-3
          font-mono text-sm text-[var(--color-fg)]
        "
      >
        <span className="text-[var(--color-fg-subtle)]">$</span>
        <span className="flex-1">{COMMANDS[pm]}</span>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? 'Copied' : 'Copy command'}
          className="
            inline-flex h-6 w-6 shrink-0 items-center justify-center rounded
            text-[var(--color-fg-subtle)]
            transition-colors
            hover:text-[var(--color-fg)] hover:bg-[var(--color-bg-muted)]
          "
        >
          {copied ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="text-[var(--color-accent)]"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
