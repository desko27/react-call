import type { FunctionComponent } from 'react'
import type { CallItemPublicProperties } from './store'

/**
 * Narrow context passed to a `mutationFn` as its first arg. Kept
 * deliberately minimal (only `end`) — `pending` is always true while
 * the mutationFn runs, and `ended` is a marginal "bail after cancel"
 * signal that is additive if a real case appears.
 *
 * Object shape (not bare `end`) preserves space for future additions
 * (`signal`, `ended`, …) without breaking the public signature.
 */
export type MutationContext<Response> = {
  end: (response: Response) => void
}

/**
 * The shape of a `mutationFn` slot in `CallOptions`. Authored in
 * caller scope; closes over domain helpers (mutation hooks, alert
 * system, translations, …). The `payload` is only the modal's
 * contribution; "all variables" of the mutation come partly from
 * the closure.
 */
export type MutationFunction<MutationPayload, Response> = (
  call: MutationContext<Response>,
  payload: MutationPayload,
) => Promise<void> | void

/**
 * Options bag accepted as the optional second arg of `call()` and
 * `upsert()`. Extensible for future call-time options without
 * breaking the signature.
 */
export type CallOptions<MutationPayload, Response> = {
  mutationFn?: MutationFunction<MutationPayload, Response>
}

/**
 * Conditional tuple that hides the `props` slot when `Props = void`,
 * so consumers can write `Confirm.call({ mutationFn })` instead of
 * `Confirm.call(undefined, { mutationFn })`. Same flavour as the
 * tuple-union overloads on `end()` and `update()`.
 */
type CallArgs<Props, MutationPayload, Response> = Props extends void
  ? [options?: CallOptions<MutationPayload, Response>]
  : [props: Props, options?: CallOptions<MutationPayload, Response>]

/**
 * The call() method
 */
export type CallFunction<Props, Response, MutationPayload = void> = (
  ...args: CallArgs<Props, MutationPayload, Response>
) => Promise<Response>

/**
 * The upsert() method
 */
export type UpsertFunction<Props, Response, MutationPayload = void> = (
  ...args: CallArgs<Props, MutationPayload, Response>
) => Promise<Response>

/**
 * The special call prop in UserComponent
 */
export type CallContext<
  Props,
  Response,
  MutationPayload = void,
  RootProps = {},
> = CallItemPublicProperties<Props, Response, MutationPayload> & {
  root: RootProps
  index: number
  stackSize: number
}

/**
 * User props + the call prop
 */
export type PropsWithCall<
  Props,
  Response,
  MutationPayload = void,
  RootProps = {},
> = Props & {
  call: CallContext<Props, Response, MutationPayload, RootProps>
}

/**
 * What is passed to createCallable
 */
export type UserComponent<
  Props,
  Response,
  MutationPayload = void,
  RootProps = {},
> = FunctionComponent<
  PropsWithCall<Props, Response, MutationPayload, RootProps>
>

/**
 * What createCallable returns.
 *
 * The Callable is the Root component itself — mount it with `<Confirm />`
 * and use the imperative methods (`call`, `upsert`, `end`, `update`) as
 * properties on the same function. This dual shape makes the export
 * Fast-Refresh-compatible under vite-plugin-react. See ADR-0009.
 *
 * Generic positions (v2 BREAKING — see ADR-0014):
 *   <Props, Response, MutationPayload = void, RootProps = {}>
 *
 * `MutationPayload` sits in 3rd position because it's part of the
 * mainline mutation flow; `RootProps` (rarely customised) moves to 4th.
 */
export type Callable<
  Props,
  Response,
  MutationPayload = void,
  RootProps = {},
> = FunctionComponent<RootProps> & {
  /**
   * @deprecated Use `<Confirm />` directly — `Confirm.Root === Confirm`.
   * Kept as an alias for backwards compatibility; no removal date.
   * See ADR-0013.
   */
  Root: FunctionComponent<RootProps>
  call: CallFunction<Props, Response, MutationPayload>
  upsert: UpsertFunction<Props, Response, MutationPayload>
  end: ((promise: Promise<Response>, response: Response) => void) &
    ((response: Response) => void)
  update: ((promise: Promise<Response>, props: Partial<Props>) => void) &
    ((props: Partial<Props>) => void)
}
