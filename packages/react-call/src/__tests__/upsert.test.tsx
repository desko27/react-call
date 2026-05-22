import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, test } from 'vitest'
import { withAct } from './shared/act'
import { Confirm } from './shared/Confirm'

describe('upsert()', () => {
  test('creates new instance when called without existing instance', () => {
    render(<Confirm.Root />)
    withAct(() => Confirm.upsert({ message: 'Hello' }))
    expect(screen.getByRole('dialog', { name: 'Hello' })).toBeInTheDocument()
  })

  test('updates existing instance when called with existing instance', () => {
    render(<Confirm.Root />)

    const promise1 = withAct(() => Confirm.upsert({ message: 'First' }))
    expect(screen.getByRole('dialog', { name: 'First' })).toBeInTheDocument()

    const promise2 = withAct(() => Confirm.upsert({ message: 'Updated' }))
    expect(screen.getByRole('dialog', { name: 'Updated' })).toBeInTheDocument()

    expect(screen.getAllByRole('dialog')).toHaveLength(1)
    expect(promise1).toBe(promise2)
  })

  test('does not affect normal calls', () => {
    render(<Confirm.Root />)

    withAct(() => Confirm.call({ message: 'Normal 1' }))
    expect(screen.getByRole('dialog', { name: 'Normal 1' })).toBeInTheDocument()

    withAct(() => Confirm.upsert({ message: 'Upsert 1' }))
    expect(screen.getByRole('dialog', { name: 'Upsert 1' })).toBeInTheDocument()

    withAct(() => Confirm.call({ message: 'Normal 2' }))
    expect(screen.getByRole('dialog', { name: 'Normal 2' })).toBeInTheDocument()

    expect(screen.getAllByRole('dialog')).toHaveLength(3)

    withAct(() => Confirm.upsert({ message: 'Upsert Updated' }))
    expect(
      screen.getByRole('dialog', { name: 'Upsert Updated' }),
    ).toBeInTheDocument()

    expect(screen.getAllByRole('dialog')).toHaveLength(3)
  })

  test('creates new instance after previous one is ended', async () => {
    const user = userEvent.setup()
    render(<Confirm.Root />)

    withAct(() => Confirm.upsert({ message: 'First' }))
    expect(screen.getByRole('dialog', { name: 'First' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /yes/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    withAct(() => Confirm.upsert({ message: 'Second' }))
    expect(screen.getByRole('dialog', { name: 'Second' })).toBeInTheDocument()
  })

  test('creates new instance after previous one is ended externally', async () => {
    render(<Confirm.Root />)

    withAct(() => Confirm.upsert({ message: 'First' }))
    expect(screen.getByRole('dialog', { name: 'First' })).toBeInTheDocument()

    withAct(() => Confirm.end(false))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    withAct(() => Confirm.upsert({ message: 'Second' }))
    expect(screen.getByRole('dialog', { name: 'Second' })).toBeInTheDocument()
  })
})
