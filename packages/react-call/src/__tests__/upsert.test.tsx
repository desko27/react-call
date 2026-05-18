import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, test } from 'vitest'
import { Confirm } from './shared/Confirm'

describe('upsert()', () => {
  test('creates new instance when called without existing instance', async () => {
    render(<Confirm.Root />)
    Confirm.upsert({ message: 'Hello' })
    expect(
      await screen.findByRole('dialog', { name: 'Hello' }),
    ).toBeInTheDocument()
  })

  test('updates existing instance when called with existing instance', async () => {
    render(<Confirm.Root />)

    const promise1 = Confirm.upsert({ message: 'First' })
    expect(
      await screen.findByRole('dialog', { name: 'First' }),
    ).toBeInTheDocument()

    const promise2 = Confirm.upsert({ message: 'Updated' })
    expect(
      await screen.findByRole('dialog', { name: 'Updated' }),
    ).toBeInTheDocument()

    expect(screen.getAllByRole('dialog')).toHaveLength(1)
    expect(promise1).toBe(promise2)
  })

  test('does not affect normal calls', async () => {
    render(<Confirm.Root />)

    Confirm.call({ message: 'Normal 1' })
    expect(
      await screen.findByRole('dialog', { name: 'Normal 1' }),
    ).toBeInTheDocument()

    Confirm.upsert({ message: 'Upsert 1' })
    expect(
      await screen.findByRole('dialog', { name: 'Upsert 1' }),
    ).toBeInTheDocument()

    Confirm.call({ message: 'Normal 2' })
    expect(
      await screen.findByRole('dialog', { name: 'Normal 2' }),
    ).toBeInTheDocument()

    expect(screen.getAllByRole('dialog')).toHaveLength(3)

    Confirm.upsert({ message: 'Upsert Updated' })
    expect(
      await screen.findByRole('dialog', { name: 'Upsert Updated' }),
    ).toBeInTheDocument()

    expect(screen.getAllByRole('dialog')).toHaveLength(3)
  })

  test('creates new instance after previous one is ended', async () => {
    const user = userEvent.setup()
    render(<Confirm.Root />)

    Confirm.upsert({ message: 'First' })
    expect(
      await screen.findByRole('dialog', { name: 'First' }),
    ).toBeInTheDocument()

    await user.click(await screen.findByRole('button', { name: /yes/i }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    Confirm.upsert({ message: 'Second' })
    expect(
      await screen.findByRole('dialog', { name: 'Second' }),
    ).toBeInTheDocument()
  })

  test('creates new instance after previous one is ended externally', async () => {
    render(<Confirm.Root />)

    Confirm.upsert({ message: 'First' })
    expect(
      await screen.findByRole('dialog', { name: 'First' }),
    ).toBeInTheDocument()

    Confirm.end(false)
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    Confirm.upsert({ message: 'Second' })
    expect(
      await screen.findByRole('dialog', { name: 'Second' }),
    ).toBeInTheDocument()
  })
})
