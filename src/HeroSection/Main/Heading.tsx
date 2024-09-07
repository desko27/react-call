import { clsx } from 'clsx'

export function Heading(): JSX.Element {
  return (
    <div className="text-center space-y-1">
      <div className="text-5xl animate-fade-in-down">
        <span className="inline-block animate-vertical-bounce animate-delay-[1800ms]">
          ⚛️
        </span>{' '}
        <span className="inline-block animate-vertical-bounce animate-delay-[1400ms]">
          📡
        </span>
      </div>
      <h1
        className={clsx(
          'text-6xl font-bold bg-gradient-to-br from-fuchsia-800 to-fuchsia-400 bg-clip-text text-transparent',
          'animate-fade-in-down animate-delay-100',
        )}
      >
        react-call
      </h1>
      <div className="text-fuchsia-400 text-lg animate-fade-in-down animate-delay-200">
        <h2 className="inline">Call your React components</h2> |{' '}
        <a
          className="whitespace-nowrap text-fuchsia-300 hover:text-fuchsia-100 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/desko27/react-call"
        >
          See docs ↗
        </a>
      </div>
    </div>
  )
}
