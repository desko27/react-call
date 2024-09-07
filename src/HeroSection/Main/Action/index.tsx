import { useState } from 'react'
import { clsx } from 'clsx'

import { DISABLED_COLORS, getCurrentScene, getNextScene } from './scenes'
import { Responded } from './Responded'

export function Action({
  sceneName,
  onNextScene,
}: {
  sceneName: string
  onNextScene: (name: string) => void
}): JSX.Element {
  const [callActive, setCallActive] = useState(false)
  const [isWobbling, setIsWobbling] = useState(false)
  const scene = getCurrentScene(sceneName)

  const handleClick = async () => {
    setCallActive(true)
    const response = await scene.trigger()
    await Responded.call({ response })
    await new Promise((r) => window.setTimeout(r, 250))
    setCallActive(false)
    onNextScene(getNextScene(sceneName))

    setIsWobbling(true)
    window.setTimeout(() => setIsWobbling(false), 900)
  }

  return (
    <div className="text-center animate-pulse-fade-in animate-delay-800">
      <div
        className={`${isWobbling ? 'animate-tada animate-duration-[900ms]' : ''}`}
      >
        <div className="animate-float animate-iteration-count-infinite">
          <button
            className={clsx(
              'transition-all duration-500',
              'w-[calc-size(auto)] shadow-md px-3 py-1 text-base font-semibold rounded-md',
              'focus:outline-none focus:outline-1 focus:outline-white',
              callActive
                ? `${DISABLED_COLORS} opacity-50`
                : `${scene.buttonColors} hover:scale-110 hover:-rotate-1`,
            )}
            type="button"
            onClick={handleClick}
            disabled={callActive}
          >
            <code>{sceneName}.call()</code>
            {!!scene.times && ` x${scene.times}`}
          </button>
        </div>
      </div>
      <div className="pt-6 overflow-hidden select-none">
        <div className="h-8">
          <Responded.Root />
        </div>
      </div>
    </div>
  )
}
