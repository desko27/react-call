import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { Confirm } from './shared/Confirm'

describe('<Root>', () => {
  describe('renders', () => {
    test('nothing when empty', () => {
      render(<Confirm.Root />)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    test('one item at one call', async () => {
      render(<Confirm.Root />)
      Confirm.call({ message: 'foo' })
      expect(await screen.findByRole('dialog')).toBeInTheDocument()
    })
    test('multiple items at multiple calls', async () => {
      render(<Confirm.Root />)
      const messages = ['foo', 'bar', 'xyz', '123', '456']
      for (const message of messages) Confirm.call({ message })
      for (const name of messages) {
        expect(await screen.findByRole('dialog', { name })).toBeInTheDocument()
      }
    })
  })
})
