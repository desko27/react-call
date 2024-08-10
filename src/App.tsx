import { createCallable } from '#lib/main'

type Props = { message: string }
type Response = boolean

const Modal = createCallable<Props, Response>(({ call, message }) => (
  <div>
    <p>{message}</p>
    <button type="button" onClick={() => call.end(true)}>
      Yes
    </button>
    <button type="button" onClick={() => call.end(false)}>
      No
    </button>
  </div>
))

export function App() {
  const handleConfirm = async () => {
    const result = await Modal.call({ message: 'Do you?' })
    console.log(`Resolved: ${result}`)
  }

  return (
    <div>
      <button type="button" onClick={handleConfirm}>
        Confirm
      </button>
      <Modal.Root />
    </div>
  )
}
