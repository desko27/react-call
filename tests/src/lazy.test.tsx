import { lazy } from 'react'
import { describe, expect, it } from 'vitest'
import { createCallable, createLazyCallable } from 'react-call'

describe('createLazyCallable', () => {
  it('should create a lazy-loaded callable component', async () => {
    // Mock lazy-loaded component
    const LazyConfirm = createLazyCallable<{ message: string }, boolean>(
      () => import('./shared/ConfirmDefault'),
    )

    // Verify the callable has the expected methods
    expect(LazyConfirm).toHaveProperty('call')
    expect(LazyConfirm).toHaveProperty('upsert')
    expect(LazyConfirm).toHaveProperty('end')
    expect(LazyConfirm).toHaveProperty('update')
    expect(LazyConfirm).toHaveProperty('Root')
  })

  it('should work the same as createCallable with lazy', async () => {
    // Using createCallable with lazy
    const ManualLazyConfirm = createCallable(
      lazy(() => import('./shared/ConfirmDefault')),
    )

    // Using createLazyCallable
    const AutoLazyConfirm = createLazyCallable<{ message: string }, boolean>(
      () => import('./shared/ConfirmDefault'),
    )

    // Both should have the same structure
    expect(Object.keys(ManualLazyConfirm).sort()).toEqual(
      Object.keys(AutoLazyConfirm).sort(),
    )
  })

  it('should accept unmountingDelay parameter', async () => {
    const LazyConfirmWithDelay = createLazyCallable<
      { message: string },
      boolean
    >(
      () => import('./shared/ConfirmDefault'),
      500, // 500ms unmounting delay
    )

    expect(LazyConfirmWithDelay).toHaveProperty('call')
    expect(LazyConfirmWithDelay).toHaveProperty('Root')
  })
})
