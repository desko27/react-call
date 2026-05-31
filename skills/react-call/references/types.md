# TypeScript types

Most code never imports these — the generics on `createCallable<Props, Response,
RootProps>` flow through. Import the named types when splitting a component
declaration out of the `createCallable(...)` call.

```tsx
import type { UserComponent, CallContext } from 'react-call'
```

## Public types (named exports from `react-call`)

| Type | Description |
| --- | --- |
| `CallFunction<Props, Response>` | The `call()` method: `(props) => Promise<Response>`. |
| `UpsertFunction<Props, Response>` | The `upsert()` method (same shape as `call`). |
| `CallContext<Props, Response, RootProps>` | The `call` prop your component receives: `{ end, ended, key, index, stackSize, root }`. |
| `PropsWithCall<Props, Response, RootProps>` | Your `Props` plus the `call` prop. |
| `UserComponent<Props, Response, RootProps>` | What you pass to `createCallable` — `FunctionComponent<PropsWithCall<…>>`. |
| `Callable<Props, Response, RootProps>` | What `createCallable` returns — the Root component with `call`, `upsert`, `end`, `update` attached. |

From `react-call/mutation-flow`: `MutationFn<Response, Payload = void>`,
`MutationCall<Response>` (`{ end }`), `Trigger<Payload>`, and
`ChainTrigger<Payload, Response>` (the `.orEnd` variant when the MutationFn may be
undefined).

## CallContext shape

`call` exposes: `end(response)`, `ended` (boolean — true while the exit-animation
delay runs), `key` (stable per Call), `index` + `stackSize` (this Call's position
in the Stack), and `root` (the RootProps passed to `<Confirm />`).

## Splitting the declaration

```tsx
import { createCallable, type UserComponent } from 'react-call'

interface Props { message: string }
type Response = boolean

const ConfirmView: UserComponent<Props, Response> = ({ call, message }) => (
  <div role="dialog">{/* … */}</div>
)

export const Confirm = createCallable(ConfirmView)
```

## v1 → v2 migration

react-call v2 changed the public type surface. Migration is mechanical:

- **`<Confirm />` is the canonical Root.** `<Confirm.Root />` still works but is
  soft-deprecated (no removal date) — prefer the bare form.
- **Flat named exports replace the `ReactCall` namespace:**

  | v1 | v2 |
  | --- | --- |
  | `ReactCall.Function` | `CallFunction` |
  | `ReactCall.UpsertFunction` | `UpsertFunction` |
  | `ReactCall.Context` | `CallContext` |
  | `ReactCall.Props` | `PropsWithCall` |
  | `ReactCall.UserComponent` | `UserComponent` |
  | `ReactCall.Callable` | `Callable` |

- **`CallContext` no longer exposes `promise`, `resolve`, or `isUpsert`.** Replace
  `call.resolve(value)` with `call.end(value)`; the other two were internal.
- **The multi-Root error fires at `call()` time, not at mount** — tests that did
  `expect(() => render(<><Root/><Root/></>)).toThrow()` should assert at the
  `call()` site instead.
