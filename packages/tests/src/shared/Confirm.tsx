import { useId } from 'react'
import { createCallable } from 'react-call'

export const Confirm = createCallable<{ message: string }, boolean>(
  ({ call, message }) => {
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
  },
)
