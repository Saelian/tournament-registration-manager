import type { ReactNode } from 'react'
import { useAuth } from '../../features/auth'
import { Button } from '../ui/button'

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { admin, logout, isLoggingOut } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-4 border-foreground bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Administration</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">{admin?.fullName}</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={logout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}
            </Button>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
