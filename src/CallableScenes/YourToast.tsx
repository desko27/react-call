import { useEffect, useState } from 'react'
import { clsx } from 'clsx'

import { createCallable } from '#lib/main'

export const YourToast = createCallable<void, 'finished'>(({ call }) => {
  const [seconds, setSeconds] = useState(3)

  // biome-ignore lint/correctness/useExhaustiveDependencies: `call.end` is ok
  useEffect(() => {
    const id = window.setTimeout(() => {
      if (seconds > 1) {
        setSeconds(seconds - 1)
        return
      }
      call.end('finished')
    }, 1000)

    return () => {
      window.clearTimeout(id)
    }
  }, [seconds])

  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4">
        <div
          className={clsx(
            'pointer-events-auto',
            'w-full max-w-sm rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-4 backdrop-blur-2xl',
            `animate-duration-300 ${call.ended ? 'animate-fade-out-down' : 'animate-fade-in-up'}`,
          )}
        >
          <h3 className="text-base/7 font-medium text-white">
            🍞 I'll return{' '}
            <code className="text-orange-400 text-base">'finished'</code> in{' '}
            {seconds} seconds!
          </h3>
          <div
            className={clsx(
              'h-2 bg-blue-400 mt-2',
              'animate-contract-horizontally origin-left animate-linear animate-duration-[3000ms]',
            )}
          />
        </div>
      </div>
    </div>
  )
}, 300)
