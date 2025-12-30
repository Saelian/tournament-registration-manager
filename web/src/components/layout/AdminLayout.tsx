import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../features/auth'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { admin, logout, isLoggingOut } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-4 border-foreground bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold">Administration</h1>
            <nav className="flex items-center gap-4">
              <NavLink
                to="/admin/tournament"
                className={({ isActive }) =>
                  cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    isActive
                      ? 'text-foreground underline decoration-2 underline-offset-4'
                      : 'text-muted-foreground'
                  )
                }
              >
                Tournoi
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">{admin?.fullName}</span>
            <Button variant="secondary" size="sm" onClick={logout} disabled={isLoggingOut}>
              {isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}
            </Button>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
