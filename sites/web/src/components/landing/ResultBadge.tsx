export interface Result {
  value: string
  highlighted: boolean
  ts: number
}

interface Props {
  result: Result | null
}

export const ResultBadge = ({ result }: Props) => {
  if (!result) {
    return (
      <span className="font-mono text-xs text-[var(--color-fg-subtle)]">
        →&nbsp;awaiting click…
      </span>
    )
  }
  return (
    <span
      key={result.ts}
      className="inline-flex items-center gap-2 font-mono text-xs animate-in fade-in slide-in-from-bottom-1 duration-300"
    >
      <span className="text-[var(--color-fg-subtle)]">→</span>
      <span
        className={
          result.highlighted
            ? 'text-[var(--color-accent)]'
            : 'text-[var(--color-fg-muted)]'
        }
      >
        {result.value}
      </span>
    </span>
  )
}
