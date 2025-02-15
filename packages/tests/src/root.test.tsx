import { describe, expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import { Confirm } from './Confirm'

describe('Root', () => {
  describe('renders', () => {
    test('nothing', async () => {
      const screen = render(<Confirm.Root />)
      await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument()
    })
    test('one item', async () => {
      const screen = render(<Confirm.Root />)
      Confirm.call({ message: 'foo' })
      await expect.element(screen.getByRole('dialog')).toBeInTheDocument()
    })
    test('multiple items', async () => {
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
