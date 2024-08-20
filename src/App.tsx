import { useState } from 'react'
import { createCallable } from '#lib/main'

type Props = { message: string }
type Response = boolean
type RootProps = { userName: string }

const Modal = createCallable<Props, Response, RootProps>(
  ({ call, message }) => (
    <div>
      <p>
        {call.root.userName}, {message} {call.ended && <span>(ended)</span>}
      </p>
      <button type="button" onClick={() => call.end(true)}>
        Yes
      </button>
      <button type="button" onClick={() => call.end(false)}>
        No
      </button>
    </div>
  ),
  2000,
)

export function App() {
  const [visible, setVisible] = useState(true)

  const handleConfirm = async () => {
    const result = await Modal.call({ message: 'are you sure?' })
    console.log(`Resolved: ${result}`)
  }

  return (
    <div>
      <button type="button" onClick={() => setVisible((p) => !p)}>
        Toggle
      </button>
      <button type="button" onClick={handleConfirm}>
        Confirm
      </button>
      {visible && <Modal.Root userName="desko27" />}
    </div>
  )
}
