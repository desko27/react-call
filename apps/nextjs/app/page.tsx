import { OpenButton } from './OpenButton'

// SERVER COMPONENT. The actual `.call()` invocation lives in
// OpenButton (a Client Component) since `.call()` must run on the
// client — but the page itself is allowed to be a Server Component.
export default async function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>react-call Next.js / RSC playground</h1>
      <p>
        Reproduces issue{' '}
        <a href="https://github.com/desko27/react-call/issues/39">#39</a>. The
        layout.tsx is a Server Component that mounts the Callable imported from
        a Client Component module.
      </p>
      <OpenButton />
    </main>
  )
}
