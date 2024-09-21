import { clsx } from 'clsx'

export function Heading(): JSX.Element {
  return (
    <div className="text-center space-y-1">
      <h1
        className={clsx(
          'font-bold text-5xl md:text-6xl',
          'bg-gradient-to-br from-fuchsia-800 to-fuchsia-400 bg-clip-text text-transparent',
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
            'inline-block px-4 py-2 rounded-full',
            'bg-gradient-to-br from-fuchsia-900 to-fuchsia-600 hover:bg-fuchsia-500',
            'text-slate-100 font-semibold',
            'shadow-lg hover:shadow-fuchsia-500/20 hover:scale-110',
            'focus:outline-none focus:outline-1 focus:outline-white',
          )}
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/desko27/react-call#readme"
        >
          Read the docs ↗
        </a>
      </div>
    </div>
  )
}
