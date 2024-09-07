import { useMemo } from 'react'
import { clsx } from 'clsx'
import { createCallable } from '#lib/main'

const MAX_DELAY = 1000
const ABC = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))

export const YourBubbles = createCallable<void, string>(({ call }) => {
  const attrs = useMemo(
    () =>
      ABC.map(() => ({
        pos: {
          x: Math.random() * (window.innerWidth - 48),
          y: Math.random() * (window.innerHeight - 48),
        },
        delay: Math.random() * MAX_DELAY,
      })),
    [],
  )

  return (
    <div className="fixed inset-0 pointer-events-none">
      {ABC.map((letter, i) => (
        <div
          key={letter}
          className="pointer-events-auto absolute top-[var(--y)] left-[var(--x)]"
          style={
            {
              '--x': `${attrs[i].pos.x}px`,
              '--y': `${attrs[i].pos.y}px`,
            } as React.CSSProperties
          }
        >
          <div
            className={clsx(
              `animate-duration-300 ${call.ended ? 'animate-zoom-out' : 'animate-zoom-in'}`,
              'animate-delay-[var(--delay)]',
            )}
            style={{ '--delay': `${attrs[i].delay}ms` } as React.CSSProperties}
          >
            <div className="transition-all duration-500 hover:scale-150">
              <button
                className={clsx(
                  'bg-gradient-to-br opacity-75 from-yellow-300 to-yellow-600 backdrop-blur-2xl',
                  'w-12 h-12 rounded-full text-xl text-black font-semibold',
                  'transition-all duration-500 hover:cursor-pointer hover:opacity-100',
                  'animate-bouncing animate-iteration-count-infinite animate-delay-[var(--delay)]',
                )}
                type="button"
                onClick={() => call.end(letter)}
              >
                {letter}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}, MAX_DELAY + 300)
