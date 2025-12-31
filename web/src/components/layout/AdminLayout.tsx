import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { useAuth } from '../../features/auth'
import { Button, buttonVariants } from '../ui/button'
import { cn } from '../../lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { admin, logout, isLoggingOut } = useAuth()

  return (
    <div className="min-h-screen bg-grain">
      <header className="border-b-4 border-foreground bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">

          {/* Navigation desktop */}
          <div className="hidden md:block">
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

          {/* Menu burger mobile */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <NavLink to="/admin" end className="w-full cursor-pointer">
                    Accueil Administration
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <NavLink to="/admin/tournament" className="w-full cursor-pointer">
                    Tournoi
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <NavLink to="/admin/tables" className="w-full cursor-pointer">
                    Tableaux
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <NavLink to="/admin/sponsors" className="w-full cursor-pointer">
                    Sponsors
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-muted-foreground text-xs">
                  {admin?.fullName}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={logout}
                  disabled={isLoggingOut}
                  className="cursor-pointer"
                >
                  {isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="hidden md:flex items-center gap-4">
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
