import { useState } from 'react'
import { Confirm } from './Confirm'

// Sibling component with local state so we can observe whether the
// page is doing a full reload (counter resets) vs Fast Refresh
// (counter survives) when Confirm.tsx is edited.
export function App() {
  const [counter, setCounter] = useState(0)

  return (
    <>
      <h1>react-call HMR playground</h1>
      <p>
        Sibling state (survives Fast Refresh, resets on full reload):{' '}
        <strong>{counter}</strong>
      </p>
      <button type="button" onClick={() => setCounter((n) => n + 1)}>
        +1
      </button>
      <hr />
      <button
        type="button"
        onClick={async () => {
          const ok = await Confirm.call({ message: 'Continue?' })
          console.log('response:', ok)
        }}
      >
        Open dialog
      </button>
      <Confirm.Root />
    </>
  )
}
