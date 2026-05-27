import { useState } from 'react'
import { type WizardResult, Wizard } from './callable'

export const SignupButton = () => {
  const [result, setResult] = useState<WizardResult | null>(null)

  const handleClick = async () => {
    const data = await Wizard.call({})
    if (data) setResult(data)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)]"
      >
        Sign up
      </button>
      <span className="font-mono text-xs text-[var(--color-fg-subtle)]">
        {result ? (
          <span className="text-[var(--color-accent)]">
            → {result.name} ({result.plan})
          </span>
        ) : (
          '→ no signup yet'
        )}
      </span>
    </div>
  )
}
