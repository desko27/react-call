import { describe, expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import { Confirm } from './shared/Confirm'

describe('Root', () => {
  describe('renders', () => {
    test('nothing when empty', async () => {
      const screen = render(<Confirm.Root />)
      await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument()
    })
    test('one item at one call', async () => {
      const screen = render(<Confirm.Root />)
      Confirm.call({ message: 'foo' })
      await expect.element(screen.getByRole('dialog')).toBeInTheDocument()
    })
    test('multiple items at multiple calls', async () => {
      const screen = render(<Confirm.Root />)
      const messages = ['foo', 'bar', 'xyz', '123', '456']
      messages.forEach((message) => Confirm.call({ message }))
      await Promise.all(
        messages.map((name) =>
          expect
            .element(screen.getByRole('dialog', { name }))
            .toBeInTheDocument(),
        ),
      )
    })
  })
})
