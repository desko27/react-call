import { useState } from 'react'

import { YourComponent } from '../../YourComponent'

export function Action(): JSX.Element {
  const [lastResponse, setLastResponse] = useState<boolean | null>(null)

  const handleClick = async () => {
    const response = await YourComponent.call()
    setLastResponse(response)
  }

  return (
    <div className="flex gap-6 flex-wrap items-center justify-center">
      <button
        className="transition-all duration-500 hover:scale-110 hover:-rotate-1 bg-emerald-700 hover:bg-emerald-600 shadow-md hover:shadow-emerald-500/20 text-slate-100 hover:text-white px-3 py-1 text-base font-semibold rounded-md focus:outline-none focus:outline-1 focus:outline-white"
        type="button"
        onClick={handleClick}
      >
        <pre>YourComponent.call()</pre>
      </button>
      {lastResponse !== null && (
        <span className="text-fuchsia-400 text-lg font-semibold">
          <span>Responded</span>{' '}
          <code className="text-orange-400 text-base">
            `{lastResponse.toString()}`
          </code>
        </span>
      )}
    </div>
  )
}
