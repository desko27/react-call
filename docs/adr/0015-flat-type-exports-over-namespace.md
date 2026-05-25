# Public types are flat named exports, not a `ReactCall` namespace

Starting with 2.0, the public TypeScript types of the main entry are exported as flat named exports (`CallFunction`, `UpsertFunction`, `CallContext`, `PropsWithCall`, `UserComponent`, `Callable`) rather than aggregated under a `ReactCall` namespace via `export type * as ReactCall`. The change is a hard break under the ADR-0003 umbrella — no deprecated alias is kept, the namespace stops being exported in 2.0.

We chose this for three reasons. First, flat named exports are what the rest of the React/TS ecosystem ships (React Query, React Router, TanStack Table, Zustand) — the namespace pattern is more idiomatic in libraries where the namespace doubles as a runtime object (Zod's `z`, the `React` namespace), and ours doesn't. Second, the same package is already internally inconsistent: the `react-call/mutation-flow` subpath exports `MutationCall`, `MutationFn`, `Trigger`, `ChainTrigger` as flat names, so the namespace on the main entry was the outlier, not the convention. Third, the internal names defined in `createCallable/types.public.ts` (`CallFunction`, `CallContext`, `PropsWithCall`, etc.) already align with the canonical glossary in `CONTEXT.md` (`Callable`, `Call`, `CallContext`, `Upsert`); the namespace existed only to *rename* those internal names down to short forms like `Function`, `Context`, `Props` that would otherwise collide with built-in TypeScript types. Removing the namespace lets `internal === external`, eliminating one renaming layer (`src/types.public.ts`) entirely.

The migration is purely mechanical for consumers:

| Before (namespace) | After (flat) |
|---|---|
| `ReactCall.Function` | `CallFunction` |
| `ReactCall.UpsertFunction` | `UpsertFunction` |
| `ReactCall.Context` | `CallContext` |
| `ReactCall.Props` | `PropsWithCall` |
| `ReactCall.UserComponent` | `UserComponent` |
| `ReactCall.Callable` | `Callable` |

```ts
// Before
import { createCallable, type ReactCall } from 'react-call'
type Props = ReactCall.Props<MyProps, MyResponse>

// After
import { createCallable, type PropsWithCall } from 'react-call'
type Props = PropsWithCall<MyProps, MyResponse>
```

## Considered options

- **Keep the namespace (status quo).** Permits very short names (`Function`, `Context`, `Props`) without colliding with TS builtins, and offers a single-symbol import with autocompletion under `ReactCall.`. Rejected: modern editors auto-import flat names just as smoothly, the short-name argument is weak once internal names already exist with sensible prefixes, and staying with the namespace perpetuates the internal inconsistency with the `mutation-flow` subpath.
- **Keep `ReactCall` as a `@deprecated` alias during 2.x, remove in 3.0.** Smoother migration path. Rejected because (a) the migration is a trivial find-and-replace, (b) keeping the alias forces us to maintain the renaming layer (`Function`, `Context`, `Props` → internal names) for a whole major just for the deprecation path, and (c) ADR-0003 already establishes 2.0 as the umbrella for breaking API cleanups, so a soft path here would be inconsistent with the rest of the 2.0 changes.
- **Adopt a `Callable*` prefix systematically (`CallableFn`, `CallableContext`, `CallableProps`, `CallableComponent`).** Maximum branding consistency. Rejected on two grounds: `CallableFunction` is already defined in TypeScript's `lib.es5.d.ts`, so the prefix can't even be applied uniformly without abbreviating to `Fn`; and renaming `CallContext` to `CallableContext` would break alignment with the canonical glossary term in `CONTEXT.md`, which exists specifically to disambiguate from React's `Context`.
- **Hybrid (flat names but rename `PropsWithCall` → `CallableProps` and `UserComponent` → `CallableComponent`).** Slightly more consumer-friendly on the two weakest names. Rejected as bikeshedding: `CallableProps` is ambiguous (root props vs user props), and `UserComponent` is more precise than `CallableComponent` (which would read as "the component returned by createCallable" — i.e., the Root). Internal names are the right names.
- **Publish a codemod alongside the hard break.** Premium migration UX. Rejected as overkill for six types whose migration is a find-and-replace at every callsite. The codemod would be more code to maintain than the migration it automates.

## Consequences

- **`src/main.ts` re-exports the types flat**, directly from `./createCallable/types.public`. The `export type * as ReactCall from './types.public'` line is removed.
- **`src/types.public.ts` is deleted entirely.** It existed only as the renaming layer between the internal names and the namespace's short names. With internal === external, it has no purpose. Removing one file simplifies the public-surface map.
- **The `ReactCall` symbol disappears from the package's `.d.ts` output.** This is the only consumer-visible break; the runtime bundle is unaffected (types are erased). `attw` and `publint` are unaffected — both forms (`export type * as X` and flat `export type { ... }`) are equally valid.
- **Migration guidance ships in the 2.0 release notes and the README**: the mapping table from this ADR is reproduced in the README's "Upgrade from 1.x" section, and the changeset entry for this change links here. Consumers migrating from 1.x do one find-and-replace per type — no API semantics change.
- **`CONTEXT.md` is not modified by this ADR.** The glossary covers domain terms (`Callable`, `Call`, `CallContext`, `Upsert`, …), and the new flat type names already align with those terms. The decision about *how* those terms are exported as TS types is implementation detail and belongs in this ADR, not the glossary.
- **Internal test fixtures and the `<Confirm />` example components in `__tests__/shared/` migrate to flat imports.** Mechanical substitution following the table above; the lib eats its own dog food. Same precedent as ADR-0013, which migrated demos and tests after the public-surface decision landed.
- **The README's "Types" section table is rewritten** to list flat type names directly. The previous rendering as `ReactCall.X` rows is replaced with bare type names, and the "Upgrade from 1.x" section gains the mapping table.
- **Future public types added to the main entry follow this pattern** — flat named exports defined in `createCallable/` (or sibling module folders) and re-exported from `src/main.ts`. The convention now matches `react-call/mutation-flow`.
