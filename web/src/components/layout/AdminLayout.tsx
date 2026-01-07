import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Menu,
  Home,
  Trophy,
  LayoutGrid,
  ClipboardList,
  Heart,
  LogOut,
  CreditCard,
  UserCheck,
} from 'lucide-react'
import { useAuth } from '../../features/auth'
import { Button } from '../ui/button'
import { NavItem } from '../ui/nav-item'
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
              <NavItem to="/admin" label="Accueil Administration" icon={Home} end />
              <NavItem to="/admin/tournament" label="Tournoi" icon={Trophy} />
              <NavItem to="/admin/tables" label="Tableaux" icon={LayoutGrid} />
              <NavItem to="/admin/registrations" label="Inscriptions" icon={ClipboardList} />
              <NavItem to="/admin/payments" label="Paiements" icon={CreditCard} />
              <NavItem to="/admin/checkin" label="Pointage" icon={UserCheck} />
              <NavItem to="/admin/sponsors" label="Sponsors" icon={Heart} />
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
                    <Home className="h-4 w-4" />
                    Accueil Administration
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <NavLink to="/admin/tournament" className="w-full cursor-pointer">
                    <Trophy className="h-4 w-4" />
                    Tournoi
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <NavLink to="/admin/tables" className="w-full cursor-pointer">
                    <LayoutGrid className="h-4 w-4" />
                    Tableaux
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <NavLink to="/admin/registrations" className="w-full cursor-pointer">
                    <ClipboardList className="h-4 w-4" />
                    Inscriptions
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <NavLink to="/admin/payments" className="w-full cursor-pointer">
                    <CreditCard className="h-4 w-4" />
                    Paiements
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <NavLink to="/admin/checkin" className="w-full cursor-pointer">
                    <UserCheck className="h-4 w-4" />
                    Pointage
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <NavLink to="/admin/sponsors" className="w-full cursor-pointer">
                    <Heart className="h-4 w-4" />
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
                  <LogOut className="h-4 w-4" />
                  {isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm font-medium">{admin?.fullName}</span>
            <Button variant="secondary" size="sm" onClick={logout} disabled={isLoggingOut}>
              <LogOut className="h-4 w-4" />
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
