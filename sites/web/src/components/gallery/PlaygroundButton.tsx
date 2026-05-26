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

const INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>react-call playground</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 2rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; min-height: 100vh; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/index.tsx"></script>
</body>
</html>
`

const INDEX_TSX = `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(
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

const PKG = JSON.stringify(
  {
    name: 'react-call-playground',
    version: '1.0.0',
    main: 'src/index.tsx',
    dependencies: {
      react: '^19.0.0',
      'react-dom': '^19.0.0',
      'react-call': 'next',
    },
    devDependencies: {
      '@types/react': '^19.0.0',
      '@types/react-dom': '^19.0.0',
      '@vitejs/plugin-react': '^4.0.0',
      typescript: '^5.0.0',
      vite: '^5.0.0',
    },
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
    },
  },
  null,
  2,
)

const VITE_CONFIG = `import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({ plugins: [react()] })
`

const TSCONFIG = JSON.stringify(
  {
    compilerOptions: {
      target: 'ESNext',
      module: 'ESNext',
      moduleResolution: 'bundler',
      jsx: 'react-jsx',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      isolatedModules: true,
    },
    include: ['src'],
  },
  null,
  2,
)

const getParameters = (files: Record<string, { content: string }>): string =>
  LZString.compressToBase64(JSON.stringify({ files }))
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
        'vite.config.ts': { content: VITE_CONFIG },
        'tsconfig.json': { content: TSCONFIG },
        'index.html': { content: INDEX_HTML },
        'src/index.tsx': { content: INDEX_TSX },
        'src/App.tsx': { content: buildApp(callableExport, callerExport) },
        'src/Callable.tsx': { content: callableSource },
        'src/Caller.tsx': {
          content: rewriteCallerImports(callerSource, 'Callable'),
        },
      }

      const parameters = getParameters(files)

      // POST to CodeSandbox "define" endpoint; opens a new tab.
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
