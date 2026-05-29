import { Lightbox } from './callable'

const THUMBNAILS = [
  {
    thumb:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=160&h=120&fit=crop',
    full: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200',
    alt: 'Circuit board macro',
  },
  {
    thumb:
      'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=160&h=120&fit=crop',
    full: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=1200',
    alt: 'Forest path',
  },
  {
    thumb:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=160&h=120&fit=crop',
    full: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
    alt: 'Mountains at dusk',
  },
]

export const Gallery = () => {
  const handleClick = (src: string, alt: string) => () =>
    Lightbox.call({ src, alt })

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-2">
        {THUMBNAILS.map((t) => (
          <button
            key={t.thumb}
            type="button"
            onClick={handleClick(t.full, t.alt)}
            className="overflow-hidden rounded-md border border-[var(--color-border)] transition-transform hover:scale-105"
          >
            <img src={t.thumb} alt={t.alt} className="h-20 w-28 object-cover" />
          </button>
        ))}
      </div>
      <span className="font-mono text-xs text-[var(--color-fg-subtle)]">
        click a thumbnail → lightbox
      </span>
    </div>
  )
}
