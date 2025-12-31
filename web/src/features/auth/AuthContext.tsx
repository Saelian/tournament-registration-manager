/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type ReactNode } from 'react'
import { useCurrentAdmin, useLogout } from './hooks'
import type { Admin } from './types'

interface AuthContextValue {
  admin: Admin | null | undefined
  isLoading: boolean
  isAuthenticated: boolean
  logout: () => void
  isLoggingOut: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: admin, isLoading, error } = useCurrentAdmin()
  const logoutMutation = useLogout()

  const isAuthenticated = !!admin && !error

  return (
    <AuthContext.Provider
      value={{
        admin: admin ?? null,
        isLoading,
        isAuthenticated,
        logout: () => logoutMutation.mutate(),
        isLoggingOut: logoutMutation.isPending,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
