import { Greeter } from './callable'
import { AskButton } from './caller'

const RootContextExample = () => (
  <>
    {/* The Root carries data every call can read via call.root. */}
    <Greeter userName="Ada Lovelace" />
    <AskButton />
  </>
)

export default RootContextExample
