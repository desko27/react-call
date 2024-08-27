import { version } from '../../package.json'

export function Header(): JSX.Element {
  return (
    <header className="p-6 text-fuchsia-300 text-lg font-semibold tracking-wider flex justify-between">
      <span>
        <a
          className="hover:text-fuchsia-100 hover:underline"
          target="_blank"
          rel="noreferrer"
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
          rel="noreferrer"
          href="https://github.com/desko27/react-call"
        >
          GitHub
        </a>
      </span>
    </header>
  )
}
