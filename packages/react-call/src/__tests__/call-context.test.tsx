import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { createCallable } from '../createCallable'
import type * as ReactCall from '../types.public'
import { withAct } from './shared/act'

// Fixture that exposes the three call-context invariants we want to pin
// as data-* attributes on the rendered element, so plain DOM queries can
// observe them without contriving callbacks or external state.

type Props = { id: string }

const ProbeComponent: ReactCall.UserComponent<Props, void, {}> = ({
  call,
  id,
}) => (
  <div
    data-testid={`probe-${id}`}
    data-key={call.key}
    data-index={call.index}
    data-stack-size={call.stackSize}
  />
)

const Probe = createCallable(ProbeComponent)

describe('CallContext lifecycle invariants', () => {
  test('call.index reflects the item position in the stack (0-based)', () => {
    render(<Probe.Root />)
    withAct(() => {
      Probe.call({ id: 'a' })
      Probe.call({ id: 'b' })
      Probe.call({ id: 'c' })
    })
    expect(screen.getByTestId('probe-a').dataset.index).toBe('0')
    expect(screen.getByTestId('probe-b').dataset.index).toBe('1')
    expect(screen.getByTestId('probe-c').dataset.index).toBe('2')
  })

  test('call.stackSize is the total active items, seen identically by every item', () => {
    render(<Probe.Root />)
    withAct(() => Probe.call({ id: 'first' }))
    expect(screen.getByTestId('probe-first').dataset.stackSize).toBe('1')

    withAct(() => Probe.call({ id: 'second' }))
    expect(screen.getByTestId('probe-first').dataset.stackSize).toBe('2')
    expect(screen.getByTestId('probe-second').dataset.stackSize).toBe('2')

    withAct(() => Probe.call({ id: 'third' }))
    expect(screen.getByTestId('probe-first').dataset.stackSize).toBe('3')
    expect(screen.getByTestId('probe-second').dataset.stackSize).toBe('3')
    expect(screen.getByTestId('probe-third').dataset.stackSize).toBe('3')
  })

  test('call.key is unique per call within a single Root lifetime', () => {
    render(<Probe.Root />)
    withAct(() => {
      Probe.call({ id: 'a' })
      Probe.call({ id: 'b' })
      Probe.call({ id: 'c' })
    })
    const keys = new Set([
      screen.getByTestId('probe-a').dataset.key,
      screen.getByTestId('probe-b').dataset.key,
      screen.getByTestId('probe-c').dataset.key,
    ])
    expect(keys.size).toBe(3)
  })
})
