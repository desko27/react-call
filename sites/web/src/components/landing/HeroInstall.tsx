import { useState } from 'react'
import { CopyCommand } from '../CopyCommand'
import { InstallCommand } from '../InstallCommand'

type Mode = 'lib' | 'skill'

const TABS: { id: Mode; label: string }[] = [
  { id: 'lib', label: 'Library' },
  { id: 'skill', label: 'AI skill' },
]

const SKILL_COMMAND = 'npx skills add desko27/react-call --skill react-call'

// Hero install widget: a segmented control that swaps the package install
// (InstallCommand, with its PM tabs) for the agent-skill install command.
export const HeroInstall = () => {
  const [mode, setMode] = useState<Mode>('lib')

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        role="tablist"
        aria-label="Install method"
        className="
          inline-flex gap-0.5 rounded-md
          border border-[var(--color-border)]
          bg-[var(--color-bg-subtle)] p-0.5
        "
      >
        {TABS.map((tab) => {
          const active = mode === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setMode(tab.id)}
              className={`
                rounded px-3 py-1 font-mono text-xs transition-colors
                ${
                  active
                    ? 'bg-[var(--color-bg)] text-[var(--color-fg)]'
                    : 'text-[var(--color-fg-subtle)] hover:text-[var(--color-fg-muted)]'
                }
              `}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {mode === 'lib' ? (
        <InstallCommand />
      ) : (
        <CopyCommand
          command={SKILL_COMMAND}
          label="Install the react-call agent skill"
        />
      )}
    </div>
  )
}
