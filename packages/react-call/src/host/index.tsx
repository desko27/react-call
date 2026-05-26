import type { ComponentType, ReactElement, ReactNode } from 'react'
import { type Root, createRoot } from 'react-dom/client'

// react-call/host — imperative mount for environments that render
// multiple isolated React subtrees in parallel for previewing
// (Storybook autodocs, Ladle, Histoire, react-cosmos). See ADR-0016.
// Mounting a Callable per-subtree from a decorator triggers the
// multi-root throw from ADR-0001; this helper mounts a single shared
// Root once via its own createRoot, outside the previewed subtrees.

export interface MountOptions {
  wrapper?: ComponentType<{ children: ReactNode }>
  container?: HTMLElement
}

interface HostState {
  root: Root
  container: HTMLElement
}

// Symbol.for keeps the cached host stable across module re-evaluations
// (HMR of the consumer's preview-annotations) so an open call survives
// edits. globalThis is the only storage that outlives module identity.
const HOST_KEY = Symbol.for('react-call.host')

const wrap = (
  element: ReactElement,
  Wrapper?: ComponentType<{ children: ReactNode }>,
): ReactElement => (Wrapper ? <Wrapper>{element}</Wrapper> : element)

const createHostContainer = (): HTMLElement => {
  const div = document.createElement('div')
  div.setAttribute('data-react-call-host', '')
  document.body.appendChild(div)
  return div
}

export function mount(element: ReactElement, options: MountOptions = {}): void {
  const store = globalThis as { [HOST_KEY]?: HostState }
  const cached = store[HOST_KEY]
  if (cached) {
    cached.root.render(wrap(element, options.wrapper))
    return
  }
  const container = options.container ?? createHostContainer()
  const root = createRoot(container)
  store[HOST_KEY] = { root, container }
  root.render(wrap(element, options.wrapper))
}
