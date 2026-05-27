import { useEffect } from 'react'
import { createCallable } from 'react-call'

interface Props {
  src: string
  alt: string
}

export const Lightbox = createCallable<Props, void>(({ call, src, alt }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') call.end()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [call])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
      onClick={() => call.end()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <img
        src={src}
        alt={alt}
        className="max-h-full max-w-full rounded-md shadow-2xl"
      />
      <button
        type="button"
        onClick={() => call.end()}
        aria-label="Close"
        className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-white backdrop-blur transition-colors hover:bg-white/20"
      >
        ×
      </button>
    </div>
  )
})
Lightbox.displayName = 'Lightbox'
