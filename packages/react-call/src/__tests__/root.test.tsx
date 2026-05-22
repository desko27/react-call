import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { withAct } from './shared/act'
import { Confirm } from './shared/Confirm'

describe('<Root>', () => {
  describe('renders', () => {
    test('nothing when empty', () => {
      render(<Confirm.Root />)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    test('one item at one call', () => {
      render(<Confirm.Root />)
      withAct(() => Confirm.call({ message: 'foo' }))
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    test('multiple items at multiple calls', () => {
      render(<Confirm.Root />)
      const messages = ['foo', 'bar', 'xyz', '123', '456']
      withAct(() => {
        for (const message of messages) Confirm.call({ message })
      })
      for (const name of messages) {
        expect(screen.getByRole('dialog', { name })).toBeInTheDocument()
      }
    })
  })
})
