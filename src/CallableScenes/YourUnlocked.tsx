import { useEffect } from 'react'
import { clsx } from 'clsx'
import { createCallable } from '#lib/main'

export const YourUnlocked = createCallable<void, void>(({ call }) => {
  // biome-ignore lint/correctness/useExhaustiveDependencies: `call.end` is ok
  useEffect(() => {
    const id = window.setTimeout(() => {
      call.end()
    }, 3000)

    return () => {
      window.clearTimeout(id)
    }
  }, [])

  return (
    <div
      className={clsx(
        'py-3 px-4 rounded-md fixed top-16 right-6 flex flex-col gap-1 w-min',
        'bg-gradient-to-br from-lime-600/50 to-lime-800/50 backdrop-blur-2xl',
        `animate-duration-300 ${call.ended ? 'animate-fade-out-right' : 'animate-fade-in-left'}`,
      )}
    >
      <div className="whitespace-nowrap text-lime-200 uppercase text-sm font-semibold tracking-wide">
        🎖️ Achievement unlocked!
      </div>
      <div
        className={clsx(
          'h-0.5 bg-white opacity-30 rounded-full',
          'animate-contract-horizontally animate-linear animate-duration-[3000ms]',
        )}
      />
      <div className="text-center text-lime-100 text-sm">
        Not just about dialogs!
      </div>
    </div>
  )
}, 300)
