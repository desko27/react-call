import { type MouseEvent, useState } from 'react'
import { BottomSheet } from '~/examples/bottom-sheet/callable'
import { ColorPicker } from '~/examples/color-picker/callable'
import {
  type Command,
  CommandPalette,
} from '~/examples/command-palette/callable'
import { ContextMenu } from '~/examples/context-menu/callable'
import { Toast } from '~/examples/progress-toast/callable'
import { Wizard } from '~/examples/wizard/callable'
import { type Result, ResultBadge } from './ResultBadge'

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

const SHEET_ACTIONS = [
  { id: 'share', label: 'Share', icon: '⇪' },
  { id: 'copy-link', label: 'Copy link', icon: '⤴' },
  { id: 'pin', label: 'Pin', icon: '📌' },
  { id: 'archive', label: 'Archive', icon: '🗄' },
] as const

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

const formatString = (v: string | null): Result => ({
  value: v ?? 'null',
  highlighted: v !== null,
  ts: Date.now(),
})

const formatVoid = (label: string): Result => ({
  value: label,
  highlighted: true,
  ts: Date.now(),
})

interface CardProps {
  slug: string
  category: string
  title: string
  description: string
  buttonLabel?: string
  onTry: (e?: MouseEvent) => Promise<Result>
}

const Card = ({
  slug,
  category,
  title,
  description,
  buttonLabel = 'Try it →',
  onTry,
}: CardProps) => {
  const [result, setResult] = useState<Result | null>(null)
  const [pending, setPending] = useState(false)

  const handleClick = async (e: MouseEvent) => {
    setPending(true)
    try {
      const next = await onTry(e)
      setResult(next)
    } finally {
      setPending(false)
    }
  }

  return (
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
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={handleClick}
          disabled={pending}
          className="rounded-md border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-3 py-1.5 text-xs text-[var(--color-fg)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-50"
        >
          {buttonLabel}
        </button>
        <a
          href={`/examples/${slug}`}
          className="font-mono text-xs text-[var(--color-fg-subtle)] transition-colors hover:text-[var(--color-fg-muted)]"
        >
          See code ↗
        </a>
      </div>
      <div className="mt-3 h-5">
        <ResultBadge result={result} />
      </div>
    </div>
  )
}

interface Props {
  exampleCount: number
}

export const NotJustConfirmations = ({ exampleCount }: Props) => {
  const fireCommand = async (): Promise<Result> => {
    const v = await CommandPalette.call({ commands: COMMANDS })
    return formatString(v)
  }

  const fireBottomSheet = async (): Promise<Result> => {
    const v = await BottomSheet.call({
      title: 'Quick actions',
      actions: SHEET_ACTIONS,
    })
    return formatString(v)
  }

  const fireWizard = async (): Promise<Result> => {
    const data = await Wizard.call()
    return data
      ? formatVoid(`${data.name} · ${data.email} · ${data.plan}`)
      : formatString(null)
  }

  const firePicker = async (): Promise<Result> => {
    const v = await ColorPicker.call({ swatches: SWATCHES })
    return formatString(v)
  }

  const fireContextMenu = async (e?: MouseEvent): Promise<Result> => {
    e?.preventDefault()
    const x = e?.clientX ?? window.innerWidth / 2
    const y = e?.clientY ?? window.innerHeight / 2
    const v = await ContextMenu.call({
      x,
      y,
      actions: [
        { id: 'edit', label: 'Edit' },
        { id: 'duplicate', label: 'Duplicate' },
        { id: 'delete', label: 'Delete', destructive: true },
      ],
    })
    return formatString(v)
  }

  const fireToast = async (): Promise<Result> => {
    Toast.upsert({ message: 'Starting…', percent: 0 })
    for (let p = 20; p <= 100; p += 20) {
      await sleep(180)
      Toast.upsert({ message: `Working… ${p}%`, percent: p })
    }
    await sleep(500)
    Toast.end()
    return formatVoid('done')
  }

  return (
    <>
      <CommandPalette />
      <BottomSheet />
      <Wizard />
      <ColorPicker />
      <ContextMenu />
      <Toast />

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
            actual <code className="font-mono text-sm">.call()</code> happen —
            the badge below the button shows what the promise resolved with.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card
            slug="command-palette"
            category="Menu"
            title="Command palette"
            description="⌘K-style search. Arrow keys to navigate, Enter to run."
            onTry={fireCommand}
          />
          <Card
            slug="bottom-sheet"
            category="Drawer"
            title="Bottom sheet"
            description="Slides up from the bottom — resolves with the action you tap."
            onTry={fireBottomSheet}
          />
          <Card
            slug="wizard"
            category="Flow"
            title="Multi-step wizard"
            description="A 3-step signup — one await resolves with the whole form."
            onTry={fireWizard}
          />
          <Card
            slug="color-picker"
            category="Picker"
            title="Color picker"
            description="Click a swatch — resolves with the hex value."
            onTry={firePicker}
          />
          <Card
            slug="context-menu"
            category="Menu"
            title="Context menu"
            description="Forwards the cursor position to a positioned Callable."
            onTry={fireContextMenu}
          />
          <Card
            slug="progress-toast"
            category="Notification"
            title="Progress toast"
            description="A singleton that updates itself via upsert() as work progresses."
            onTry={fireToast}
          />
        </div>

        <div className="mt-10 text-center">
          <a
            href="/examples"
            className="inline-flex items-center gap-2 font-mono text-sm text-[var(--color-accent)] transition-colors hover:underline"
          >
            See all {exampleCount} examples
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>
    </>
  )
}
