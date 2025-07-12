import { createLazyCallable } from 'react-call'
import type { YourLazyProps, YourLazyResponse } from './YourLazy'

// Create the lazy-loaded callable
export const YourLazy = createLazyCallable<YourLazyProps, YourLazyResponse>(
  () => import('./YourLazy'),
)
