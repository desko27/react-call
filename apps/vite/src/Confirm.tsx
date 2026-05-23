import { createCallable } from 'react-call'

// ADR-0012: the `react-call/vite` plugin enabled in vite.config.ts
// auto-injects `Confirm.displayName = 'Confirm'` at module eval time,
// so HMR persistence works without the manual line that ADR-0010 would
// otherwise require. Edit the JSX below while the dialog is open: it
// should hot-update IN PLACE without the dialog disappearing.

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
