import { describe, expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import { Confirm } from './Confirm'

describe('call()', () => {
  describe('receives', () => {
    test('params', async () => {
      const screen = render(<Confirm.Root />)
      Confirm.call({ message: 'an important message' })
      await expect
        .element(screen.getByRole('dialog', { name: 'an important message' }))
        .toBeInTheDocument()
    })
  })
  describe('returns', () => {
    test('true', async () => {
      const screen = render(<Confirm.Root />)
      const promise = Confirm.call({ message: 'foo' })
      await screen.getByRole('button', { name: /yes/i }).click()
      expect(await promise).toBe(true)
    })
    test('false', async () => {
      const screen = render(<Confirm.Root />)
      const promise = Confirm.call({ message: 'foo' })
      await screen.getByRole('button', { name: /no/i }).click()
      expect(await promise).toBe(false)
    })
  })
})
