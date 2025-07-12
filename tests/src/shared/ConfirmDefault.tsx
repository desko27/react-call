import { useId } from 'react'
import type { ReactCall } from 'react-call'

// biome-ignore lint/style/noDefaultExport: React.lazy requires default export for lazy loading
export default function ConfirmDefault({
  call,
  message,
}: ReactCall.Props<{ message: string }, boolean, Record<string, never>>) {
  const a11yId = useId()
  return (
    // biome-ignore lint/a11y/useSemanticElements: ok for tests
    <div role="dialog" aria-labelledby={a11yId}>
      <p id={a11yId}>{message}</p>
      <button type="button" onClick={() => call.end(true)}>
        Yes
      </button>
      <button type="button" onClick={() => call.end(false)}>
        No
      </button>
    </div>
  )
}
