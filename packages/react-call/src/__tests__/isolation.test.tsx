import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { createCallable } from '../createCallable'
import type * as ReactCall from '../types.public'
import { withAct } from './shared/act'

// Each createCallable() invocation builds an independent store (the
// closure captures fresh nextKey/stack/listeners/upsertPromise). This
// invariant is implicit in the factory pattern but never asserted — and
// is the difference between "two dialogs in an app" working and not.
// These tests pin it.

type Props = { message: string }

const makeDialogCallable = (instanceLabel: string) => {
  const Component: ReactCall.UserComponent<Props, void, {}> = ({
    call,
    message,
  }) => (
    <div
      role="dialog"
      aria-label={message}
      data-testid={`dialog-${instanceLabel}-${message}`}
    >
      <button type="button" onClick={() => call.end()}>
        OK
      </button>
    </div>
  )
  return createCallable(Component)
}

describe('Multiple createCallable instances are independent', () => {
  test('a call on instance A renders only inside A.Root, not B.Root', () => {
    const A = makeDialogCallable('a')
    const B = makeDialogCallable('b')
    render(
      <>
        <A.Root />
        <B.Root />
      </>,
    )

    withAct(() => A.call({ message: 'hello' }))

    expect(screen.getByTestId('dialog-a-hello')).toBeInTheDocument()
    expect(screen.queryByTestId('dialog-b-hello')).not.toBeInTheDocument()
  })

  test('each instance maintains its own independent stack', () => {
    const A = makeDialogCallable('a')
    const B = makeDialogCallable('b')
    render(
      <>
        <A.Root />
        <B.Root />
      </>,
    )

    withAct(() => {
      A.call({ message: 'a-only' })
      B.call({ message: 'b-only' })
    })

    expect(screen.getByTestId('dialog-a-a-only')).toBeInTheDocument()
    expect(screen.getByTestId('dialog-b-b-only')).toBeInTheDocument()
    // Crossed lookups must miss.
    expect(screen.queryByTestId('dialog-b-a-only')).not.toBeInTheDocument()
    expect(screen.queryByTestId('dialog-a-b-only')).not.toBeInTheDocument()
  })

  test('B.end() does not touch A', async () => {
    const A = makeDialogCallable('a')
    const B = makeDialogCallable('b')
    render(
      <>
        <A.Root />
        <B.Root />
      </>,
    )

    withAct(() => {
      A.call({ message: 'a-stays' })
      B.call({ message: 'b-goes' })
    })

    withAct(() => B.end())

    await waitFor(() => {
      expect(screen.queryByTestId('dialog-b-b-goes')).not.toBeInTheDocument()
    })
    expect(screen.getByTestId('dialog-a-a-stays')).toBeInTheDocument()
  })

  test('upsert state is per-instance: A.upsert returns its own promise, not shared with B', () => {
    const A = makeDialogCallable('a')
    const B = makeDialogCallable('b')
    render(
      <>
        <A.Root />
        <B.Root />
      </>,
    )

    const pa = withAct(() => A.upsert({ message: 'a1' }))
    const pb = withAct(() => B.upsert({ message: 'b1' }))

    expect(pa).not.toBe(pb)

    // A second upsert on A returns A's same promise (per-instance upsert state).
    const pa2 = withAct(() => A.upsert({ message: 'a2' }))
    expect(pa2).toBe(pa)
    // B's upsert state is independent — re-upserting on B returns B's promise.
    const pb2 = withAct(() => B.upsert({ message: 'b2' }))
    expect(pb2).toBe(pb)
    expect(pb2).not.toBe(pa2)
  })
})
