export function Heading(): JSX.Element {
  return (
    <div className="text-center space-y-1">
      <span className="text-5xl">⚛️ 📡</span>
      <h1 className="text-6xl font-bold bg-gradient-to-br from-fuchsia-800 to-fuchsia-400 bg-clip-text text-transparent">
        react-call
      </h1>
      <div className="text-fuchsia-400 text-lg">
        <h2 className="inline">Call your React components</h2> |{' '}
        <a
          className="text-fuchsia-300 hover:text-fuchsia-100 hover:underline"
          target="_blank"
          rel="noreferrer"
          href="https://github.com/desko27/react-call"
        >
          See docs ↗
        </a>
      </div>
    </div>
  )
}
