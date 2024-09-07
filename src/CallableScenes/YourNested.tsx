import { useState, useRef, useEffect } from 'react'
import { createCallable } from '#lib/main'

import { Dialog } from '../shared/Dialog'

const DOM_LIMIT_TO_VIRTUALIZE = 20

export const YourNested = createCallable<
  {
    i: number
    onCallNested: (i: number) => void
    onEndNested: (i: number, res: string) => void
  },
  string
>(({ call, i, onCallNested, onEndNested }) => {
  const mountedRef = useRef(false)
  const [response, setResponse] = useState<string>()

  // biome-ignore lint/correctness/useExhaustiveDependencies: not necessary
  useEffect(() => {
    const isMounted = mountedRef.current
    mountedRef.current = true
    if (!isMounted) onCallNested(i)
  }, [])

  if (i < call.stackSize - DOM_LIMIT_TO_VIRTUALIZE) return null

  return (
    <Dialog color="pink" ended={call.ended}>
      <Dialog.Title>⚡️ Your nested modal #{i}</Dialog.Title>
      <Dialog.Text>
        Try opening/closing new ones as fast as you can!
      </Dialog.Text>
      <Dialog.Text>
        Child result:{' '}
        <code className="text-orange-400">
          {response ? `'${response}'` : '⏳'}
        </code>
      </Dialog.Text>
      <Dialog.Actions>
        <Dialog.Button
          shrink
          color="pink"
          onClick={() =>
            YourNested.call({ i: i + 1, onCallNested, onEndNested }).then(
              setResponse,
            )
          }
        >
          <code>{`YourNested.call({ i: ${i + 1} })`}</code>
        </Dialog.Button>
        <Dialog.Button
          color="pink"
          hoverColor="red"
          onClick={() => {
            const res = `closed #${i}`
            onEndNested(i, res)
            call.end(res)
          }}
        >
          Close
        </Dialog.Button>
      </Dialog.Actions>
    </Dialog>
  )
}, 300)
