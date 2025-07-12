import { lazy } from 'react'
import { createCallable } from '../createCallable'
import type { UserComponent, Callable } from '../createCallable/types'

/**
 * Creates a lazy-loaded callable component
 * @param importFn - A function that returns a dynamic import promise
 * @param unmountingDelay - Optional delay before unmounting (passed to createCallable)
 * @returns A callable object with lazy-loaded component
 */
export function createLazyCallable<Props, Response, RootProps = {}>(
  importFn: () => Promise<{
    default: UserComponent<Props, Response, RootProps>
  }>,
  unmountingDelay?: number,
): Callable<Props, Response, RootProps> {
  const LazyComponent = lazy(importFn)
  return createCallable(LazyComponent, unmountingDelay)
}
