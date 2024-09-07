import { createCallable } from '#lib/main'

import { Dialog } from '../shared/Dialog'

export const YourDialog = createCallable<void, boolean>(
  ({ call }) => (
    <Dialog color="emerald" ended={call.ended}>
      <Dialog.Title>Code your UI component</Dialog.Title>
      <Dialog.Text>Let react-call provide the ergonomics 😉</Dialog.Text>
      <Dialog.Text>
        Return anything via{' '}
        <code className="text-fuchsia-400">call.end(value)</code> ↩️
      </Dialog.Text>
      <p className="text-sm/6 text-yellow-200/75">
        💡 *TIP* see console for full demo output
      </p>
      <Dialog.Actions>
        <Dialog.Button color="emerald" onClick={() => call.end(true)}>
          <code>⭕️ true</code>
        </Dialog.Button>
        <Dialog.Button
          color="emerald"
          hoverColor="red"
          onClick={() => call.end(false)}
        >
          <code>❌ false</code>
        </Dialog.Button>
      </Dialog.Actions>
    </Dialog>
  ),
  300,
)
