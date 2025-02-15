import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createCallable } from 'react-call'

const Confirm = createCallable<{ message: string }, boolean>(
  ({ call, message }) => (
    // biome-ignore lint/a11y/useSemanticElements: needed for RTL
    <div role="dialog">
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

describe('Confirm', () => {
  test('test 1', async () => {
    render(<Confirm.Root />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    Confirm.call({ message: 'Hey you!' })
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })
})
