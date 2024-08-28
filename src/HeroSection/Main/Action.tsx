import { useState, useRef } from 'react'

import { YourComponent } from '../../YourComponent'

export function Action(): JSX.Element {
  const [lastResponse, setLastResponse] = useState<boolean | null>(null)
  const [responseActive, setResponseActive] = useState(false)
  const lastTimeoutRef = useRef<number | null>(null)

  const handleClick = async () => {
    if (lastTimeoutRef.current !== null)
      window.clearTimeout(lastTimeoutRef.current)

    const response = await YourComponent.call()
    setLastResponse(response)
    setResponseActive(true)

    lastTimeoutRef.current = window.setTimeout(
      () => setResponseActive(false),
      2000,
    )
  }

  return (
    <div className="space-y-6 text-center animate-pulse-fade-in animate-delay-800">
      <div className="animate-float animate-iteration-count-infinite">
        <button
          className="transition-all duration-500 hover:scale-110 hover:-rotate-1 bg-emerald-700 hover:bg-emerald-600 shadow-md hover:shadow-emerald-500/20 text-slate-100 hover:text-white px-3 py-1 text-base font-semibold rounded-md focus:outline-none focus:outline-1 focus:outline-white"
          type="button"
          onClick={handleClick}
        >
          <pre>YourComponent.call()</pre>
        </button>
      </div>
      <div
        className={`text-fuchsia-400 text-lg font-semibold overflow-hidden transition-all duration-500 relative -z-10 pointer-events-none ${!responseActive ? 'opacity-0 -translate-y-16' : 'opacity-1'}`}
      >
        <span>Responded</span>{' '}
        <code className="text-orange-400 text-base">
          `{lastResponse?.toString()}`
        </code>
      </div>
    </div>
  )
}
