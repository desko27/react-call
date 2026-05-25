---
"react-call": major
---

**Public types are exported as flat named exports instead of under the `ReactCall` namespace** (ADR-0015). The `ReactCall` namespace is removed in 2.0 with no deprecated alias — migration is a mechanical find-and-replace:

```ts
// Before
import { createCallable, type ReactCall } from 'react-call'
type MyProps = ReactCall.Props<MyInput, MyResponse>

// After
import { createCallable, type PropsWithCall } from 'react-call'
type MyProps = PropsWithCall<MyInput, MyResponse>
```

Mapping:

| Before | After |
| --- | --- |
| `ReactCall.Function` | `CallFunction` |
| `ReactCall.UpsertFunction` | `UpsertFunction` |
| `ReactCall.Context` | `CallContext` |
| `ReactCall.Props` | `PropsWithCall` |
| `ReactCall.UserComponent` | `UserComponent` |
| `ReactCall.Callable` | `Callable` |

This aligns the main entry with the `react-call/mutation-flow` subpath (which already exports flat names like `MutationCall`, `MutationFn`, `Trigger`) and with the convention of the broader React/TS ecosystem (React Query, React Router, TanStack Table). No runtime change — types are erased at compile time; the JS bundle is unaffected.
