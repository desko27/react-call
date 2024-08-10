export type CallFunction<P, R> = (props: P) => Promise<R>

export interface StackedCallContext<P, R> {
  key: string
  props: P
  end: (response: R) => void
}
export type CallContext<P, R> = Omit<StackedCallContext<P, R>, 'props'>

export type PropsWithCall<P, R> = P & { call: CallContext<P, R> }
export type CallableComponentArgument<P, R> = React.FunctionComponent<
  PropsWithCall<P, R>
>

export type CallableComponent<P, R> = {
  (): JSX.Element[]
  call: CallFunction<P, R>
}

export type StackState<P, R> = StackedCallContext<P, R>[]
export type StackStateSetter<P, R> = React.Dispatch<
  React.SetStateAction<StackState<P, R>>
>
