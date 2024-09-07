import { useMemo } from 'react'
import { clsx } from 'clsx'
import { faker } from '@faker-js/faker'
import { createCallable } from '#lib/main'

import { Dialog } from '../shared/Dialog'

type FormData = { assignee: string; description: string }

export const YourChain = createCallable<{ n: number }, FormData>(
  ({ call, n }) => {
    const name = useMemo(() => faker.person.fullName(), [])
    const description = useMemo(() => faker.lorem.lines({ min: 1, max: 3 }), [])

    const handleSubmit: React.DOMAttributes<HTMLFormElement>['onSubmit'] = (
      event,
    ) => {
      event.preventDefault()
      const data = Object.fromEntries(
        // biome-ignore lint/suspicious/noExplicitAny: no need to deal with it
        new FormData(event.target as any),
      ) as FormData
      call.end(data)
    }

    return (
      <Dialog color="violet" ended={call.ended}>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <fieldset className="space-y-2">
            <div>
              <label className="text-sm/6 font-medium text-white">
                👤 Assignee
              </label>
              <input
                name="assignee"
                type="text"
                className={clsx(
                  'mt-2 block w-full rounded-lg border-none bg-white/5 py-1.5 px-3 text-sm/6 text-white',
                  'focus:outline-none focus:outline-2 focus:-outline-offset-2 focus:outline-white/25',
                )}
                defaultValue={name}
              />
            </div>
            <div>
              <label className="text-sm/6 font-medium text-white">
                ✍️ Description
              </label>
              <textarea
                name="description"
                className={clsx(
                  'mt-2 block w-full resize-none rounded-lg border-none bg-white/5 py-1.5 px-3 text-sm/6 text-white',
                  'focus:outline-none focus:outline-2 focus:-outline-offset-2 focus:outline-white/25',
                )}
                rows={3}
                defaultValue={description}
              />
            </div>
          </fieldset>
          <Dialog.Actions>
            <Dialog.Button color="violet" type="submit">
              🎟️ Create ticket #{n}
            </Dialog.Button>
          </Dialog.Actions>
        </form>
      </Dialog>
    )
  },
  300,
)
