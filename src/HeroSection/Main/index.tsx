import { Heading } from './Heading'
import { CodeBlock } from './CodeBlock'
import { Action } from './Action'

export function Main(): JSX.Element {
  return (
    <main className="px-6 flex-grow flex flex-col items-center justify-center gap-y-10">
      <Heading />
      <CodeBlock />
      <Action />
    </main>
  )
}
