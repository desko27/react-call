import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { createCallable } from '../createCallable'
import type { UserComponent } from '../createCallable/types.public'
import { withAct } from './shared/act'

// ADR-0009/0010/0011: in dev, the consumer's `Confirm.displayName =
// 'Confirm'` setter adopts a previously-registered store keyed by that
// name, so an open dialog survives Vite HMR re-evaluating the module.
// The setter is dev-only (gated on NODE_ENV !== 'production'); these
// tests run under NODE_ENV=test, so the whole block is live — assigning
// twice and expecting the first write to win actually proves it.

type Props = { message: string }

const dialog: UserComponent<Props, void, {}> = ({ call, message }) => (
  <div role="dialog" aria-label={message} data-testid={`dialog-${message}`}>
    <button type="button" onClick={() => call.end()}>
      OK
    </button>
  </div>
)

describe('HMR persistence registry — displayName setter', () => {
  test('the getter returns the assigned name and later writes are ignored', () => {
    const C = createCallable(dialog)
    C.displayName = 'NameWins'
    expect(C.displayName).toBe('NameWins')

    // First assignment wins; renaming mid-lifecycle is unsupported.
    C.displayName = 'Ignored'
    expect(C.displayName).toBe('NameWins')
  })

  test('a falsy displayName neither registers nor locks the name', () => {
    const C = createCallable(dialog)
    C.displayName = undefined
    expect(C.displayName).toBeUndefined()

    // Nothing was registered, so a real name still takes afterwards.
    C.displayName = 'TakesAfterFalsy'
    expect(C.displayName).toBe('TakesAfterFalsy')
  })

  test('a re-created callable adopts the store registered under the same name', () => {
    const A = createCallable(dialog)
    A.displayName = 'HmrPersist'
    render(<A />)

    // Simulate HMR: a brand-new createCallable (fresh local store, no
    // Root listener of its own) whose displayName setter then adopts
    // the store A registered — including A's still-mounted Root.
    const B = createCallable(dialog)
    B.displayName = 'HmrPersist'

    // The call only renders because B adopted A's store and its
    // listener; without adoption assertSingleRoot would throw
    // "No <Root> found!" against B's empty store.
    withAct(() => B.call({ message: 'via-b' }))
    expect(screen.getByTestId('dialog-via-b')).toBeInTheDocument()
  })
})
