import { describe, expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import { createCallable } from 'react-call'

const Confirm = createCallable<{ message: string }, boolean>(
  ({ call, message }) => (
    <dialog open>
      <p>{message}</p>
      <button type="button" onClick={() => call.end(true)}>
        Yes
      </button>
      <button type="button" onClick={() => call.end(false)}>
        No
      </button>
    </dialog>
  ),
)

describe('Confirm', () => {
  test('test 1', async () => {
    const screen = render(<Confirm.Root />)

    await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument()
    Confirm.call({ message: 'Hey you!' })
    await expect.element(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
