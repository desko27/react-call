import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { withAct } from './shared/act'
import { Confirm } from './shared/Confirm'

describe('update()', () => {
  describe('target promise', () => {
    test('updates params one time', () => {
      render(<Confirm.Root />)
      const promise = withAct(() => Confirm.call({ message: 'one' }))
      withAct(() => Confirm.update(promise, { message: 'two' }))
      expect(screen.getByRole('dialog', { name: 'two' })).toBeInTheDocument()
    })
    test('updates params multiple times', () => {
      render(<Confirm.Root />)
      const promise = withAct(() => Confirm.call({ message: 'one' }))
      withAct(() => Confirm.update(promise, { message: 'two' }))
      withAct(() => Confirm.update(promise, { message: 'three' }))
      expect(screen.getByRole('dialog', { name: 'three' })).toBeInTheDocument()
      withAct(() => Confirm.update(promise, { message: 'four' }))
      expect(screen.getByRole('dialog', { name: 'four' })).toBeInTheDocument()
    })
  })
  describe('all', () => {
    test('update params one time', () => {
      render(<Confirm.Root />)
      withAct(() => {
        Confirm.call({ message: 'one' })
        Confirm.call({ message: 'one' })
        Confirm.call({ message: 'one' })
      })
      withAct(() => Confirm.update({ message: 'two' }))
      expect(screen.getAllByRole('dialog', { name: 'two' })).toHaveLength(3)
    })
    test('update params multiple times', () => {
      render(<Confirm.Root />)
      withAct(() => {
        Confirm.call({ message: 'one' })
        Confirm.call({ message: 'one' })
        Confirm.call({ message: 'one' })
      })
      withAct(() => Confirm.update({ message: 'two' }))
      withAct(() => Confirm.update({ message: 'three' }))
      expect(screen.getAllByRole('dialog', { name: 'three' })).toHaveLength(3)
      withAct(() => Confirm.update({ message: 'four' }))
      expect(screen.getAllByRole('dialog', { name: 'four' })).toHaveLength(3)
    })
  })
})
