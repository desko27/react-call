import { describe, expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import { Confirm } from './shared/Confirm'

describe('end()', () => {
  describe('inside', () => {
    test('removes target', async () => {
      const screen = render(<Confirm.Root />)
      Confirm.call({ message: 'foo' })
      await screen.getByRole('button', { name: /no/i }).click()
      await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument()
    })
    test('removes all', async () => {
      const screen = render(<Confirm.Root />)
      const messages = ['foo', 'bar', 'xyz', '123', '456']
      messages.forEach((message) => Confirm.call({ message }))
      await Promise.all(
        screen
          .getByRole('button', { name: /no/i })
          .all()
          .map((button) => button.click()),
      )
      await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument()
    })
  })
  describe('outside', () => {
    test('removes target', async () => {
      const screen = render(<Confirm.Root />)
      const promise = Confirm.call({ message: 'foo' })
      Confirm.end(promise, false)
      await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument()
    })
    test('removes all', async () => {
      const screen = render(<Confirm.Root />)
      const messages = ['foo', 'bar', 'xyz', '123', '456']
      messages.forEach((message) => Confirm.call({ message }))
      Confirm.end(false)
      await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument()
    })
  })
})
