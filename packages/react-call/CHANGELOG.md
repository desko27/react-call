# react-call

## 2.0.0-next.6

### Minor Changes

- 2e72674: **New `react-call/host` subpath export** — an imperative `mount(element, options?)` helper for environments that render multiple isolated React subtrees in parallel for previewing (Storybook autodocs page, Ladle, Histoire, react-cosmos). Mounts a single shared Root in a body-level `<div data-react-call-host>` via its own `createRoot`, sidestepping the multi-root call-time throw that decorator-per-story patterns otherwise hit.

  ```tsx
  // .storybook/preview.tsx
  import { mount } from "react-call/host";
  import { Confirm } from "../src/Confirm";

  mount(<Confirm />);
  ```

  Options:

  - `wrapper?: ComponentType<{ children: ReactNode }>` — wraps the rendered element in providers (theme, i18n, router). The wrapper runs inside the Confirm's own React tree, so context from story decorators does **not** propagate; for reactive providers tied to host state (e.g. Storybook globals), subscribe inside the wrapper via `useGlobals` from `@storybook/preview-api` or an external store.
  - `container?: HTMLElement` — mount target; defaults to a fresh `<div data-react-call-host>` appended to `document.body`.

  Idempotent under HMR: subsequent `mount()` calls re-render against the cached root (kept on `globalThis[Symbol.for('react-call.host')]`) rather than creating a second one, so an open `Confirm.call()` survives edits to `preview.tsx`.

  Adds `react-dom` as an optional peer dependency (mirrors the `vite` optional peer). Consumers who don't import `react-call/host` see no install change.

  See [ADR-0016](https://github.com/desko27/react-call/blob/main/docs/adr/0016-react-call-host-imperative-mount.md) for the design discussion.

## 2.0.0-next.5

### Patch Changes

- 86df7d7: `useMutationFlow` no longer swallows throws from the user's `mutationFn` ([ADR-0016](docs/adr/0016-mutation-flow-propagates-throws.md)). A rejected `mutationFn` now propagates as a normal unhandled promise rejection — visible in the dev console, observable by `window.addEventListener('unhandledrejection', ...)` and by telemetry tools (Sentry, Datadog) that hook into it.

  The hook's state-machine contract is unchanged: `.finally` still clears `pending` and the in-flight guard on both fulfillment and rejection, so the trigger remains retry-ready. The dialog still stays open when a `mutationFn` doesn't reach `call.end()` — that has always been a property of the Call/Stack lifecycle, not of the swallow.

  If you want to react to a `mutationFn` failure (surface a toast, route to Sentry, etc.), wrap the body in `try/catch`:

  ```ts
  mutationFn: async (call) => {
    try {
      await api.delete(id);
      call.end(true);
    } catch (e) {
      toast.error(e);
      Sentry.captureException(e);
      // no call.end → dialog stays open for retry
    }
  };
  ```

  Only relevant if you adopted `useMutationFlow` from `2.0.0-next.3` onwards. The 1.x line never had the hook.

## 2.0.0-next.4

### Major Changes

- a4cce68: **Public types are exported as flat named exports instead of under the `ReactCall` namespace** (ADR-0015). The `ReactCall` namespace is removed in 2.0 with no deprecated alias — migration is a mechanical find-and-replace:

  ```ts
  // Before
  import { createCallable, type ReactCall } from "react-call";
  type MyProps = ReactCall.Props<MyInput, MyResponse>;

  // After
  import { createCallable, type PropsWithCall } from "react-call";
  type MyProps = PropsWithCall<MyInput, MyResponse>;
  ```

  Mapping:

  | Before                     | After            |
  | -------------------------- | ---------------- |
  | `ReactCall.Function`       | `CallFunction`   |
  | `ReactCall.UpsertFunction` | `UpsertFunction` |
  | `ReactCall.Context`        | `CallContext`    |
  | `ReactCall.Props`          | `PropsWithCall`  |
  | `ReactCall.UserComponent`  | `UserComponent`  |
  | `ReactCall.Callable`       | `Callable`       |

  This aligns the main entry with the `react-call/mutation-flow` subpath (which already exports flat names like `MutationCall`, `MutationFn`, `Trigger`) and with the convention of the broader React/TS ecosystem (React Query, React Router, TanStack Table). No runtime change — types are erased at compile time; the JS bundle is unaffected.

## 2.0.0-next.3

### Minor Changes

- 9b56279: - **New `react-call/mutation-flow` subpath entry** — `useMutationFlow(call, mutationFn)` is an opt-in hook that wraps the canonical async-submission flow (click → run async → keep open on failure, end on success). The main `react-call` entry stays unchanged: bundle size and API surface of `createCallable` / `CallContext` are not affected. Consumers who never import the subpath pay zero.

  ```tsx
  import { createCallable } from "react-call";
  import { useMutationFlow, type MutationFn } from "react-call/mutation-flow";

  type Props = { mutationFn: MutationFn<boolean> };

  export const Confirm = createCallable<Props, boolean>(
    ({ call, mutationFn }) => {
      const submit = useMutationFlow(call, mutationFn);
      return (
        <button disabled={submit.pending} onClick={() => submit()}>
          Yes
        </button>
      );
    }
  );

  await Confirm.call({
    mutationFn: async (call) => {
      try {
        await api.delete(id);
        call.end(true);
      } catch (e) {
        toast.error(e); // dialog stays open, pending clears
      }
    },
  });
  ```

  The `mutationFn` receives a narrow `MutationCall<Response>` view (`{ end }`) — no `RootProps` ever leaks into the handler's signature. Throws are swallowed by the trigger so the call stays open for retry; the handler decides when (if ever) to `call.end()`.

  When the `mutationFn` parameter is typed as possibly-undefined, `submit(payload)` returns a chain object whose `.orEnd(value)` closes the call with a fallback at the callsite — `submit().orEnd(true)`. Each button can chain its own value (Picker: `.orEnd('A')` / `.orEnd('B')`). Omitting the chain is also valid: the call stays open until something else closes it.

  See [ADR-0014](docs/adr/0014-mutation-flow-as-composition-hook.md) for the design rationale and the trade-off versus making this a primitive on `CallContext`.

  - **Exports**: `MutationFn`, `MutationCall`, `Trigger`, `ChainTrigger`, `useMutationFlow` from `react-call/mutation-flow`.

## 2.0.0-next.2

### Patch Changes

- 37d7b7d: Fix React's `"The result of getServerSnapshot should be cached to avoid an infinite loop"` warning logged on every render in any SSR consumer (Next.js App Router included).

  `createStackStore`'s `getServerSnapshot` returned a fresh `[]` each call, so `useSyncExternalStore`'s `Object.is` comparison always reported "changed" and React entered the recovery path. Fixed by returning a single stable empty-stack reference per store. No runtime behaviour change for client-only consumers (Vite CSR, CRA, etc.) — they never touched the SSR snapshot path.

  Surfaced by the new `apps/nextjs/` playground introduced in the same release; shipped briefly in `2.0.0-next.1`.

## 2.0.0-next.1

### Major Changes

- a64c1a3: Breaking changes for 2.0:

  - **`"Multiple instances of <Root> found!"` now fires at `call()` time instead of at Root mount time** (ADR-0001). This makes the error compatible with `React.lazy`-wrapped Roots inside `<Suspense>` boundaries, React StrictMode's double-invoke, and HMR re-mounts — all patterns that briefly create transient second listeners that aren't real consumer errors. Migration: any test of the form `expect(() => render(<><Root /><Root /></>)).toThrow(...)` should now assert the throw at the `call()` site instead.

  - **`CallContext` (the `call` prop your UserComponent receives) no longer leaks three internal fields** that 1.8.x exposed by accident: `promise`, `resolve`, and `isUpsert`. The public surface is now exactly `{ key, end, ended, root, index, stackSize }`. Migration:
    - Replace `call.resolve(value)` with `call.end(value)`.
    - `call.promise` and `call.isUpsert` have no public-API equivalent — they were never meant to be touched.

### Minor Changes

- a64c1a3: - **HMR persistence under Vite Fast Refresh.** `createCallable` now keeps active calls (open dialogs, in-flight upserts) alive across saves of the consumer's module. Persistence is gated on a `displayName` set on the returned Callable:

  ```tsx
  export const Confirm = createCallable((props) => {
    /* ... */
  });
  Confirm.displayName = "Confirm";
  ```

  Callables without a `displayName` still HMR — only the dialog being edited resets. The new [`react-call/vite`](#) plugin automates the `displayName` assignment.

  - **`Callable.Root` is deprecated** (no removal date). Both `<Confirm />` and `<Confirm.Root />` mount the same component since the Callable IS its own Root component. The deprecation is marked via JSDoc on the type, so editors surface a strikethrough; the property keeps working forever for backwards compatibility.

  - **The `Callable<P, R, RP>` type widened** from `{ Root, call, upsert, end, update }` to `FunctionComponent<RP> & { Root, call, upsert, end, update }`. This is additive — existing code using `<Confirm.Root />` keeps working unchanged. A consumer who hand-constructed a `Callable<...>` literal (rare) will get a type error because their literal is not a function; the fix is to use `createCallable()`, which is the only supported way to produce a `Callable`.

- a64c1a3: **New `react-call/vite` subpath export** — a Vite plugin that auto-injects `<Callable>.displayName = '<Callable>'` for every top-level `(export) const X = createCallable(...)` it finds in dev mode. With the plugin enabled, the natural form

  ```tsx
  export const Confirm = createCallable((props) => {
    /* ... */
  });
  ```

  keeps HMR persistence working without the manual displayName line.

  Enable from `vite.config.ts`:

  ```ts
  import react from "@vitejs/plugin-react";
  import reactCall from "react-call/vite";

  export default {
    plugins: [react(), reactCall()],
  };
  ```

  Dev-only — no production bundle overhead. Strict detection (only top-level `(export) const` with `createCallable` imported by name from `'react-call'`, optionally renamed). Skips files that already set `displayName` manually. Requires `vite >= 8` (optional peer dependency — the runtime library itself has no Vite dependency).

## 1.8.2

### Patch Changes

- Fix upsert promise when ending externally

## 1.8.0

### Minor Changes

- Component.upsert()

## 1.7.0

### Minor Changes

- Batch end/update methods

## 1.6.1

### Patch Changes

- Accept partial props in update method

## 1.6.0

### Minor Changes

- Component.update()

## 1.5.0

### Minor Changes

- Component.end()

## 1.4.0

### Minor Changes

- call.index, call.stackSize

## 1.3.0

### Minor Changes

- Exit Animations

## 1.2.0

### Minor Changes

- CJS Support

## 1.1.0

### Minor Changes

- RootProps
