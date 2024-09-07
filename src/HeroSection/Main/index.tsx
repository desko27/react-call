import { useState } from 'react'

import { Heading } from './Heading'
import { CodeBlock } from './CodeBlock'
import { Action } from './Action'

export function Main(): JSX.Element {
  const [sceneName, setSceneName] = useState('YourNested')

  return (
    <main className="px-6 flex-grow flex flex-col items-center justify-center gap-y-10">
      <Heading />
      <CodeBlock componentName={sceneName} />
      <Action sceneName={sceneName} onNextScene={setSceneName} />
    </main>
  )
}
