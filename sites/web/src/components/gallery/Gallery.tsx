import { useMemo, useState } from 'react'
import {
  BEHAVIOR_LABELS,
  CATEGORY_LABELS,
  type Behavior,
  type Category,
  type ExampleMeta,
} from '~/lib/examples'

interface GalleryEntry {
  slug: string
  meta: ExampleMeta
}

interface Props {
  entries: GalleryEntry[]
}

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[]
const ALL_BEHAVIORS = Object.keys(BEHAVIOR_LABELS) as Behavior[]

type Filter =
  | { kind: 'all' }
  | { kind: 'category'; value: Category }
  | { kind: 'behavior'; value: Behavior }

const ALL: Filter = { kind: 'all' }

export const Gallery = ({ entries }: Props) => {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>(ALL)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return entries.filter(({ meta }) => {
      if (filter.kind === 'category' && meta.category !== filter.value)
        return false
      if (
        filter.kind === 'behavior' &&
        !(meta.behaviors ?? []).includes(filter.value)
      )
        return false
      if (q) {
        const haystack = [
          meta.title,
          meta.description,
          ...(meta.tags ?? []),
          meta.category,
          ...(meta.behaviors ?? []),
        ]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [entries, query, filter])

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-12">
        <h1 className="text-3xl font-medium tracking-tight text-[var(--color-fg)] md:text-5xl">
          Examples
        </h1>
        <p className="mt-3 max-w-2xl text-base text-[var(--color-fg-muted)]">
          Real Callables you can interact with. Click into any example to see
          the live demo, the two-file source, and notes on when to use it.
        </p>
      </div>

      <div className="mb-10 space-y-4">
        <input
          type="search"
          placeholder="Search examples…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-md rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-2 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-fg-subtle)] focus:border-[var(--color-accent)] focus:outline-none"
        />

        <div className="flex flex-wrap gap-2">
          <CategoryChip
            label="All"
            active={filter.kind === 'all'}
            onClick={() => setFilter(ALL)}
          />
          {ALL_CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat}
              label={CATEGORY_LABELS[cat]}
              active={filter.kind === 'category' && filter.value === cat}
              onClick={() => setFilter({ kind: 'category', value: cat })}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {ALL_BEHAVIORS.map((b) => (
            <BehaviorPill
              key={b}
              label={BEHAVIOR_LABELS[b]}
              active={filter.kind === 'behavior' && filter.value === b}
              onClick={() => setFilter({ kind: 'behavior', value: b })}
            />
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--color-border)] py-16 text-center">
          <p className="text-sm text-[var(--color-fg-muted)]">
            No examples match the current filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(({ slug, meta }) => (
            <a
              key={slug}
              href={`/examples/${slug}`}
              className="group flex flex-col gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-5 transition-colors hover:border-[var(--color-accent)]"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
                  {CATEGORY_LABELS[meta.category]}
                </span>
                {meta.behaviors && meta.behaviors.length > 0 && (
                  <div className="flex gap-1">
                    {meta.behaviors.map((b) => (
                      <span
                        key={b}
                        className="rounded bg-[var(--color-bg-muted)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-fg-muted)]"
                      >
                        {BEHAVIOR_LABELS[b]}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <h2 className="text-lg font-medium text-[var(--color-fg)] transition-colors group-hover:text-[var(--color-accent)]">
                {meta.title}
              </h2>
              <p className="text-sm text-[var(--color-fg-muted)]">
                {meta.description}
              </p>
            </a>
          ))}
        </div>
      )}

      <p className="mt-8 font-mono text-xs text-[var(--color-fg-subtle)]">
        {filtered.length} of {entries.length} examples
      </p>
    </div>
  )
}

interface ChipProps {
  label: string
  active: boolean
  onClick: () => void
}

const CategoryChip = ({ label, active, onClick }: ChipProps) => (
  <button
    type="button"
    onClick={onClick}
    className={
      active
        ? 'rounded-full border border-[var(--color-accent)] bg-[var(--color-accent)] px-3 py-1 text-sm font-medium text-[var(--color-accent-fg)]'
        : 'rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-1 text-sm text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)] hover:border-[var(--color-border-strong)]'
    }
  >
    {label}
  </button>
)

const BehaviorPill = ({ label, active, onClick }: ChipProps) => (
  <button
    type="button"
    onClick={onClick}
    className={
      active
        ? 'rounded-md border border-[var(--color-accent)] bg-[var(--color-bg-subtle)] px-2.5 py-1 font-mono text-xs text-[var(--color-accent)]'
        : 'rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-2.5 py-1 font-mono text-xs text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]'
    }
  >
    {label}
  </button>
)
