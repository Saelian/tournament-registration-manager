import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../features/auth'
import { Button, buttonVariants } from '../ui/button'
import { cn } from '../../lib/utils'

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { admin, logout, isLoggingOut } = useAuth()

  return (
    <div className="min-h-screen bg-grain">
      <header className="border-b-4 border-foreground bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          
          <div>
            <nav className="flex items-center gap-4">
              <NavLink
                to="/admin"
                end
                className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}
              >
                Accueil Administration
              </NavLink>
              <NavLink
                to="/admin/tournament"
                className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}
              >
                Tournoi
              </NavLink>
              <NavLink
                to="/admin/tables"
                className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}
              >
                Tableaux
              </NavLink>
              <NavLink
                to="/admin/sponsors"
                className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}
              >
                Sponsors
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
      <div className="bg-gradient-secondary-to-white min-h-[calc(100vh-76px)]">
        <main>{children}</main>
      </div>
    </div>
  )
}
