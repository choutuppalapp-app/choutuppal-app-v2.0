'use client'

import { SessionProvider } from 'next-auth/react'
import { ClientCacheProvider } from '@/components/providers/client-cache-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ClientCacheProvider>
        {children}
      </ClientCacheProvider>
    </SessionProvider>
  )
}

