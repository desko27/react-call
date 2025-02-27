import { describe, expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import { Confirm } from './shared/Confirm'

describe('update()', () => {
  describe('target promise', () => {
    test('updates params one time', async () => {
      const screen = render(<Confirm.Root />)
      const promise = Confirm.call({ message: 'one' })

      Confirm.update(promise, { message: 'two' })
      await expect
        .element(screen.getByRole('dialog', { name: 'two' }))
        .toBeInTheDocument()
    })
    test('updates params multiple times', async () => {
      const screen = render(<Confirm.Root />)
      const promise = Confirm.call({ message: 'one' })
      Confirm.update(promise, { message: 'two' })

      Confirm.update(promise, { message: 'three' })
      await expect
        .element(screen.getByRole('dialog', { name: 'three' }))
        .toBeInTheDocument()

      Confirm.update(promise, { message: 'four' })
      await expect
        .element(screen.getByRole('dialog', { name: 'four' }))
        .toBeInTheDocument()
    })
  })
  describe('all', () => {
    test('update params one time', async () => {
      const screen = render(<Confirm.Root />)
      Confirm.call({ message: 'one' })
      Confirm.call({ message: 'one' })
      Confirm.call({ message: 'one' })

      Confirm.update({ message: 'two' })
      await expect
        .element(screen.getByRole('dialog', { name: 'two' }).first())
        .toBeInTheDocument()
      await expect
        .element(screen.getByRole('dialog', { name: 'two' }).nth(1))
        .toBeInTheDocument()
      await expect
        .element(screen.getByRole('dialog', { name: 'two' }).nth(2))
        .toBeInTheDocument()
    })
    test('update params multiple times', async () => {
      const screen = render(<Confirm.Root />)
      Confirm.call({ message: 'one' })
      Confirm.call({ message: 'one' })
      Confirm.call({ message: 'one' })
      Confirm.update({ message: 'two' })

      Confirm.update({ message: 'three' })
      await expect
        .element(screen.getByRole('dialog', { name: 'three' }).first())
        .toBeInTheDocument()
      await expect
        .element(screen.getByRole('dialog', { name: 'three' }).nth(1))
        .toBeInTheDocument()
      await expect
        .element(screen.getByRole('dialog', { name: 'three' }).nth(2))
        .toBeInTheDocument()

      Confirm.update({ message: 'four' })
      await expect
        .element(screen.getByRole('dialog', { name: 'four' }).first())
        .toBeInTheDocument()
      await expect
        .element(screen.getByRole('dialog', { name: 'four' }).nth(1))
        .toBeInTheDocument()
      await expect
        .element(screen.getByRole('dialog', { name: 'four' }).nth(2))
        .toBeInTheDocument()
    })
  })
})
