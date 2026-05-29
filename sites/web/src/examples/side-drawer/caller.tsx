import { useState } from 'react'
import { type Settings, SettingsDrawer } from './callable'

const INITIAL: Settings = {
  notifications: true,
  syncOnLaunch: false,
  theme: 'system',
}

export const OpenSettingsButton = () => {
  const [settings, setSettings] = useState<Settings>(INITIAL)

  const handleClick = async () => {
    const next = await SettingsDrawer.call({ initial: settings })
    // Cancel / dismiss resolves with null — keep current settings.
    if (next) setSettings(next)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={handleClick}
        className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)]"
      >
        Open settings
      </button>
      <p className="font-mono text-xs text-[var(--color-fg-subtle)]">
        notifications=
        <span className="text-[var(--color-fg-muted)]">
          {String(settings.notifications)}
        </span>
        {' · '}sync=
        <span className="text-[var(--color-fg-muted)]">
          {String(settings.syncOnLaunch)}
        </span>
        {' · '}theme=
        <span className="text-[var(--color-fg-muted)]">{settings.theme}</span>
      </p>
    </div>
  )
}
