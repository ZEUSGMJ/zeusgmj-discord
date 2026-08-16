'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useLanyardPresence, type LoadState } from '@/hooks/use-lanyard-presence'

interface PresenceContextValue {
  state: LoadState
  userId: string | undefined
}

const PresenceContext = createContext<PresenceContextValue | null>(null)
const DISCORD_USER_ID = process.env.NEXT_PUBLIC_DISCORD_USER_ID

export function PresenceProvider({ children }: { children: ReactNode }) {
  const state = useLanyardPresence(DISCORD_USER_ID)

  return (
    <PresenceContext.Provider value={{ state, userId: DISCORD_USER_ID }}>
      {children}
    </PresenceContext.Provider>
  )
}

export function usePresence() {
  const context = useContext(PresenceContext)

  if (!context) {
    throw new Error('usePresence must be used within PresenceProvider')
  }

  return context
}
