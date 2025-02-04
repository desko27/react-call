export type Props = React.PropsWithChildren<{
  color: Color
  ended: boolean
}>

export type Color = 'emerald' | 'pink' | 'blue' | 'red' | 'violet' | 'yellow'
