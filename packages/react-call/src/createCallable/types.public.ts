import type { FunctionComponent } from 'react'
import type { CallItemPublicProperties } from './store'

/**
 * The call() method
 */
export type CallFunction<Props, Response> = (props: Props) => Promise<Response>

/**
 * The upsert() method
 */
export type UpsertFunction<Props, Response> = (
  props: Props,
) => Promise<Response>

/**
 * The special call prop in UserComponent
 */
export type CallContext<Props, Response, RootProps> = CallItemPublicProperties<
  Props,
  Response
> & {
  root: RootProps
  index: number
  stackSize: number
}

/**
 * User props + the call prop
 */
export type PropsWithCall<Props, Response, RootProps> = Props & {
  call: CallContext<Props, Response, RootProps>
}

/**
 * What is passed to createCallable
 */
export type UserComponent<Props, Response, RootProps> = FunctionComponent<
  PropsWithCall<Props, Response, RootProps>
>

/**
 * What createCallable returns.
 *
 * The Callable is the Root component itself (so it can be used directly
 * as `<Confirm />` in JSX, or via `<Confirm.Root />` for backwards-compat —
 * `Confirm.Root === Confirm`). Imperative methods (`call`, `upsert`, `end`,
 * `update`) are properties on the same function. This dual shape makes the
 * export Fast-Refresh-compatible under vite-plugin-react. See ADR-0009.
 */
export type Callable<Props, Response, RootProps> =
  FunctionComponent<RootProps> & {
    Root: FunctionComponent<RootProps>
    call: CallFunction<Props, Response>
    upsert: UpsertFunction<Props, Response>
    end: ((promise: Promise<Response>, response: Response) => void) &
      ((response: Response) => void)
    update: ((promise: Promise<Response>, props: Partial<Props>) => void) &
      ((props: Partial<Props>) => void)
  }
