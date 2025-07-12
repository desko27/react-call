import type { ReactCall } from 'react-call'
import { Dialog } from '../shared/Dialog'

export interface YourLazyProps {
  message: string
}

export type YourLazyResponse = 'confirmed' | 'cancelled'

// biome-ignore lint/style/noDefaultExport: React.lazy requires default export for lazy loading
export default function YourLazy({
  call,
  message,
}: ReactCall.Props<YourLazyProps, YourLazyResponse, Record<string, never>>) {
  return (
    <Dialog color="violet" ended={call.ended}>
      <Dialog.Title>Lazy Loaded Dialog 🚀</Dialog.Title>
      <Dialog.Text>{message}</Dialog.Text>
      <Dialog.Text>
        <span className="text-violet-200/75 italic">
          This component was loaded lazily using{' '}
          <code className="text-violet-300">createLazyCallable</code>!
        </span>
      </Dialog.Text>
      <p className="text-sm/6 text-yellow-200/75">
        💡 Check the Network tab to see it was loaded on demand
      </p>
      <Dialog.Actions>
        <Dialog.Button color="violet" onClick={() => call.end('confirmed')}>
          <code>✅ confirmed</code>
        </Dialog.Button>
        <Dialog.Button
          color="violet"
          hoverColor="red"
          onClick={() => call.end('cancelled')}
        >
          <code>❌ cancelled</code>
        </Dialog.Button>
      </Dialog.Actions>
    </Dialog>
  )
}
