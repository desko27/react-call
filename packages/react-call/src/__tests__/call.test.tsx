import { userEvent } from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { Confirm } from './shared/Confirm'

describe('call()', () => {
  describe('receives', () => {
    test('a message param', async () => {
      render(<Confirm.Root />)
      Confirm.call({ message: 'an important message' })
      expect(
        await screen.findByRole('dialog', { name: 'an important message' }),
      ).toBeInTheDocument()
    })
  })
  describe('returns', () => {
    test('true when yes is clicked', async () => {
      const user = userEvent.setup()
      render(<Confirm.Root />)
      const promise = Confirm.call({ message: 'foo' })
      await user.click(await screen.findByRole('button', { name: /yes/i }))
      expect(await promise).toBe(true)
    })
    test('false when no is clicked', async () => {
      const user = userEvent.setup()
      render(<Confirm.Root />)
      const promise = Confirm.call({ message: 'foo' })
      await user.click(await screen.findByRole('button', { name: /no/i }))
      expect(await promise).toBe(false)
    })
  })
  describe('throws', () => {
    test('no <Root> found', () => {
      expect(() => Confirm.call({ message: 'foo' })).toThrowError(
        /no <Root> found/i,
      )
    })
    test('multiple instances of <Root> found', () => {
      render(
        <>
          <Confirm.Root />
          <Confirm.Root />
        </>,
      )
      expect(() => Confirm.call({ message: 'foo' })).toThrowError(
        /multiple instances of <Root> found/i,
      )
    })
  })
})
