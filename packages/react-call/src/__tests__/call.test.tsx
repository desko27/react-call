import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, test } from 'vitest'
import { withAct } from './shared/act'
import { Confirm } from './shared/Confirm'

describe('call()', () => {
  describe('receives', () => {
    test('a message param', () => {
      render(<Confirm />)
      withAct(() => Confirm.call({ message: 'an important message' }))
      expect(
        screen.getByRole('dialog', { name: 'an important message' }),
      ).toBeInTheDocument()
    })
  })
  describe('returns', () => {
    test('true when yes is clicked', async () => {
      const user = userEvent.setup()
      render(<Confirm />)
      const promise = withAct(() => Confirm.call({ message: 'foo' }))
      await user.click(screen.getByRole('button', { name: /yes/i }))
      expect(await promise).toBe(true)
    })
    test('false when no is clicked', async () => {
      const user = userEvent.setup()
      render(<Confirm />)
      const promise = withAct(() => Confirm.call({ message: 'foo' }))
      await user.click(screen.getByRole('button', { name: /no/i }))
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
          <Confirm />
          <Confirm />
        </>,
      )
      expect(() => Confirm.call({ message: 'foo' })).toThrowError(
        /multiple instances of <Root> found/i,
      )
    })
  })
})
