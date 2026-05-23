import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import { createCallable } from '../createCallable'
import type * as ReactCall from '../types.public'
import { withAct } from './shared/act'

// Fixture surfaces every public slot the mutation primitive added:
// - data-pending mirrors `call.pending` for direct DOM assertions
// - "Submit" button invokes call.mutate(payload)
// - "Cancel" button invokes call.end(false) directly
// - "Local mutate" invokes mutate WITHOUT the payload (void-payload path)
//   when payload defaults to void

type Props = { message: string }
type Payload = { id: string }

const FormComponent: ReactCall.UserComponent<Props, boolean, Payload, {}> = ({
  call,
  message,
}) => (
  <div
    role="dialog"
    aria-label={message}
    data-pending={String(call.pending)}
    data-ended={String(call.ended)}
  >
    <p>{message}</p>
    <button
      type="button"
      disabled={call.pending}
      onClick={() => call.mutate({ id: 'x-123' })}
    >
      Submit
    </button>
    <button type="button" onClick={() => call.end(false)}>
      Cancel
    </button>
  </div>
)

const Form = createCallable<Props, boolean, Payload>(FormComponent)

// Void-payload variant for the "no payload" ergonomic path.
type VoidPayloadProps = { message: string }
const VoidPayloadComponent: ReactCall.UserComponent<
  VoidPayloadProps,
  boolean
> = ({ call, message }) => (
  <div role="dialog" aria-label={message} data-pending={String(call.pending)}>
    <button type="button" onClick={() => call.mutate()}>
      Go
    </button>
  </div>
)

const VoidPayload = createCallable<VoidPayloadProps, boolean>(
  VoidPayloadComponent,
)

describe('call.mutate() — happy path', () => {
  test('sets pending=true during async mutationFn, then resets when it resolves', async () => {
    const user = userEvent.setup()
    render(<Form />)

    let release!: () => void
    const inFlight = new Promise<void>((r) => {
      release = r
    })

    const promise = withAct(() =>
      Form.call(
        { message: 'go' },
        {
          mutationFn: async (call, payload) => {
            await inFlight
            call.end(payload.id === 'x-123')
          },
        },
      ),
    )

    expect(screen.getByRole('dialog').dataset.pending).toBe('false')

    await user.click(screen.getByRole('button', { name: /submit/i }))
    expect(screen.getByRole('dialog').dataset.pending).toBe('true')

    withAct(() => release())
    expect(await promise).toBe(true)
  })

  test('mutationFn receives the payload the component passed to call.mutate', async () => {
    const user = userEvent.setup()
    render(<Form />)
    const seen: Payload[] = []

    const promise = withAct(() =>
      Form.call(
        { message: 'go' },
        {
          mutationFn: async (call, payload) => {
            seen.push(payload)
            call.end(true)
          },
        },
      ),
    )

    await user.click(screen.getByRole('button', { name: /submit/i }))
    await promise
    expect(seen).toEqual([{ id: 'x-123' }])
  })

  test('void MutationPayload allows call.mutate() with no args', async () => {
    const user = userEvent.setup()
    render(<VoidPayload />)
    let invocations = 0

    const promise = withAct(() =>
      VoidPayload.call(
        { message: 'go' },
        {
          mutationFn: (call) => {
            invocations++
            call.end(true)
          },
        },
      ),
    )

    await user.click(screen.getByRole('button', { name: /go/i }))
    expect(await promise).toBe(true)
    expect(invocations).toBe(1)
  })
})

describe('call.mutate() — error handling', () => {
  test('throw in mutationFn keeps the dialog open and clears pending', async () => {
    const user = userEvent.setup()
    render(<Form />)

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    withAct(() =>
      Form.call(
        { message: 'go' },
        {
          mutationFn: async () => {
            throw new Error('nope')
          },
        },
      ),
    )

    await user.click(screen.getByRole('button', { name: /submit/i }))

    // After the rejected microtask flushes, pending resets and dialog stays.
    await waitFor(() => {
      expect(screen.getByRole('dialog').dataset.pending).toBe('false')
    })
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    errorSpy.mockRestore()
  })

  test('synchronous throw in mutationFn behaves the same as async throw', async () => {
    const user = userEvent.setup()
    render(<Form />)

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    withAct(() =>
      Form.call(
        { message: 'go' },
        {
          mutationFn: () => {
            throw new Error('sync nope')
          },
        },
      ),
    )

    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(screen.getByRole('dialog').dataset.pending).toBe('false')
    })
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    errorSpy.mockRestore()
  })
})

describe('call.mutate() — concurrency rules', () => {
  test('re-entrant mutate while pending is a no-op and warns in dev', async () => {
    // Fixture intentionally omits `disabled={call.pending}` so userEvent
    // can fire a second click on the still-enabled button — the test
    // covers the LIBRARY's re-entrancy guard, not the consumer's
    // `disabled` attribute (which is the recommended UX defence).
    type LeakyProps = { message: string }
    const LeakyComp: ReactCall.UserComponent<
      LeakyProps,
      boolean,
      Payload,
      {}
    > = ({ call, message }) => (
      <div role="dialog" aria-label={message}>
        <button type="button" onClick={() => call.mutate({ id: 'leak' })}>
          Submit
        </button>
      </div>
    )
    const Leaky = createCallable<LeakyProps, boolean, Payload>(LeakyComp)

    const user = userEvent.setup()
    render(<Leaky />)
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    let release!: () => void
    const inFlight = new Promise<void>((r) => {
      release = r
    })
    let invocations = 0

    const promise = withAct(() =>
      Leaky.call(
        { message: 'go' },
        {
          mutationFn: async (call) => {
            invocations++
            await inFlight
            call.end(true)
          },
        },
      ),
    )

    const button = screen.getByRole('button', { name: /submit/i })

    // First click starts the mutation (pending → true).
    await user.click(button)
    // Second click while pending — must be a no-op + dev warn.
    await user.click(button)
    // Third for good measure.
    await user.click(button)

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('a mutation is already pending'),
    )
    // mutationFn only ran once despite three clicks.
    expect(invocations).toBe(1)

    release()
    expect(await promise).toBe(true)
    warnSpy.mockRestore()
  })

  test('call.end() during a pending mutation ends immediately; mutationFns later end is a silent no-op', async () => {
    const user = userEvent.setup()
    render(<Form />)

    let release!: () => void
    const inFlight = new Promise<void>((r) => {
      release = r
    })

    const promise = withAct(() =>
      Form.call(
        { message: 'go' },
        {
          mutationFn: async (call) => {
            await inFlight
            // This end fires AFTER the external end below. Silent no-op.
            call.end(true)
          },
        },
      ),
    )

    await user.click(screen.getByRole('button', { name: /submit/i }))
    expect(screen.getByRole('dialog').dataset.pending).toBe('true')

    // External cancel wins.
    withAct(() => Form.end(promise, false))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    expect(await promise).toBe(false)

    // Let the still-running mutationFn complete; its `call.end(true)`
    // must NOT change the already-resolved value.
    release()
    expect(await promise).toBe(false)
  })
})

describe('call.mutate() — missing mutationFn', () => {
  test('warns in dev and is a no-op when no mutationFn was provided in CallOptions', async () => {
    const user = userEvent.setup()
    render(<Form />)
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    withAct(() => Form.call({ message: 'no fn' }))
    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('no mutationFn was provided'),
    )

    warnSpy.mockRestore()
  })
})

describe('CallOptions plumbing', () => {
  test('upsert() also accepts the options bag and runs the latest mutationFn', async () => {
    const user = userEvent.setup()
    render(<Form />)

    const seen: string[] = []

    withAct(() =>
      Form.upsert(
        { message: 'first' },
        {
          mutationFn: async (call) => {
            seen.push('first-fn')
            call.end(true)
          },
        },
      ),
    )

    // Second upsert overrides the mutationFn.
    withAct(() =>
      Form.upsert(
        { message: 'second' },
        {
          mutationFn: async (call) => {
            seen.push('second-fn')
            call.end(true)
          },
        },
      ),
    )

    await user.click(screen.getByRole('button', { name: /submit/i }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    expect(seen).toEqual(['second-fn'])
  })

  test('upsert() without options preserves the previously-set mutationFn', async () => {
    const user = userEvent.setup()
    render(<Form />)
    const seen: string[] = []

    withAct(() =>
      Form.upsert(
        { message: 'first' },
        {
          mutationFn: async (call) => {
            seen.push('first-fn')
            call.end(true)
          },
        },
      ),
    )

    // Second upsert without options — should keep the original mutationFn.
    withAct(() => Form.upsert({ message: 'second' }))

    await user.click(screen.getByRole('button', { name: /submit/i }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    expect(seen).toEqual(['first-fn'])
  })

  test('void Props: call(options) form (no props arg) routes options correctly', async () => {
    // biome-ignore lint/suspicious/noConfusingVoidType: matching the lib's `Props = void` default to exercise the void-Props ergonomic form
    type NoProps = void
    const NoPropsComp: ReactCall.UserComponent<
      NoProps,
      boolean,
      Payload,
      {}
    > = ({ call }) => (
      <div role="dialog" data-pending={String(call.pending)}>
        <button type="button" onClick={() => call.mutate({ id: 'noprops' })}>
          Submit
        </button>
      </div>
    )
    const NoPropsCallable = createCallable<NoProps, boolean, Payload>(
      NoPropsComp,
    )

    const user = userEvent.setup()
    render(<NoPropsCallable />)
    const seen: Payload[] = []

    const promise = withAct(() =>
      NoPropsCallable.call({
        mutationFn: async (call, payload) => {
          seen.push(payload)
          call.end(true)
        },
      }),
    )

    await user.click(screen.getByRole('button', { name: /submit/i }))
    expect(await promise).toBe(true)
    expect(seen).toEqual([{ id: 'noprops' }])
  })
})
