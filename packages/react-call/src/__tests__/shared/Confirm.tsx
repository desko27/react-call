import { useId } from 'react'
import { createCallable } from '../../createCallable'
import type * as ReactCall from '../../types.public'

type Props = { message: string }

export const ConfirmComponent: ReactCall.UserComponent<Props, boolean> = ({
  call,
  message,
}) => {
  const a11yId = useId()
  return (
    <div role="dialog" aria-labelledby={a11yId}>
      <p id={a11yId}>{message}</p>
      <button type="button" onClick={() => call.end(true)}>
        Yes
      </button>
      <button type="button" onClick={() => call.end(false)}>
        No
      </button>
    </div>
  )
}

export const Confirm = createCallable(ConfirmComponent)
