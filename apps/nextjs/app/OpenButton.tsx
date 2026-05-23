'use client'

import { Confirm } from './Confirm'

export function OpenButton() {
  return (
    <button
      type="button"
      onClick={async () => {
        const ok = await Confirm.call({ message: 'Continue?' })
        console.log('response:', ok)
      }}
    >
      Open dialog
    </button>
  )
}
