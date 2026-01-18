import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useUserAuth } from './UserAuthContext'

interface UserProtectedRouteProps {
  children: ReactNode
}

export function UserProtectedRoute({ children }: UserProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useUserAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(location.pathname)}`} replace />
  }

  return <>{children}</>
}
