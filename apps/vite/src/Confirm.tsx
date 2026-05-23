import { createCallable } from 'react-call'

// Named function (not anonymous arrow) so the HMR-persistence registry
// (ADR-0009) can key the store by `Confirm.name`. Edit the JSX below
// while the dialog is open: it should hot-update IN PLACE without
// the dialog disappearing.

export const Confirm = createCallable<{ message: string }, boolean>(
  function Confirm({ call, message }) {
    return (
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
    )
  },
)
