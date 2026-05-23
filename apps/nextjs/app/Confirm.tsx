'use client'

import { createCallable } from 'react-call'

// `'use client'` is required because react-call uses
// useSyncExternalStore. The Callable itself becomes a client
// reference when imported from a Server Component.
export const Confirm = createCallable<{ message: string }, boolean>(
  ({ call, message }) => (
    <div
      role="dialog"
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        padding: '1rem',
        background: 'lightblue',
        border: '4px dashed red',
        zIndex: 10,
      }}
    >
      <p>{message}</p>
      <button type="button" onClick={() => call.end(true)}>
        Yes
      </button>
      <button type="button" onClick={() => call.end(false)}>
        No
      </button>
    </div>
  ),
)
