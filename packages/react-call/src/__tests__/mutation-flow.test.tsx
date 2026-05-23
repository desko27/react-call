import { act, fireEvent, render, screen } from '@testing-library/react'
import { useId } from 'react'
import { describe, expect, test, vi } from 'vitest'
import { createCallable } from '../createCallable'
import { type MutationFn, useMutationFlow } from '../mutation-flow'
import type * as ReactCall from '../types.public'
import { withAct } from './shared/act'

// Component fixtures cover the two consumer patterns: a Required-handler
// dialog (the 2-arg overload, no fallback) and an Optional-handler dialog
// (the 3-arg overload, fallback required by the type system).

type RequiredProps = { mutationFn: MutationFn<boolean> }

const RequiredComponent: ReactCall.UserComponent<
  RequiredProps,
  boolean,
  {}
> = ({ call, mutationFn }) => {
  const a11yId = useId()
  const submit = useMutationFlow(call, mutationFn)
  return (
    <div role="dialog" aria-labelledby={a11yId}>
      <p id={a11yId}>Are you sure?</p>
      <button
        type="button"
        data-testid="submit"
        data-pending={submit.pending}
        disabled={submit.pending}
        onClick={() => submit()}
      >
        Yes
      </button>
      <button type="button" onClick={() => call.end(false)}>
        No
      </button>
    </div>
  )
}

const Required = createCallable(RequiredComponent)

type OptionalProps = { mutationFn?: MutationFn<boolean> }

const OptionalComponent: ReactCall.UserComponent<
  OptionalProps,
  boolean,
  {}
> = ({ call, mutationFn }) => {
  const submit = useMutationFlow(call, mutationFn, true)
  return (
    <button
      type="button"
      data-testid="submit"
      data-pending={submit.pending}
      disabled={submit.pending}
      onClick={() => submit()}
    >
      Yes
    </button>
  )
}

const Optional = createCallable(OptionalComponent)

type PayloadProps = { mutationFn: MutationFn<string, { choice: 'A' | 'B' }> }

const PayloadComponent: ReactCall.UserComponent<PayloadProps, string, {}> = ({
  call,
  mutationFn,
}) => {
  const submit = useMutationFlow(call, mutationFn)
  return (
    <>
      <button type="button" onClick={() => submit({ choice: 'A' })}>
        A
      </button>
      <button type="button" onClick={() => submit({ choice: 'B' })}>
        B
      </button>
    </>
  )
}

const Payload = createCallable(PayloadComponent)

describe('useMutationFlow — pending lifecycle', () => {
  test('pending flips true while the mutationFn is in-flight, false when it settles', async () => {
    let resolveMutation!: () => void
    const mutationFn = vi.fn<MutationFn<boolean>>(
      (call) =>
        new Promise<void>((resolve) => {
          resolveMutation = () => {
            call.end(true)
            resolve()
          }
        }),
    )

    render(<Required />)
    const promise = withAct(() => Required.call({ mutationFn }))

    fireEvent.click(screen.getByTestId('submit'))
    expect(screen.getByTestId('submit').dataset.pending).toBe('true')
    expect(screen.getByTestId('submit')).toBeDisabled()

    await act(async () => {
      resolveMutation()
    })

    await expect(promise).resolves.toBe(true)
  })

  test('thrown mutationFn keeps the dialog open and clears pending', async () => {
    const mutationFn = vi.fn<MutationFn<boolean>>(() =>
      Promise.reject(new Error('boom')),
    )

    render(<Required />)
    withAct(() => Required.call({ mutationFn }))

    await act(async () => {
      fireEvent.click(screen.getByTestId('submit'))
    })

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByTestId('submit').dataset.pending).toBe('false')
    expect(screen.getByTestId('submit')).not.toBeDisabled()
  })
})

describe('useMutationFlow — fallback (3-arg overload)', () => {
  test('submit() without a mutationFn closes the call with the fallback response', async () => {
    render(<Optional />)
    const promise = withAct(() => Optional.call({}))

    await act(async () => {
      fireEvent.click(screen.getByTestId('submit'))
    })

    await expect(promise).resolves.toBe(true)
  })

  test('submit() with a mutationFn still runs the managed flow, ignoring the fallback', async () => {
    const mutationFn = vi.fn<MutationFn<boolean>>(async (call) => {
      call.end(false)
    })

    render(<Optional />)
    const promise = withAct(() => Optional.call({ mutationFn }))

    await act(async () => {
      fireEvent.click(screen.getByTestId('submit'))
    })

    await expect(promise).resolves.toBe(false)
    expect(mutationFn).toHaveBeenCalledTimes(1)
  })
})

describe('useMutationFlow — re-entry guard', () => {
  test('a second submit() while pending is a no-op', async () => {
    let resolveMutation!: () => void
    const mutationFn = vi.fn<MutationFn<boolean>>(
      (call) =>
        new Promise<void>((resolve) => {
          resolveMutation = () => {
            call.end(true)
            resolve()
          }
        }),
    )

    render(<Required />)
    withAct(() => Required.call({ mutationFn }))

    fireEvent.click(screen.getByTestId('submit'))
    // The button is disabled by `submit.pending`, but the hook also
    // guards programmatic re-entry via a ref — fire a second event so
    // happy-dom dispatches it regardless of `disabled`.
    fireEvent.click(screen.getByTestId('submit'))

    expect(mutationFn).toHaveBeenCalledTimes(1)

    await act(async () => {
      resolveMutation()
    })
  })
})

describe('useMutationFlow — payload', () => {
  test('submit(payload) forwards the runtime payload to the mutationFn', async () => {
    const mutationFn = vi.fn<MutationFn<string, { choice: 'A' | 'B' }>>(
      async (call, payload) => {
        call.end(payload.choice)
      },
    )

    render(<Payload />)
    const promise = withAct(() => Payload.call({ mutationFn }))

    await act(async () => {
      fireEvent.click(screen.getByText('B'))
    })

    expect(mutationFn).toHaveBeenCalledWith(
      expect.objectContaining({ end: expect.any(Function) }),
      { choice: 'B' },
    )
    await expect(promise).resolves.toBe('B')
  })
})

describe('useMutationFlow — mid-call updates', () => {
  test('Callable.update can swap the mutationFn between submits', async () => {
    const first = vi.fn<MutationFn<boolean>>(async () => {
      throw new Error('first fails')
    })
    const second = vi.fn<MutationFn<boolean>>(async (call) => {
      call.end(true)
    })

    render(<Required />)
    const promise = withAct(() => Required.call({ mutationFn: first }))

    await act(async () => {
      fireEvent.click(screen.getByTestId('submit'))
    })
    expect(first).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    withAct(() => Required.update({ mutationFn: second }))

    await act(async () => {
      fireEvent.click(screen.getByTestId('submit'))
    })
    expect(second).toHaveBeenCalledTimes(1)
    await expect(promise).resolves.toBe(true)
  })
})

describe('useMutationFlow — external end during pending', () => {
  test('external Callable.end while pending closes the call; the still-running mutationFn ending later is a no-op', async () => {
    let resolveMutation!: (response: boolean) => void
    const mutationFn = vi.fn<MutationFn<boolean>>(
      (call) =>
        new Promise<void>((resolve) => {
          resolveMutation = (response) => {
            call.end(response)
            resolve()
          }
        }),
    )

    render(<Required />)
    const promise = withAct(() => Required.call({ mutationFn }))

    fireEvent.click(screen.getByTestId('submit'))

    withAct(() => Required.end(false))

    await expect(promise).resolves.toBe(false)

    // Even though the mutation later "succeeds" with true, the promise
    // is already resolved with the external end's value.
    await act(async () => {
      resolveMutation(true)
    })
    await expect(promise).resolves.toBe(false)
  })
})
