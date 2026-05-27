import { Confirm } from '~/examples/confirm-dialog/callable'
import { ColorPicker } from '~/examples/color-picker/callable'
import {
  CommandPalette,
  type Command,
} from '~/examples/command-palette/callable'
import { ContextMenu } from '~/examples/context-menu/callable'
import { Lightbox } from '~/examples/image-lightbox/callable'
import { Toast } from '~/examples/progress-toast/callable'

const SWATCHES = [
  '#ef4444',
  '#f97316',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#e11d74',
] as const

const COMMANDS: readonly Command[] = [
  { id: 'open-file', label: 'Open file', shortcut: '⌘ O' },
  { id: 'find', label: 'Find in files', shortcut: '⌘ ⇧ F' },
  { id: 'toggle-theme', label: 'Toggle theme' },
  { id: 'restart', label: 'Restart' },
]

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

interface CardProps {
  category: string
  title: string
  description: string
  onTry: () => void
}

const Card = ({ category, title, description, onTry }: CardProps) => (
  <div className="flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-5">
    <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
      {category}
    </p>
    <h3 className="mt-1 text-base font-medium text-[var(--color-fg)]">
      {title}
    </h3>
    <p className="mt-2 flex-1 text-sm text-[var(--color-fg-muted)]">
      {description}
    </p>
    <button
      type="button"
      onClick={onTry}
      className="mt-4 self-start rounded-md border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-3 py-1.5 text-xs text-[var(--color-fg)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
    >
      Try it →
    </button>
  </div>
)

export const NotJustConfirmations = () => {
  const fireConfirm = () =>
    Confirm.call({ message: 'A real .call() — same as yours.' })

  const fireToast = async () => {
    Toast.upsert({ message: 'Starting…', percent: 0 })
    for (let p = 20; p <= 100; p += 20) {
      await sleep(180)
      Toast.upsert({ message: `Working… ${p}%`, percent: p })
    }
    await sleep(500)
    Toast.end()
  }

  const firePicker = () => ColorPicker.call({ swatches: SWATCHES })
  const fireCommand = () => CommandPalette.call({ commands: COMMANDS })
  const fireLightbox = () =>
    Lightbox.call({
      src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1400',
      alt: 'Circuit board',
    })

  const fireContextMenu = (e: React.MouseEvent) => {
    ContextMenu.call({
      x: e.clientX,
      y: e.clientY,
      actions: [
        { id: 'edit', label: 'Edit' },
        { id: 'duplicate', label: 'Duplicate' },
        { id: 'delete', label: 'Delete', destructive: true },
      ],
    })
  }

  return (
    <>
      <Confirm />
      <Toast />
      <ColorPicker />
      <CommandPalette />
      <Lightbox />
      <ContextMenu />

      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
            But not only confirmations
          </p>
          <h2 className="mt-3 text-3xl font-medium tracking-tight text-[var(--color-fg)] md:text-4xl">
            Any component you can{' '}
            <span className="font-mono text-[var(--color-accent)]">await</span>.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-[var(--color-fg-muted)]">
            Each card below is a real Callable. Click any "Try it" to see the
            actual <code className="font-mono text-sm">.call()</code> happen.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card
            category="Dialog"
            title="Confirm"
            description="The simplest case. Returns a boolean to the caller."
            onTry={fireConfirm}
          />
          <Card
            category="Notification"
            title="Progress toast"
            description="A singleton that updates itself via upsert() as work progresses."
            onTry={fireToast}
          />
          <Card
            category="Picker"
            title="Color picker"
            description="Click a swatch — resolves with the hex value."
            onTry={firePicker}
          />
          <Card
            category="Menu"
            title="Command palette"
            description="⌘K-style search. Arrow keys to navigate, Enter to run."
            onTry={fireCommand}
          />
          <div className="flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-5">
            <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
              Menu
            </p>
            <h3 className="mt-1 text-base font-medium text-[var(--color-fg)]">
              Context menu
            </h3>
            <p className="mt-2 flex-1 text-sm text-[var(--color-fg-muted)]">
              Forwards the cursor position to a positioned Callable.
            </p>
            <button
              type="button"
              onContextMenu={(e) => {
                e.preventDefault()
                fireContextMenu(e)
              }}
              onClick={(e) => fireContextMenu(e)}
              className="mt-4 self-start rounded-md border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-3 py-1.5 text-xs text-[var(--color-fg)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              Right-click or tap →
            </button>
          </div>
          <Card
            category="Overlay"
            title="Image lightbox"
            description="Open a fullscreen overlay. Backdrop or Esc closes."
            onTry={fireLightbox}
          />
        </div>

        <div className="mt-10 text-center">
          <a
            href="/examples"
            className="inline-flex items-center gap-2 font-mono text-sm text-[var(--color-accent)] transition-colors hover:underline"
          >
            See all 15 examples
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>
    </>
  )
}
