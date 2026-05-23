import { act, render, screen } from '@testing-library/react'
import { Suspense, lazy } from 'react'
import { describe, expect, test } from 'vitest'
import { createCallable } from '../createCallable'
import { withAct } from './shared/act'
import { ConfirmComponent } from './shared/Confirm'

// The README's "Lazy loading" section explicitly teaches consumers to wrap
// the UserComponent in React.lazy and place the Root inside a <Suspense>
// boundary. This test pins that the pattern works end-to-end: no calls
// means no suspension, the first call triggers suspension (because the
// lazy chunk has not resolved yet), and resolving the lazy import renders
// the actual dialog.

function makeLazyConfirm() {
  // Capture the resolver so the test controls when the lazy chunk "arrives".
  let resolveLazy!: () => void
  const lazyImport = new Promise<{ default: typeof ConfirmComponent }>(
    (resolve) => {
      resolveLazy = () => resolve({ default: ConfirmComponent })
    },
  )
  const LazyConfirm = createCallable(lazy(() => lazyImport))
  return { LazyConfirm, resolveLazy: () => resolveLazy() }
}

describe('Lazy loading', () => {
  test('Root with no calls does not suspend (no fallback rendered)', () => {
    const { LazyConfirm } = makeLazyConfirm()
    render(
      <Suspense fallback={<div data-testid="fallback">loading</div>}>
        <LazyConfirm />
      </Suspense>,
    )
    expect(screen.queryByTestId('fallback')).not.toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  test('first call suspends, then the resolved chunk renders the dialog', async () => {
    const { LazyConfirm, resolveLazy } = makeLazyConfirm()
    render(
      <Suspense fallback={<div data-testid="fallback">loading</div>}>
        <LazyConfirm />
      </Suspense>,
    )

    withAct(() => LazyConfirm.call({ message: 'lazy hello' }))

    // Suspense fallback shows while the lazy chunk is still pending.
    expect(screen.getByTestId('fallback')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    // Resolve the lazy import; React replaces the fallback with the real tree.
    await act(async () => {
      resolveLazy()
    })

    expect(screen.queryByTestId('fallback')).not.toBeInTheDocument()
    expect(
      screen.getByRole('dialog', { name: 'lazy hello' }),
    ).toBeInTheDocument()
  })
})
