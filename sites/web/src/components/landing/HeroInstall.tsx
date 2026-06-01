import { useState } from 'react'
import { CopyCommand } from '../CopyCommand'
import { InstallCommand } from '../InstallCommand'

type Mode = 'lib' | 'skill'

const TABS: { id: Mode; label: string }[] = [
  { id: 'lib', label: 'Install' },
  { id: 'skill', label: '🤖 AI skill' },
]

const SKILL_COMMAND = 'npx skills add desko27/react-call --skill react-call'

// Hero install widget: a subtle text toggle that swaps the package install
// (InstallCommand, with its PM tabs) for the agent-skill install command.
export const HeroInstall = () => {
  const [mode, setMode] = useState<Mode>('lib')

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        role="tablist"
        aria-label="Install method"
        className="inline-flex items-center gap-4 font-mono text-xs"
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
                border-b-2 pb-0.5 transition-colors
                ${
                  active
                    ? 'border-[var(--color-accent)] text-[var(--color-fg)]'
                    : 'border-transparent text-[var(--color-fg-subtle)] hover:text-[var(--color-fg-muted)]'
                }
              `}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Both boxes share one grid cell so the widget always sizes to the
          taller one (the lib box, with its PM tab row) — toggling never
          shifts the layout. The hidden box stays in flow via `invisible`.
          `grid-cols-1` bounds the track to minmax(0,1fr) and `min-w-0` lets
          the cell shrink below the command's width, so a long command scrolls
          inside the box on narrow screens instead of overflowing the page. */}
      <div className="grid w-full grid-cols-1">
        <div
          className={`col-start-1 row-start-1 flex min-w-0 items-center justify-center ${
            mode === 'lib' ? '' : 'pointer-events-none invisible'
          }`}
          aria-hidden={mode !== 'lib'}
        >
          <InstallCommand />
        </div>
        <div
          className={`col-start-1 row-start-1 flex min-w-0 items-center justify-center ${
            mode === 'skill' ? '' : 'pointer-events-none invisible'
          }`}
          aria-hidden={mode !== 'skill'}
        >
          <CopyCommand
            command={SKILL_COMMAND}
            label="Install the react-call agent skill"
          />
        </div>
      </div>
    </div>
  )
}
