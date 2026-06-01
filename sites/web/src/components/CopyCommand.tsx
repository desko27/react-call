import { useState } from 'react'

interface CopyCommandProps {
  command: string
  label?: string
}

// A single, fixed command with a copy button — mirrors the lower row of
// InstallCommand but without the package-manager tabs. Used for one-off
// commands like the agent-skill install.
export const CopyCommand = ({ command, label }: CopyCommandProps) => {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <div
      className="
        inline-flex max-w-full items-center gap-2 overflow-hidden rounded-md
        border border-[var(--color-border)]
        bg-[var(--color-bg-subtle)]
        px-4 py-3
        text-left font-mono text-sm text-[var(--color-fg)]
      "
    >
      <span className="text-[var(--color-fg-subtle)]">$</span>
      <span className="flex-1 overflow-x-auto whitespace-nowrap">
        {command}
      </span>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? 'Copied' : (label ?? 'Copy command')}
        className="
          inline-flex h-6 w-6 shrink-0 items-center justify-center rounded
          text-[var(--color-fg-subtle)]
          transition-colors
          hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-fg)]
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
  )
}
