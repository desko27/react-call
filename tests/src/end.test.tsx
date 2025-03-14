import { describe, expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import { Confirm } from './shared/Confirm'

describe('end()', () => {
  describe('inside', () => {
    test('removes one', async () => {
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
    describe('removes only specific target', () => {
      test('first one', async () => {
        const screen = render(<Confirm.Root />)
        Confirm.call({ message: 'first one' })
        Confirm.call({ message: 'middle one' })
        Confirm.call({ message: 'last one' })
        await screen
          .getByRole('dialog', { name: /first one/i })
          .getByRole('button', { name: /no/i })
          .click()
        await expect
          .element(screen.getByRole('dialog', { name: /first one/i }))
          .not.toBeInTheDocument()
        await expect
          .element(screen.getByRole('dialog', { name: /middle one/i }))
          .toBeInTheDocument()
        await expect
          .element(screen.getByRole('dialog', { name: /last one/i }))
          .toBeInTheDocument()
      })
      test('middle one', async () => {
        const screen = render(<Confirm.Root />)
        Confirm.call({ message: 'first one' })
        Confirm.call({ message: 'middle one' })
        Confirm.call({ message: 'last one' })
        await screen
          .getByRole('dialog', { name: /middle one/i })
          .getByRole('button', { name: /no/i })
          .click()
        await expect
          .element(screen.getByRole('dialog', { name: /first one/i }))
          .toBeInTheDocument()
        await expect
          .element(screen.getByRole('dialog', { name: /middle one/i }))
          .not.toBeInTheDocument()
        await expect
          .element(screen.getByRole('dialog', { name: /last one/i }))
          .toBeInTheDocument()
      })
      test('last one', async () => {
        const screen = render(<Confirm.Root />)
        Confirm.call({ message: 'first one' })
        Confirm.call({ message: 'middle one' })
        Confirm.call({ message: 'last one' })
        await screen
          .getByRole('dialog', { name: /last one/i })
          .getByRole('button', { name: /no/i })
          .click()
        await expect
          .element(screen.getByRole('dialog', { name: /first one/i }))
          .toBeInTheDocument()
        await expect
          .element(screen.getByRole('dialog', { name: /middle one/i }))
          .toBeInTheDocument()
        await expect
          .element(screen.getByRole('dialog', { name: /last one/i }))
          .not.toBeInTheDocument()
      })
    })
  })
  describe('outside', () => {
    test('removes one', async () => {
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
    describe('removes only specific target', () => {
      test('first one', async () => {
        const screen = render(<Confirm.Root />)
        const firstPromise = Confirm.call({ message: 'first one' })
        Confirm.call({ message: 'middle one' })
        Confirm.call({ message: 'last one' })
        Confirm.end(firstPromise, false)
        await expect
          .element(screen.getByRole('dialog', { name: /first one/i }))
          .not.toBeInTheDocument()
        await expect
          .element(screen.getByRole('dialog', { name: /middle one/i }))
          .toBeInTheDocument()
        await expect
          .element(screen.getByRole('dialog', { name: /last one/i }))
          .toBeInTheDocument()
      })
      test('middle one', async () => {
        const screen = render(<Confirm.Root />)
        Confirm.call({ message: 'first one' })
        const middlePromise = Confirm.call({ message: 'middle one' })
        Confirm.call({ message: 'last one' })
        Confirm.end(middlePromise, false)
        await expect
          .element(screen.getByRole('dialog', { name: /first one/i }))
          .toBeInTheDocument()
        await expect
          .element(screen.getByRole('dialog', { name: /middle one/i }))
          .not.toBeInTheDocument()
        await expect
          .element(screen.getByRole('dialog', { name: /last one/i }))
          .toBeInTheDocument()
      })
      test('last one', async () => {
        const screen = render(<Confirm.Root />)
        Confirm.call({ message: 'first one' })
        Confirm.call({ message: 'middle one' })
        const lastPromise = Confirm.call({ message: 'last one' })
        Confirm.end(lastPromise, false)
        await expect
          .element(screen.getByRole('dialog', { name: /first one/i }))
          .toBeInTheDocument()
        await expect
          .element(screen.getByRole('dialog', { name: /middle one/i }))
          .toBeInTheDocument()
        await expect
          .element(screen.getByRole('dialog', { name: /last one/i }))
          .not.toBeInTheDocument()
      })
    })
  })
})
