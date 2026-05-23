import { render, screen, waitFor, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, test } from 'vitest'
import { withAct } from './shared/act'
import { Confirm } from './shared/Confirm'

describe('end()', () => {
  describe('inside', () => {
    test('removes one', async () => {
      const user = userEvent.setup()
      render(<Confirm />)
      withAct(() => Confirm.call({ message: 'foo' }))
      await user.click(screen.getByRole('button', { name: /no/i }))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    test('removes all', async () => {
      const user = userEvent.setup()
      render(<Confirm />)
      const messages = ['foo', 'bar', 'xyz', '123', '456']
      withAct(() => {
        for (const message of messages) Confirm.call({ message })
      })
      for (const name of messages) {
        const dialog = screen.getByRole('dialog', {
          name: new RegExp(name, 'i'),
        })
        await user.click(within(dialog).getByRole('button', { name: /no/i }))
      }
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    describe('removes only specific target', () => {
      test('first one', async () => {
        const user = userEvent.setup()
        render(<Confirm />)
        withAct(() => {
          Confirm.call({ message: 'first one' })
          Confirm.call({ message: 'middle one' })
          Confirm.call({ message: 'last one' })
        })
        const first = screen.getByRole('dialog', { name: /first one/i })
        await user.click(within(first).getByRole('button', { name: /no/i }))
        expect(
          screen.queryByRole('dialog', { name: /first one/i }),
        ).not.toBeInTheDocument()
        expect(
          screen.getByRole('dialog', { name: /middle one/i }),
        ).toBeInTheDocument()
        expect(
          screen.getByRole('dialog', { name: /last one/i }),
        ).toBeInTheDocument()
      })
      test('middle one', async () => {
        const user = userEvent.setup()
        render(<Confirm />)
        withAct(() => {
          Confirm.call({ message: 'first one' })
          Confirm.call({ message: 'middle one' })
          Confirm.call({ message: 'last one' })
        })
        const middle = screen.getByRole('dialog', { name: /middle one/i })
        await user.click(within(middle).getByRole('button', { name: /no/i }))
        expect(
          screen.queryByRole('dialog', { name: /middle one/i }),
        ).not.toBeInTheDocument()
        expect(
          screen.getByRole('dialog', { name: /first one/i }),
        ).toBeInTheDocument()
        expect(
          screen.getByRole('dialog', { name: /last one/i }),
        ).toBeInTheDocument()
      })
      test('last one', async () => {
        const user = userEvent.setup()
        render(<Confirm />)
        withAct(() => {
          Confirm.call({ message: 'first one' })
          Confirm.call({ message: 'middle one' })
          Confirm.call({ message: 'last one' })
        })
        const last = screen.getByRole('dialog', { name: /last one/i })
        await user.click(within(last).getByRole('button', { name: /no/i }))
        expect(
          screen.queryByRole('dialog', { name: /last one/i }),
        ).not.toBeInTheDocument()
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
      render(<Confirm />)
      const promise = withAct(() => Confirm.call({ message: 'foo' }))
      withAct(() => Confirm.end(promise, false))
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
    test('removes all', async () => {
      render(<Confirm />)
      const messages = ['foo', 'bar', 'xyz', '123', '456']
      withAct(() => {
        for (const message of messages) Confirm.call({ message })
      })
      withAct(() => Confirm.end(false))
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
    describe('removes only specific target', () => {
      test('first one', async () => {
        render(<Confirm />)
        let firstPromise!: Promise<boolean>
        withAct(() => {
          firstPromise = Confirm.call({ message: 'first one' })
          Confirm.call({ message: 'middle one' })
          Confirm.call({ message: 'last one' })
        })
        withAct(() => Confirm.end(firstPromise, false))
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
        render(<Confirm />)
        let middlePromise!: Promise<boolean>
        withAct(() => {
          Confirm.call({ message: 'first one' })
          middlePromise = Confirm.call({ message: 'middle one' })
          Confirm.call({ message: 'last one' })
        })
        withAct(() => Confirm.end(middlePromise, false))
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
        render(<Confirm />)
        let lastPromise!: Promise<boolean>
        withAct(() => {
          Confirm.call({ message: 'first one' })
          Confirm.call({ message: 'middle one' })
          lastPromise = Confirm.call({ message: 'last one' })
        })
        withAct(() => Confirm.end(lastPromise, false))
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
