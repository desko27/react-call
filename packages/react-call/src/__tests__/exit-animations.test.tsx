import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, test } from 'vitest'
import { createCallable } from '../createCallable'
import type * as ReactCall from '../types.public'
import { withAct } from './shared/act'

// The README documents that `unmountingDelay` keeps a finished call in the
// stack for the given milliseconds so the consumer can drive an exit
// animation using the `call.ended` boolean. The default fixture uses
// `unmountingDelay = 0`, which collapses the ended state into a single
// microtask and makes the intermediate `ended: true` window unobservable.
// This fixture sets a real delay (50ms is enough — short enough to keep
// tests fast, long enough to be reliably observed under happy-dom + React).

const UNMOUNTING_DELAY = 50

type Props = { message: string }

const SlowConfirmComponent: ReactCall.UserComponent<Props, boolean, {}> = ({
  call,
  message,
}) => (
  <div role="dialog" aria-label={message} data-ended={String(call.ended)}>
    <p>{message}</p>
    <button type="button" onClick={() => call.end(true)}>
      Yes
    </button>
    <button type="button" onClick={() => call.end(false)}>
      No
    </button>
  </div>
)

const SlowConfirm = createCallable(SlowConfirmComponent, UNMOUNTING_DELAY)

describe('Exit animations (unmountingDelay + call.ended)', () => {
  test('call.ended starts false during the active call', () => {
    render(<SlowConfirm.Root />)
    withAct(() => SlowConfirm.call({ message: 'foo' }))
    expect(screen.getByRole('dialog').dataset.ended).toBe('false')
  })

  test('call.ended flips to true on end() and the dialog stays mounted until unmountingDelay elapses', async () => {
    const user = userEvent.setup()
    render(<SlowConfirm.Root />)
    withAct(() => SlowConfirm.call({ message: 'foo' }))

    await user.click(screen.getByRole('button', { name: /no/i }))

    // Immediately after end(): still mounted, ended = true. The consumer's
    // CSS would apply the exit-animation class via `call.ended` from here.
    const endedDialog = screen.getByRole('dialog')
    expect(endedDialog).toBeInTheDocument()
    expect(endedDialog.dataset.ended).toBe('true')

    // After the delay, the item is removed from the stack entirely.
    await waitFor(
      () => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      },
      { timeout: UNMOUNTING_DELAY * 4 },
    )
  })

  test('external Confirm.end(false) honours unmountingDelay the same way an inside end() does', async () => {
    render(<SlowConfirm.Root />)
    withAct(() => SlowConfirm.call({ message: 'foo' }))

    withAct(() => SlowConfirm.end(false))

    const endedDialog = screen.getByRole('dialog')
    expect(endedDialog).toBeInTheDocument()
    expect(endedDialog.dataset.ended).toBe('true')

    await waitFor(
      () => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      },
      { timeout: UNMOUNTING_DELAY * 4 },
    )
  })
})
