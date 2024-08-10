export type CallFunction<P, R> = (props: P) => Promise<R>

export interface PrivateCallContext<P, R> {
  key: string
  props: P
  end: (response: R) => void
}
export type CallContext<P, R> = Omit<PrivateCallContext<P, R>, 'props'>

export type PropsWithCall<P, R> = P & { call: CallContext<P, R> }
export type UserComponent<P, R> = React.FunctionComponent<PropsWithCall<P, R>>

export type Callable<P, R> = {
  Root: React.FunctionComponent
  call: CallFunction<P, R>
}

export type PrivateStackState<P, R> = PrivateCallContext<P, R>[]
export type PrivateStackStateSetter<P, R> = React.Dispatch<
  React.SetStateAction<PrivateStackState<P, R>>
>
