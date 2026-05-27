import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, test } from 'vitest'
import { mount } from '../host'
import { Confirm } from './shared/Confirm'
import { withAct } from './shared/act'

// Cached host lives on globalThis (ADR-0016 idempotency). Tests run in
// the same process so we must tear it down between cases to avoid one
// test's mount leaking into the next.
const HOST_KEY = Symbol.for('react-call.host')
type HostStore = {
  [HOST_KEY]?: { root: { unmount: () => void }; container: HTMLElement }
}

const teardownHost = () => {
  const store = globalThis as HostStore
  const cached = store[HOST_KEY]
  if (cached) {
    act(() => cached.root.unmount())
    cached.container.remove()
    delete store[HOST_KEY]
  }
  for (const el of document.querySelectorAll('[data-react-call-host]')) {
    el.remove()
  }
}

afterEach(teardownHost)

const CallButton = ({ message }: { message: string }) => (
  <button type="button" onClick={() => Confirm.call({ message })}>
    {message}
  </button>
)

describe('mount()', () => {
  test('mounts into a body-level <div data-react-call-host>', () => {
    act(() => mount(<Confirm />))
    const host = document.querySelector('[data-react-call-host]')
    expect(host).not.toBeNull()
    expect(host?.parentElement).toBe(document.body)
  })

  test('multi-host scenario: N parallel subtrees + one mount() does not throw', async () => {
    const user = userEvent.setup()
    render(
      <>
        <CallButton message="story-1" />
        <CallButton message="story-2" />
        <CallButton message="story-3" />
        <CallButton message="story-4" />
      </>,
    )
    act(() => mount(<Confirm />))

    await user.click(screen.getByRole('button', { name: 'story-2' }))

    expect(screen.getAllByRole('dialog', { name: 'story-2' })).toHaveLength(1)
  })

  test('end() resolves the call across the host boundary', async () => {
    const user = userEvent.setup()
    render(<CallButton message="boundary" />)
    act(() => mount(<Confirm />))

    const promise = withAct(() => Confirm.call({ message: 'manual' }))
    await user.click(screen.getByRole('button', { name: /yes/i }))
    expect(await promise).toBe(true)
  })

  test('idempotent: second call re-uses the same container and root', () => {
    act(() => mount(<Confirm />))
    const firstHost = document.querySelector('[data-react-call-host]')

    act(() => mount(<Confirm />))
    const allHosts = document.querySelectorAll('[data-react-call-host]')

    expect(allHosts).toHaveLength(1)
    expect(allHosts[0]).toBe(firstHost)
  })

  test('wrapper option wraps the rendered element', () => {
    const Wrapper = ({ children }: { children: ReactNode }) => (
      <section data-testid="wrapper">{children}</section>
    )
    act(() => mount(<Confirm />, { wrapper: Wrapper }))

    const wrapper = screen.getByTestId('wrapper')
    expect(wrapper).toBeInTheDocument()
    expect(wrapper.tagName).toBe('SECTION')
  })

  test('custom container option mounts into the provided element', () => {
    const container = document.createElement('aside')
    container.setAttribute('data-testid', 'custom-container')
    document.body.appendChild(container)

    act(() => mount(<Confirm />, { container }))
    withAct(() => Confirm.call({ message: 'inside-aside' }))

    expect(container.querySelector('[role="dialog"]')).not.toBeNull()
    expect(document.querySelector('[data-react-call-host]')).toBeNull()
    container.remove()
  })

  test('re-mount with a different wrapper swaps content on the same root', () => {
    const A = ({ children }: { children: ReactNode }) => (
      <div data-testid="A">{children}</div>
    )
    const B = ({ children }: { children: ReactNode }) => (
      <div data-testid="B">{children}</div>
    )
    act(() => mount(<Confirm />, { wrapper: A }))
    expect(screen.getByTestId('A')).toBeInTheDocument()
    expect(screen.queryByTestId('B')).toBeNull()

    act(() => mount(<Confirm />, { wrapper: B }))
    expect(screen.getByTestId('B')).toBeInTheDocument()
    expect(screen.queryByTestId('A')).toBeNull()
  })
})
