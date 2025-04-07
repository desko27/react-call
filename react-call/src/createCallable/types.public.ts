import type { CallItemPublicProperties } from './store'

/**
 * The call() method
 */
export type CallFunction<Props, Response> = (props: Props) => Promise<Response>

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
export type UserComponent<Props, Response, RootProps> = React.FunctionComponent<
  PropsWithCall<Props, Response, RootProps>
>

/**
 * The options passed to createCallable
 */
export type CreateCallableOptions = {
  unmountingDelay?: number
  allowMultipleRootsWarning?: boolean
}

/**
 * What createCallable returns
 */
export type Callable<Props, Response, RootProps> = {
  Root: React.FunctionComponent<RootProps>
  call: CallFunction<Props, Response>
  end: ((promise: Promise<Response>, response: Response) => void) &
    ((response: Response) => void)
  update: ((promise: Promise<Response>, props: Partial<Props>) => void) &
    ((props: Partial<Props>) => void)
}
