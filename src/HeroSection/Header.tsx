import { clsx } from 'clsx'
import { Github } from '@react-symbols/icons'

import { version } from '../../package.json'

export function Header(): JSX.Element {
  return (
    <header
      className={clsx(
        'p-6 text-violet-300 text-lg font-semibold tracking-wider flex justify-between',
        'animate-fade-in-down animate-delay-1000',
      )}
    >
      <span>
        <a
          className="hover:text-violet-100 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
          href={`https://github.com/desko27/react-call/releases/tag/v${version}`}
        >
          v{version}
        </a>
      </span>
      <a
        className="group hover:text-violet-100 flex items-center gap-1"
        target="_blank"
        rel="noopener noreferrer"
        href="https://github.com/desko27/react-call"
      >
        <Github className="inline-block size-7" />
        <span className="group-hover:underline">GitHub</span>
      </a>
    </header>
  )
}
