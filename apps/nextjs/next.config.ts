import type { NextConfig } from 'next'

// Minimal repro of issue #39: createCallable in a `'use client'`
// module, mounted from a Server Component layout. Started from
// react-call@2.0.0-next.1 to verify ADR-0009's function-shape return
// + ADR-0013's bare-form recommendation fix the original RSC bug.
const config: NextConfig = {}

export default config
