import { Suspense, lazy, useMemo, type ComponentType } from 'react'

const loaders = import.meta.glob<{ default: ComponentType }>(
  '../../examples/*/index.tsx',
)

const loaderFor = (slug: string) => {
  const key = `../../examples/${slug}/index.tsx`
  const loader = loaders[key]
  if (!loader) throw new Error(`No example component found for slug "${slug}"`)
  return loader
}

interface Props {
  slug: string
}

export const ExampleHost = ({ slug }: Props) => {
  const Lazy = useMemo(() => lazy(loaderFor(slug)), [slug])
  return (
    <Suspense
      fallback={
        <div className="font-mono text-xs text-[var(--color-fg-subtle)]">
          loading…
        </div>
      }
    >
      <Lazy />
    </Suspense>
  )
}
