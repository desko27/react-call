import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { createCallable } from '../createCallable'
import type * as ReactCall from '../types.public'
import { withAct } from './shared/act'

// Fixture purpose-built for the Root-props contract: the third generic
// (`RootProps`) is what `<Greeter.Root userName="..." />` accepts and what
// `call.root` exposes to each rendered UserComponent. The default `Confirm`
// fixture uses `RootProps = {}` so does not exercise this path.

type Props = { message: string }
type RootProps = { userName: string }

// v2 BREAKING (ADR-0014): RootProps moved from 3rd to 4th generic
// position. `void` in the 3rd slot is the MutationPayload default for
// callables that don't use the mutation primitive.
const GreeterComponent: ReactCall.UserComponent<
  Props,
  void,
  void,
  RootProps
> = ({ call, message }) => (
  <div role="dialog" aria-label={message}>
    <p>Hi {call.root.userName}!</p>
    <p>{message}</p>
    <button type="button" onClick={() => call.end()}>
      OK
    </button>
  </div>
)

const Greeter = createCallable(GreeterComponent)

describe('Root props (call.root)', () => {
  test('passes Root props through to call.root', () => {
    render(<Greeter.Root userName="Ismael" />)
    withAct(() => Greeter.call({ message: 'hello' }))
    expect(screen.getByText('Hi Ismael!')).toBeInTheDocument()
    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  test('Root prop changes re-render active calls with the new value', () => {
    const { rerender } = render(<Greeter.Root userName="Ismael" />)
    withAct(() => Greeter.call({ message: 'hello' }))
    expect(screen.getByText('Hi Ismael!')).toBeInTheDocument()

    rerender(<Greeter.Root userName="Desko" />)
    expect(screen.getByText('Hi Desko!')).toBeInTheDocument()
    // Same call still in the stack, only the Root prop projection changed.
    expect(screen.getByText('hello')).toBeInTheDocument()
  })
})
