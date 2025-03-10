import { clsx } from 'clsx'
import { Github } from '@react-symbols/icons'

export function Heading() {
  return (
    <div className="text-center space-y-1">
      <h1
        className={clsx(
          'font-bold text-5xl md:text-6xl',
          'bg-linear-to-br from-fuchsia-800 to-fuchsia-400 bg-clip-text text-transparent',
          'animate-fade-in-down',
        )}
      >
        📡 react-call
      </h1>
      <h2 className="pb-2 text-fuchsia-400 text-lg animate-fade-in-down animate-delay-100">
        Call your React components
      </h2>
      <div className="animate-fade-in-down animate-delay-200">
        <a
          className={clsx(
            'transition-all duration-500',
            'inline-block px-3 py-2 rounded-full',
            'border-2 border-violet-400 text-violet-400 font-semibold',
            'hover:border-violet-200 hover:text-violet-200',
            'shadow-lg hover:shadow-violet-500/20 hover:scale-110',
            'focus:outline-hidden focus:outline-1 focus:outline-white',
            'inline-flex items-center gap-1',
          )}
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/desko27/react-call#readme"
        >
          <Github className="inline-block size-6" /> Read the docs
        </a>
      </div>
    </div>
  )
}
