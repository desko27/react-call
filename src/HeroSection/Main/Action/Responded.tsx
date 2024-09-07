import { useEffect } from 'react'
import { clsx } from 'clsx'
import { createCallable } from '#lib/main'

const DURATION = 2000

export const Responded = createCallable<{ response?: string }>(
  ({ call, response }) => {
    // biome-ignore lint/correctness/useExhaustiveDependencies: `call.end` is ok
    useEffect(() => {
      const id = window.setTimeout(() => {
        call.end()
      }, DURATION)

      return () => {
        window.clearTimeout(id)
      }
    }, [])

    return (
      <div
        className={clsx(
          'text-fuchsia-400 text-lg font-semibold pointer-events-none',
          `animate-duration-500 ${call.ended ? 'animate-fade-out-up-lg' : 'animate-fade-in-down-lg'}`,
        )}
      >
        <span>Responded</span>{' '}
        {response ? (
          <code className="text-orange-400 text-base">{response}</code>
        ) : (
          <span>nothing</span>
        )}
      </div>
    )
  },
  500,
)
