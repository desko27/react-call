import { render, screen, waitFor, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, test } from 'vitest'
import { Confirm } from './shared/Confirm'

describe('end()', () => {
  describe('inside', () => {
    test('removes one', async () => {
      const user = userEvent.setup()
      render(<Confirm.Root />)
      Confirm.call({ message: 'foo' })
      await user.click(await screen.findByRole('button', { name: /no/i }))
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
    test('removes all', async () => {
      const user = userEvent.setup()
      render(<Confirm.Root />)
      const messages = ['foo', 'bar', 'xyz', '123', '456']
      for (const message of messages) Confirm.call({ message })
      for (const name of messages) {
        const dialog = await screen.findByRole('dialog', {
          name: new RegExp(name, 'i'),
        })
        await user.click(within(dialog).getByRole('button', { name: /no/i }))
      }
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
    describe('removes only specific target', () => {
      test('first one', async () => {
        const user = userEvent.setup()
        render(<Confirm.Root />)
        Confirm.call({ message: 'first one' })
        Confirm.call({ message: 'middle one' })
        Confirm.call({ message: 'last one' })
        const first = await screen.findByRole('dialog', { name: /first one/i })
        await user.click(within(first).getByRole('button', { name: /no/i }))
        await waitFor(() => {
          expect(
            screen.queryByRole('dialog', { name: /first one/i }),
          ).not.toBeInTheDocument()
        })
        expect(
          screen.getByRole('dialog', { name: /middle one/i }),
        ).toBeInTheDocument()
        expect(
          screen.getByRole('dialog', { name: /last one/i }),
        ).toBeInTheDocument()
      })
      test('middle one', async () => {
        const user = userEvent.setup()
        render(<Confirm.Root />)
        Confirm.call({ message: 'first one' })
        Confirm.call({ message: 'middle one' })
        Confirm.call({ message: 'last one' })
        const middle = await screen.findByRole('dialog', {
          name: /middle one/i,
        })
        await user.click(within(middle).getByRole('button', { name: /no/i }))
        await waitFor(() => {
          expect(
            screen.queryByRole('dialog', { name: /middle one/i }),
          ).not.toBeInTheDocument()
        })
        expect(
          screen.getByRole('dialog', { name: /first one/i }),
        ).toBeInTheDocument()
        expect(
          screen.getByRole('dialog', { name: /last one/i }),
        ).toBeInTheDocument()
      })
      test('last one', async () => {
        const user = userEvent.setup()
        render(<Confirm.Root />)
        Confirm.call({ message: 'first one' })
        Confirm.call({ message: 'middle one' })
        Confirm.call({ message: 'last one' })
        const last = await screen.findByRole('dialog', { name: /last one/i })
        await user.click(within(last).getByRole('button', { name: /no/i }))
        await waitFor(() => {
          expect(
            screen.queryByRole('dialog', { name: /last one/i }),
          ).not.toBeInTheDocument()
        })
        expect(
          screen.getByRole('dialog', { name: /first one/i }),
        ).toBeInTheDocument()
        expect(
          screen.getByRole('dialog', { name: /middle one/i }),
        ).toBeInTheDocument()
      })
    })
  })
  describe('outside', () => {
    test('removes one', async () => {
      render(<Confirm.Root />)
      const promise = Confirm.call({ message: 'foo' })
      await screen.findByRole('dialog')
      Confirm.end(promise, false)
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
    test('removes all', async () => {
      render(<Confirm.Root />)
      const messages = ['foo', 'bar', 'xyz', '123', '456']
      for (const message of messages) Confirm.call({ message })
      await screen.findByRole('dialog', { name: /foo/i })
      Confirm.end(false)
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
    describe('removes only specific target', () => {
      test('first one', async () => {
        render(<Confirm.Root />)
        const firstPromise = Confirm.call({ message: 'first one' })
        Confirm.call({ message: 'middle one' })
        Confirm.call({ message: 'last one' })
        await screen.findByRole('dialog', { name: /first one/i })
        Confirm.end(firstPromise, false)
        await waitFor(() => {
          expect(
            screen.queryByRole('dialog', { name: /first one/i }),
          ).not.toBeInTheDocument()
        })
        expect(
          screen.getByRole('dialog', { name: /middle one/i }),
        ).toBeInTheDocument()
        expect(
          screen.getByRole('dialog', { name: /last one/i }),
        ).toBeInTheDocument()
      })
      test('middle one', async () => {
        render(<Confirm.Root />)
        Confirm.call({ message: 'first one' })
        const middlePromise = Confirm.call({ message: 'middle one' })
        Confirm.call({ message: 'last one' })
        await screen.findByRole('dialog', { name: /middle one/i })
        Confirm.end(middlePromise, false)
        await waitFor(() => {
          expect(
            screen.queryByRole('dialog', { name: /middle one/i }),
          ).not.toBeInTheDocument()
        })
        expect(
          screen.getByRole('dialog', { name: /first one/i }),
        ).toBeInTheDocument()
        expect(
          screen.getByRole('dialog', { name: /last one/i }),
        ).toBeInTheDocument()
      })
      test('last one', async () => {
        render(<Confirm.Root />)
        Confirm.call({ message: 'first one' })
        Confirm.call({ message: 'middle one' })
        const lastPromise = Confirm.call({ message: 'last one' })
        await screen.findByRole('dialog', { name: /last one/i })
        Confirm.end(lastPromise, false)
        await waitFor(() => {
          expect(
            screen.queryByRole('dialog', { name: /last one/i }),
          ).not.toBeInTheDocument()
        })
        expect(
          screen.getByRole('dialog', { name: /first one/i }),
        ).toBeInTheDocument()
        expect(
          screen.getByRole('dialog', { name: /middle one/i }),
        ).toBeInTheDocument()
      })
    })
  })
})
