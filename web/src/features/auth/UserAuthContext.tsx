/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type ReactNode } from 'react'
import { useCurrentUser, useUserLogout } from './userHooks'
import type { User } from './types'

interface UserAuthContextValue {
  user: User | null | undefined
  isLoading: boolean
  isAuthenticated: boolean
  logout: () => void
  isLoggingOut: boolean
}

const UserAuthContext = createContext<UserAuthContextValue | null>(null)

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading, error } = useCurrentUser()
  const logoutMutation = useUserLogout()

  const isAuthenticated = !!user && !error

  return (
    <UserAuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        isAuthenticated,
        logout: () => logoutMutation.mutate(),
        isLoggingOut: logoutMutation.isPending,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  )
}

export function useUserAuth() {
  const context = useContext(UserAuthContext)
  if (!context) {
    throw new Error('useUserAuth must be used within a UserAuthProvider')
  }
  return context
}
