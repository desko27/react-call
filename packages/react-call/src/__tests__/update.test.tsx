import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { Confirm } from './shared/Confirm'

describe('update()', () => {
  describe('target promise', () => {
    test('updates params one time', async () => {
      render(<Confirm.Root />)
      const promise = Confirm.call({ message: 'one' })
      Confirm.update(promise, { message: 'two' })
      expect(
        await screen.findByRole('dialog', { name: 'two' }),
      ).toBeInTheDocument()
    })
    test('updates params multiple times', async () => {
      render(<Confirm.Root />)
      const promise = Confirm.call({ message: 'one' })
      Confirm.update(promise, { message: 'two' })
      Confirm.update(promise, { message: 'three' })
      expect(
        await screen.findByRole('dialog', { name: 'three' }),
      ).toBeInTheDocument()
      Confirm.update(promise, { message: 'four' })
      expect(
        await screen.findByRole('dialog', { name: 'four' }),
      ).toBeInTheDocument()
    })
  })
  describe('all', () => {
    test('update params one time', async () => {
      render(<Confirm.Root />)
      Confirm.call({ message: 'one' })
      Confirm.call({ message: 'one' })
      Confirm.call({ message: 'one' })
      Confirm.update({ message: 'two' })
      const dialogs = await screen.findAllByRole('dialog', { name: 'two' })
      expect(dialogs).toHaveLength(3)
    })
    test('update params multiple times', async () => {
      render(<Confirm.Root />)
      Confirm.call({ message: 'one' })
      Confirm.call({ message: 'one' })
      Confirm.call({ message: 'one' })
      Confirm.update({ message: 'two' })
      Confirm.update({ message: 'three' })
      const three = await screen.findAllByRole('dialog', { name: 'three' })
      expect(three).toHaveLength(3)
      Confirm.update({ message: 'four' })
      const four = await screen.findAllByRole('dialog', { name: 'four' })
      expect(four).toHaveLength(3)
    })
  })
})
