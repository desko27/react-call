import type { Metadata } from 'next'
import { Confirm } from './Confirm'

export const metadata: Metadata = {
  title: 'react-call Next.js / RSC playground',
}

// SERVER COMPONENT (no `'use client'`). This is the exact shape
// from issue #39: layout.tsx renders the Callable mount from a
// Server Component context, with the Callable imported from a
// `'use client'` module.
//
// ADR-0013 form (`<Confirm />`): expected to work because the bare
// component IS the client reference Next.js can render.
//
// Original form (`<Confirm.Root />`): expected to fail with
// "Unsupported Server Component type: undefined" because property
// access on a client reference resolves to undefined.
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Confirm />
      </body>
    </html>
  )
}
