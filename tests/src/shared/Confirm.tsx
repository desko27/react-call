import { useId } from 'react'
import { type ReactCall, createCallable } from 'react-call'

type Props = { message: string }

// biome-ignore lint/complexity/noBannedTypes: {}
const ConfirmComponent: ReactCall.UserComponent<Props, boolean, {}> = ({
  call,
  message,
}) => {
  const a11yId = useId()
  return (
    // biome-ignore lint/a11y/useSemanticElements: ok for tests
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
export const ConfirmMultipleRoots = createCallable(ConfirmComponent, {
  allowMultipleRootsWarning: true,
})
