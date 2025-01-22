export type PrivateResolve<Response> = (
  value: Response | PromiseLike<Response>,
) => void

export interface PrivateCallContext<Props, Response> {
  key: string
  props: Props
  promise: Promise<Response>
  resolve: PrivateResolve<Response>
  end: (response: Response) => void
  ended: boolean
}
export type PrivateStackState<Props, Response> = PrivateCallContext<
  Props,
  Response
>[]
export type PrivateStackStateSetter<Props, Response> = React.Dispatch<
  React.SetStateAction<PrivateStackState<Props, Response>>
>

/**
 * The call() method
 */
export type CallFunction<Props, Response> = (props: Props) => Promise<Response>

/**
 * The special call prop in UserComponent
 */
export type CallContext<Props, Response, RootProps> = Omit<
  PrivateCallContext<Props, Response>,
  'props'
> & { root: RootProps; index: number; stackSize: number }

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
 * What createCallable returns
 */
export type Callable<Props, Response, RootProps> = {
  Root: React.FunctionComponent<RootProps>
  call: CallFunction<Props, Response>
  end: (promise: Promise<Response>, response: Response) => void
}
