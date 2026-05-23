import { createCallable } from 'react-call'

// ADR-0010: assigning `Confirm.displayName` is what makes the HMR
// persistence registry key off this callable. Edit the JSX below while
// the dialog is open: it should hot-update IN PLACE without the dialog
// disappearing. Remove the `displayName` line to see the open dialog
// reset on save (Fast Refresh still works, only persistence is lost).

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
Confirm.displayName = 'Confirm'
