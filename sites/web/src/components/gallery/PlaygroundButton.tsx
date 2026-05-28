import LZString from 'lz-string'
import { useState } from 'react'

interface Props {
  title: string
  callableFilename: string
  callableSource: string
  callerFilename: string
  callerSource: string
}

const exportNameFromSource = (source: string, fallback: string): string => {
  const m =
    source.match(/export\s+const\s+([A-Za-z0-9_]+)/) ||
    source.match(/export\s+function\s+([A-Za-z0-9_]+)/)
  return m ? m[1] : fallback
}

const rewriteCallerImports = (source: string, callableModule: string) =>
  source.replace(/from\s+['"]\.\/callable['"]/g, `from './${callableModule}'`)

// CodeSandbox's `create-react-app-typescript` template handles entry
// injection (no `<script src>` needed) and bundles src/index.tsx itself.
// We just supply public/index.html, an entry, App, and the two files.
const PUBLIC_INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>react-call playground</title>
    <style>
      body {
        font-family: system-ui, -apple-system, sans-serif;
        margin: 0;
        padding: 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        min-height: 100vh;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`

const INDEX_TSX = `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

const root = createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)
`

const buildApp = (callableExport: string, callerExport: string) =>
  `import { ${callableExport} } from './Callable'
import { ${callerExport} } from './Caller'

export default function App() {
  return (
    <>
      <${callableExport} />
      <${callerExport} />
    </>
  )
}
`

// react-call v2 (the @next tag) works with React 18+. Pinning to 18 in the
// sandbox is the safest pairing with CodeSandbox's classic React bundler,
// which doesn't always keep up with brand-new React releases.
const PKG = JSON.stringify(
  {
    name: 'react-call-playground',
    version: '1.0.0',
    main: 'src/index.tsx',
    dependencies: {
      react: '^18.3.1',
      'react-dom': '^18.3.1',
      'react-call': 'next',
    },
    devDependencies: {
      '@types/react': '^18.3.0',
      '@types/react-dom': '^18.3.0',
      typescript: '^5.4.0',
    },
  },
  null,
  2,
)

const TSCONFIG = JSON.stringify(
  {
    compilerOptions: {
      target: 'ESNext',
      lib: ['DOM', 'DOM.Iterable', 'ESNext'],
      module: 'ESNext',
      moduleResolution: 'node',
      jsx: 'react-jsx',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      allowSyntheticDefaultImports: true,
      forceConsistentCasingInFileNames: true,
      isolatedModules: true,
      resolveJsonModule: true,
      noEmit: true,
    },
    include: ['src'],
  },
  null,
  2,
)

const getParameters = (payload: object): string =>
  LZString.compressToBase64(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

export const PlaygroundButton = ({
  title,
  callableFilename,
  callableSource,
  callerFilename,
  callerSource,
}: Props) => {
  const [opening, setOpening] = useState(false)

  const handleClick = () => {
    setOpening(true)
    try {
      const callableExport = exportNameFromSource(callableSource, 'Callable')
      const callerExport = exportNameFromSource(callerSource, 'Caller')

      const files: Record<string, { content: string }> = {
        'package.json': { content: PKG },
        'tsconfig.json': { content: TSCONFIG },
        'public/index.html': { content: PUBLIC_INDEX_HTML },
        'src/index.tsx': { content: INDEX_TSX },
        'src/App.tsx': { content: buildApp(callableExport, callerExport) },
        'src/Callable.tsx': { content: callableSource },
        'src/Caller.tsx': {
          content: rewriteCallerImports(callerSource, 'Callable'),
        },
      }

      const parameters = getParameters({
        files,
        // Force the classic React-TS template so CodeSandbox auto-injects
        // the entry script and serves the preview from the embedded
        // bundler instead of trying to boot a Vite devbox.
        template: 'create-react-app-typescript',
      })

      const form = document.createElement('form')
      form.method = 'POST'
      form.action = 'https://codesandbox.io/api/v1/sandboxes/define'
      form.target = '_blank'
      form.rel = 'noopener noreferrer'

      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = 'parameters'
      input.value = parameters
      form.appendChild(input)

      const queryInput = document.createElement('input')
      queryInput.type = 'hidden'
      queryInput.name = 'query'
      queryInput.value = `file=/src/Callable.tsx&module=/src/Callable.tsx&theme=dark&title=${encodeURIComponent(title)}`
      form.appendChild(queryInput)

      document.body.appendChild(form)
      form.submit()
      document.body.removeChild(form)
    } finally {
      setTimeout(() => setOpening(false), 800)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={opening}
      title={`${callableFilename} + ${callerFilename}`}
      className="inline-flex items-center gap-2 rounded-md border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-3 py-1.5 text-xs text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)] hover:border-[var(--color-accent)] disabled:opacity-60"
    >
      {opening ? 'Opening…' : 'Open in CodeSandbox'}
      <span aria-hidden="true">↗</span>
    </button>
  )
}
