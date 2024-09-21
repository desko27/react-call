import { clsx } from 'clsx'

import { version } from '../../package.json'

export function Header(): JSX.Element {
  return (
    <header
      className={clsx(
        'p-6 text-fuchsia-300 text-lg font-semibold tracking-wider flex justify-between',
        'animate-fade-in-down animate-delay-1000',
      )}
    >
      <span>
        <a
          className="hover:text-fuchsia-100 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
          href={`https://github.com/desko27/react-call/releases/tag/v${version}`}
        >
          v{version}
        </a>
      </span>
      <span>
        ⭐️{' '}
        <a
          className="hover:text-fuchsia-100 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/desko27/react-call"
        >
          GitHub ↗
        </a>
      </span>
    </header>
  )
}
