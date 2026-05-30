import { type ReactNode, useEffect, useRef, useState } from 'react'
import { createCallable } from 'react-call'

export type Theme = 'system' | 'light' | 'dark'

export interface Settings {
  notifications: boolean
  syncOnLaunch: boolean
  theme: Theme
}

interface Props {
  initial: Settings
}

// Keep the finished call mounted long enough for the slide-out to play.
// Must match the CSS transition duration below.
const UNMOUNTING_DELAY = 300

export const SettingsDrawer = createCallable<Props, Settings | null>(
  ({ call, initial }) => {
    const drawerRef = useRef<HTMLDivElement>(null)
    const [settings, setSettings] = useState<Settings>(initial)

    // Animate in on mount, out once the call has ended. `call.ended` is
    // true during the unmounting delay — that's the window the exit
    // transition plays in before react-call drops the call from the stack.
    // The flag flips in an effect (post-paint), so the browser commits the
    // off-screen state first and the slide-in has somewhere to animate from.
    const [entered, setEntered] = useState(false)
    useEffect(() => setEntered(true), [])
    const open = entered && !call.ended

    useEffect(() => {
      const onPointer = (e: MouseEvent) => {
        if (
          drawerRef.current &&
          !drawerRef.current.contains(e.target as Node)
        ) {
          call.end(null)
        }
      }
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') call.end(null)
      }
      document.addEventListener('mousedown', onPointer)
      document.addEventListener('keydown', onKey)
      return () => {
        document.removeEventListener('mousedown', onPointer)
        document.removeEventListener('keydown', onKey)
      }
    }, [call])

    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        className={`fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
      >
        <div
          ref={drawerRef}
          className={`flex h-full w-full max-w-sm flex-col border-l border-[var(--color-border)] bg-[var(--color-bg)] shadow-2xl transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
            <p className="text-base font-medium text-[var(--color-fg)]">
              Settings
            </p>
            <button
              type="button"
              onClick={() => call.end(null)}
              aria-label="Close"
              className="-mr-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-base leading-none text-[var(--color-fg-subtle)] transition-colors hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-fg)]"
            >
              ×
            </button>
          </div>

          <div className="flex-1 space-y-5 p-6 text-sm">
            <Row
              label="Notifications"
              hint="Browser notifications for new mentions."
            >
              <Toggle
                checked={settings.notifications}
                onChange={(notifications) =>
                  setSettings({ ...settings, notifications })
                }
              />
            </Row>
            <Row label="Sync on launch" hint="Fetch latest data on app start.">
              <Toggle
                checked={settings.syncOnLaunch}
                onChange={(syncOnLaunch) =>
                  setSettings({ ...settings, syncOnLaunch })
                }
              />
            </Row>
            <Row label="Theme" hint="Visual theme used across the app.">
              <select
                value={settings.theme}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    theme: e.target.value as Theme,
                  })
                }
                className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-2 py-1 text-sm text-[var(--color-fg)] focus:border-[var(--color-accent)] focus:outline-none"
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </Row>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-[var(--color-border)] px-6 py-4">
            <button
              type="button"
              onClick={() => call.end(null)}
              className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => call.end(settings)}
              className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)]"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    )
  },
  UNMOUNTING_DELAY,
)
SettingsDrawer.displayName = 'SettingsDrawer'

interface RowProps {
  label: string
  hint: string
  children: ReactNode
}

const Row = ({ label, hint, children }: RowProps) => (
  <div className="flex items-start justify-between gap-4">
    <div>
      <p className="font-medium text-[var(--color-fg)]">{label}</p>
      <p className="mt-0.5 text-xs text-[var(--color-fg-subtle)]">{hint}</p>
    </div>
    {children}
  </div>
)

interface ToggleProps {
  checked: boolean
  onChange: (next: boolean) => void
}

const Toggle = ({ checked, onChange }: ToggleProps) => (
  <input
    type="checkbox"
    checked={checked}
    onChange={(e) => onChange(e.target.checked)}
    className="mt-1 accent-[var(--color-accent)]"
  />
)
