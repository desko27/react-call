import { describe, expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import { Confirm } from './shared/Confirm'

describe('upsert()', () => {
  test('creates new instance when called without existing instance', async () => {
    const screen = render(<Confirm.Root />)
    Confirm.upsert({ message: 'Hello' })

    await expect
      .element(screen.getByRole('dialog', { name: 'Hello' }))
      .toBeInTheDocument()
  })

  test('updates existing instance when called with existing instance', async () => {
    const screen = render(<Confirm.Root />)

    const promise1 = Confirm.upsert({ message: 'First' })

    await expect
      .element(screen.getByRole('dialog', { name: 'First' }))
      .toBeInTheDocument()

    const promise2 = Confirm.upsert({ message: 'Updated' })

    await expect
      .element(screen.getByRole('dialog', { name: 'Updated' }))
      .toBeInTheDocument()

    const dialogs = screen.container.querySelectorAll('[role="dialog"]')
    expect(dialogs.length).toBe(1)

    expect(promise1).toBe(promise2)
  })

  test('does not affect normal calls', async () => {
    const screen = render(<Confirm.Root />)

    Confirm.call({ message: 'Normal 1' })

    await expect
      .element(screen.getByRole('dialog', { name: 'Normal 1' }))
      .toBeInTheDocument()

    Confirm.upsert({ message: 'Upsert 1' })

    await expect
      .element(screen.getByRole('dialog', { name: 'Upsert 1' }))
      .toBeInTheDocument()

    Confirm.call({ message: 'Normal 2' })

    await expect
      .element(screen.getByRole('dialog', { name: 'Normal 2' }))
      .toBeInTheDocument()

    const dialogsBefore = screen.container.querySelectorAll('[role="dialog"]')
    expect(dialogsBefore.length).toBe(3)

    Confirm.upsert({ message: 'Upsert Updated' })

    await expect
      .element(screen.getByRole('dialog', { name: 'Upsert Updated' }))
      .toBeInTheDocument()

    const dialogsAfter = screen.container.querySelectorAll('[role="dialog"]')
    expect(dialogsAfter.length).toBe(3)
  })

  test('creates new instance after previous one is ended', async () => {
    const screen = render(<Confirm.Root />)

    Confirm.upsert({ message: 'First' })

    await expect
      .element(screen.getByRole('dialog', { name: 'First' }))
      .toBeInTheDocument()

    await screen.getByRole('button', { name: /yes/i }).click()

    await expect
      .element(screen.container.querySelector('[role="dialog"]'))
      .not.toBeInTheDocument()

    Confirm.upsert({ message: 'Second' })

    await expect
      .element(screen.getByRole('dialog', { name: 'Second' }))
      .toBeInTheDocument()
  })
})
