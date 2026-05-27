import { SideDrawer } from './callable'

export const OpenSettingsButton = () => {
  const handleClick = () =>
    SideDrawer.call({
      title: 'Settings',
      body: (
        <div className="space-y-4">
          <label className="flex items-center justify-between gap-3">
            <span>Notifications</span>
            <input
              type="checkbox"
              defaultChecked
              className="accent-[var(--color-accent)]"
            />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span>Sync on launch</span>
            <input type="checkbox" className="accent-[var(--color-accent)]" />
          </label>
          <p className="text-xs text-[var(--color-fg-subtle)]">
            Closing the drawer ends the call with void.
          </p>
        </div>
      ),
    })

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)]"
    >
      Open settings
    </button>
  )
}
