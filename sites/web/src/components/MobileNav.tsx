import clsx from 'clsx'
import { useEffect, useId, useRef, useState } from 'react'

interface NavLink {
  href: string
  label: string
  external?: boolean
}

interface MobileNavProps {
  links: NavLink[]
}

/**
 * Disclosure-pattern hamburger for the header below `md`. The links are
 * always rendered (toggled via CSS, never conditionally mounted) so they
 * stay in the static HTML and remain crawlable.
 */
export const MobileNav = ({ links }: MobileNavProps) => {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls={panelId}
        className="
          inline-flex h-9 w-9 items-center justify-center rounded-md
          border border-[var(--color-border)]
          bg-[var(--color-bg-subtle)]
          text-[var(--color-fg-muted)]
          transition-colors
          hover:border-[var(--color-border-strong)] hover:text-[var(--color-fg)]
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {open ? (
            <path d="M18 6 6 18M6 6l12 12" />
          ) : (
            <path d="M3 6h18M3 12h18M3 18h18" />
          )}
        </svg>
      </button>

      <nav
        id={panelId}
        aria-label="Site"
        className={clsx(
          'absolute top-full right-0 z-50 mt-2 min-w-44',
          'rounded-md border border-[var(--color-border)]',
          'bg-[var(--color-bg)] p-1.5 shadow-lg shadow-black/5',
          open ? 'block' : 'hidden',
        )}
      >
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            {...(link.external
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {})}
            className="
              block whitespace-nowrap rounded px-3 py-2
              text-sm text-[var(--color-fg-muted)]
              transition-colors
              hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-fg)]
            "
          >
            {link.label}
          </a>
        ))}
      </nav>
    </div>
  )
}
