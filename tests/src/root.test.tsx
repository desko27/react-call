import { vi, describe, expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import { Confirm, ConfirmMultipleRoots } from './shared/Confirm'

describe('<Root>', () => {
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
  describe('throws', () => {
    test('multiple instances of <Root> found', async () => {
      expect(() =>
        render(
          <>
            <Confirm.Root />
            <Confirm.Root />
          </>,
        ),
      ).toThrow('Multiple instances of <Root> found!')
    })
  })
  describe('warns', () => {
    test('multiple instances of <Root> found', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      render(
        <>
          <ConfirmMultipleRoots.Root />
          <ConfirmMultipleRoots.Root />
        </>,
      )
      expect(warnSpy).toHaveBeenCalledWith(
        'Multiple instances of <Root> found!',
      )
    })
  })
})
